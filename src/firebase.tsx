import * as firebase from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  DocumentData,
  UpdateData,
  Timestamp,
  setDoc as firebaseSetDoc,
  getDoc as firebaseGetDoc,
  WriteBatch,
  writeBatch,
  updateDoc as firebaseUpdateDoc,
  WhereFilterOp,
  getDocs,
  query,
  where,
  QueryConstraint,
  orderBy,
  QuerySnapshot,
  deleteDoc,
  startAt,
  endAt,
  Query,
} from "firebase/firestore";
import { sleep } from "./lib/1/util";

export type WHERE = [string, WhereFilterOp, any];

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
	measurementId: process.env.REACT_MEASUREMENT_ID,
};

firebase.initializeApp(firebaseConfig);

/** firebase/auth */
export const auth = getAuth();
/** firebase/firestore */
export const firestore = getFirestore();

let batch: WriteBatch;
let batchCount = 0;
const MaxBatchNum = 150;

export async function signIn(email: string, password: string) {
  const result = await signInWithEmailAndPassword(auth, email, password)
  console.log(result);
  return result;
}

export function getFirestoreRandomId(collectionPath: string) {
  const collectionRef = collection(firestore, collectionPath);
  const docRef = doc(collectionRef);
  const id = docRef.id;

  return id;
}

async function runFirestoreAPI<T>(caller: string, api: () => Promise<T>) {
  const maxTry = 3;
  let countTry = 0;

  while (countTry < maxTry) {
    try {
      // 없으면 만들고 있으면 덮어쓴다.
      countTry++;
      // this.logService[countTry < 2 ? 'info' : 'error'](`[${caller}] countTry = ${countTry}, diffTime = ${diffTimestamp(caller)}`);

      // DEADLINE_EXCEEDED 방지를 위해
      // await timeMargin(caller, 500);
      return api();
      // await docRef.set(doc, { merge: bMerge });
      // 성공한 경우에는 루프를 빠져나간다.
    } catch (error: any) {
      // 마지막 try에서의 throw 처리는 아래에서 수행한다.
      // 2: "details": "Stream removed"
      // 4: DEADLINE_EXCCEDED
      // 10: "details": "Too much contention on these documents. Please try again."
      // 13: "details": ""
      // 13: "details": "An internal error occurred."
      // 14: "details": "The service is temporarily unavailable. Please retry with exponential backoff."
      // 14: "details": "Transport closed"
      // 14: "details": "GOAWAY received"
      if (countTry < maxTry && [2, 4, 10, 13, 14].includes(error.code)) {
        // this.logService.error(`[${caller}] error at countTry = ${countTry}, error = ${JSON.stringify(error, undefined, 2)}`);
        await sleep(2000);
        continue;
      }

      // this.logService.error(`[${caller}] Give Up. Should the page be reloaded???. countTry = ${countTry}, error = ${JSON.stringify(error, undefined, 2)}`);
      throw error;
    }
  }

  // typescript에서 return undefined로 인지하지 못 하도록
  throw new Error('Unexpected reach');
}

/**
 * 지정한 collection에 doc을 추가한다
 * documennt Id는 자동생한다.
 *
 * bMerge의 경우에 doc이 다음과 같다면
 * ```
 * k1: {
 *  k2: v1
 * }
 * ```
 * k1을 전체 업데이트 하는 것이 아니라 k1.k2만을 업데이트 하거나 추가한다는 사실을 명심해야 한다.
 * k1.k3와 같은 키가 있다면 유지되는 것이다. path의 개념으로 이해해야 한다.
 *
 * 특정 필드를 삭제하려면 다음과 같은 특별한 값을 지정해야 한다.
 * `deletingKey: admin.firestore.FieldValue.delete()`
 *
 * refer : https://cloud.google.com/nodejs/docs/reference/firestore/0.20.x/DocumentReference
 *
 * - options.idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
 * - options.bMerge = true: true이면 지정한 필드만 업데이트한다.
 * - options.addMetadata = true: _id, _timeUpdate 필드를 자동으로 생성한다.
 * - options.bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
 */
export async function setDoc(collectionPath: string, id: string | undefined, docData: DocumentData, options?: {
  idAsField?: boolean,
  bMerge?: boolean,
  addMetadata?: boolean,
  bBatch?: boolean
}) {
  const fnName = 'setDoc';

  const { idAsField = false, bMerge = true, addMetadata = true, bBatch = false } = options ?? {};

  if (idAsField && (id === undefined || docData[id] === undefined)) {
    throw new TypeError(`'${id}' field does not exist in doc`);
  }

  const collectionRef = collection(firestore, collectionPath);

  const docRef = id === undefined
    ? doc(collectionRef) :
    idAsField
      ? doc(firestore, `${collectionPath}/${docData[id]}`)
      : doc(firestore, `${collectionPath}/${id}`);

  recoverTimestamp(docData);

  // metadata 추가
  if (addMetadata) {
    docData._timeUpdate = Timestamp.now();
    docData._id = docRef.id;
  }

  try {
    if (bBatch) {
      batch.set(docRef, docData, { merge: bMerge });
      await batchAdded();
    } else {
      await runFirestoreAPI(fnName, () => firebaseSetDoc(docRef, docData, { merge: bMerge }));
    }
  } catch (error) {
    // this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    console.error(error);
    throw error;
  }

  return docRef.id;
}

/**
 * 동일 document path에 이미 존재하는 경우에는 에러
 *
 * @params collectionPath
 * @params id
 * @params doc
 * @params options
 * - idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
 * - addMetadata = true: _id, _timeCreate 필드를 자동으로 생성한다.
 * - bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
 */
export async function createDoc(collectionPath: string, id: string | undefined, docData: DocumentData, options?: {
  idAsField?: boolean,
  addMetadata?: boolean,
  bBatch?: boolean
}) {
  const fnName = 'createDoc';
  const { idAsField = false, addMetadata = true, bBatch = false } = options ?? {};

  if (idAsField && (id === undefined || docData[id] === undefined)) {
    throw new TypeError(`'${id}' field does not exist in doc`);
  }

  const collectionRef = collection(firestore, collectionPath);

  const docRef = id === undefined
    ? doc(collectionRef) :
    idAsField
      ? doc(firestore, `${collectionPath}/${docData[id]}`)
      : doc(firestore, `${collectionPath}/${id}`);

  recoverTimestamp(docData);

  // metadata 추가
  if (addMetadata) {
    docData._id = docRef.id;
    docData._timeCreate = Timestamp.now();
  }

  const getDocData = await firebaseGetDoc(docRef);

  if (getDocData.exists()) {
    // this.logService.error(`[${fnName}] ${collectionPath}:${JSON.stringify(docData)}, 이미 존재하는 Doc`);
    throw new Error('이미 존재하는 doc');
  }

  try {
    // 혹시 이미 존재하는 doc이면 merge 해준다.
    if (bBatch) {
      batch.set(docRef, docData, { merge: true });
      await batchAdded();
    } else {
      await runFirestoreAPI(fnName, () => firebaseSetDoc(docRef, docData, { merge: true }));
    }
  } catch (error) {
    // logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    throw error;
  }

  return docRef.id;
}

/**
 * 이미 document가 존재해야 한다.
 * document 전체를 변경하는 것이 아니라
 * 겹치지 않는 최상위 필드는 유지한다.
 *
 * - options.idAsField = false: false => id doc의 id로 사용, true => id는 doc의 필드를 가리킨다.
 * - options.addMetada = true: _id, _timeUpdate 필드를 자동으로 생성한다.
 * - options.bBatch = false: batch에 추가한다. batchStart(), batchEnd()와 함께 사용한다.
 */
export async function updateDoc(collectionPath: string, id: string, docData: UpdateData<any>, options?: {
  idAsField?: boolean,
  addMetadata?: boolean,
  bBatch?: boolean
}) {
  const fnName = 'updateDoc';

  const { idAsField = false, addMetadata = true, bBatch = false } = options ?? {};

  if (id === undefined) {
    throw new TypeError(`id must exist`);
  }

  const docRef = idAsField
    ? doc(firestore, `${collectionPath}/${docData[id]}`)
    : doc(firestore, `${collectionPath}/${id}`);

  recoverTimestamp(docData);

  // metadata 추가
  if (addMetadata) {
    docData._id = docRef.id;
    docData._timeUpdate = Timestamp.now();
  }

  try {
    if (bBatch) {
      batch?.update(docRef, docData);
      await batchAdded();
    } else {
      await runFirestoreAPI(fnName, () => firebaseUpdateDoc(docRef, docData));
    }
  } catch (error) {
    // this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    throw error;
  }

  return docRef.id;
}

export function batchStart() {
  batch = writeBatch(firestore);
  batchCount = 0;
}

/**
 * this.batch에 추가한 후에 반드시 실행한다.
 */
async function batchAdded() {
  // const fnName = 'batchAdded';

  if (batch === undefined) {
    // this.logService.error(`[${fnName}] No this.batch. Run batchStart() first.`);
    return false;
  }

  batchCount++;

  if (batchCount >= MaxBatchNum) {
    // this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
    await batch.commit();

    // 비웠으니 다시 시작한다.
    batchStart();
  }

  return undefined;
}

export async function batchEnd() {
  // const fnName = 'batchEnd';

  if (batch === undefined) {
    // this.logService.error(`[${fnName}] No this.batch. Run batchStart() first.`);
    return false;
  }

  if (batchCount > 0) {
    // this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => Run batch.commit()`);
    batchCount = 0;
    await batch.commit();
  } else {
    // this.logService.info(`[${fnName}] batchCount == ${this.batchCount} => NOOP`);
  }

  return undefined;
}

/**
 * doc를 읽어서 응답한다.
 * 못 찾으면 Promise<undefined>를 리턴한다.
 *
 * @param docPath ex) 'unifiedOrder/1234'
 */
export async function getDoc<T>(docPath: string) {
  const fnName = 'getDoc';

  try {
    const docRef = doc(firestore, docPath);
    const documentSnapshot = await runFirestoreAPI(fnName, () => firebaseGetDoc(docRef));

    // exists는 document가 존재하고 내용도 있다는 뜻이다.
    if (documentSnapshot.exists()) {
      const doc = documentSnapshot.data() as T;
      // 발생할 확률이 0이지만 혹시나 해서 추가해 본다.
      if (doc === undefined) {
        throw new Error('No doc');
      }
      return doc;
    } else {
      return undefined;
    }
  } catch (error) {
    // this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    throw error;
  }
}

/**
 * 해당 collection의 조건에 맞는 docs 배열을  리턴한다.
 */
export async function getDocsArrayWithWhere<T>(
  collectionPath: string,
  wheres: WHERE[],
  options?: {
    // selectField?: string[], // Node AdminSDK만 가능
    sortKey?: string; // ex. '_timeCreate'
    orderBy?: 'asc' | 'desc';
  }) {
  const fnName = 'getDocsArrayWithWhere';

  try {
    const querySnapshot = await querySnapshotWithWhere<T>(fnName, collectionPath, wheres, options);

    return querySnapshot.docs.map(queryDocumentSnapshot => queryDocumentSnapshot.data());
  } catch (error) {
    // logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    throw error;
  }
}

/**
 * 해당 collection의 조건에 맞는 docs를 리턴한다.
 *
 * 응답 형태는 docId를 key로 하는 Object가 된다.
 */
export async function getDocsWithWhere<T>(
  collectionPath: string,
  wheres: WHERE[],
  options?: {
    // selectField?: string[], // Node AdminSDK만 가능
    sortKey?: string; // ex. '_timeCreate'
    orderBy?: 'asc' | 'desc';
  }) {
  const fnName = 'getDocsWithWhere';

  try {
    const querySnapshot = await querySnapshotWithWhere<T>(fnName, collectionPath, wheres, options);

    return querySnapshot.docs.reduce((docs, queryDocumentSnapshot) => {
      docs[queryDocumentSnapshot.id] = queryDocumentSnapshot.data();
      return docs;
    }, {} as DocumentData);
  } catch (error) {
    // this.logService.error(`[${fnName}] 예외 발생, error = ${JSON.stringify(error, undefined, 2)}`);
    throw error;
  }
}

/**
 * getDocsWithWheres와 getDocsArrayWithWheres의 공통 부분
 */
function querySnapshotWithWhere<T>(
  fnName: string,
  collectionPath: string,
  wheres: WHERE[],
  options?: {
    // selectField?: string[], // Node AdminSDK만 가능
    sortKey?: string; // ex. '_timeCreate'
    orderBy?: 'asc' | 'desc';
  }) {

  // 1. wheres를 적용
  const queryFn: QueryConstraint[] = wheres.map(_where => where(_where[0], _where[1], _where[2]));

  // 2. sortKey를 적용
  if (options?.sortKey && options?.orderBy) {
    queryFn.push(orderBy(options.sortKey, options.orderBy));
  }
  // 3. 조회
  const collectionRef = collection(firestore, collectionPath);
  const qeuryResult = query(collectionRef, ...queryFn);

  return runFirestoreAPI(fnName, () => getDocs(qeuryResult) as Promise<QuerySnapshot<T>>);
}

/**
 * doc를 삭제한다.
 *
 * @param docPath ex) 'unifiedOrder/1234'
 */
export function deleteDocument(docPath: string) {
  const docRef = doc(firestore, docPath);
  return deleteDoc(docRef);
}

/**
 * timestamp 필드로 되어 있는 값은 받으면 seconds와 nanoseconds 필드로 변환된다.
 * 이 값을 이용해서 다시 firestore.Timestamp()로 복구한다.
 * 조사 필드는 _time으로 시작하는 4개다.
 */
function recoverTimestamp(doc: UpdateData<any>) {
  ['Create', 'Update', 'Set', 'Merge'].map(command => `_time${command}`).forEach(key => {
    const value = doc[key];
    if (value) {
      if (value instanceof Object && value.seconds !== undefined && value.nanoseconds !== undefined) {
        doc[key] = new Timestamp(value.seconds, value.nanoseconds).toDate();
      }
    }
  });

  return doc;
}

/**
 * 간단한 where 조건과 orderBy 조건으로 조회한 valueChanges Observable을 반환
 *
 * ex
 * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']])
 * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc'})
 * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc', startValue: '...'})
 * - observe('unifiedOrder', [['site', '==', 'gk-kangnam']], { sortKey: 'orderDate', orderBy: 'desc', startValue: '...', endValue: '...'})
 *
 * @param collectionPath ex) 'unifiedOrder'
 * @param wheres 조건 배열
 * @param options
 * - sortKey: 정렬할 필드명
 * - orderBy: 정렬(오름차, 내림차)
 * - startValue, endValue: 조회 시작~끝 조건
 */
export function queryCollection<T>(collectionPath: string, wheres: WHERE[], options?: {
  sortKey: string;
  orderBy: 'asc' | 'desc';
  startValue?: any;
  endValue?: any
}) {
  const queryConstraints: QueryConstraint[] = [
    ...defaultQueryQueryConstraints(options),
    ...wheres.map((_where: WHERE) => where(_where[0], _where[1], _where[2]))
  ];

  const collectionRef = collection(firestore, collectionPath);
  const queryResult = query(collectionRef, ...queryConstraints) as Query<T>;

  return queryResult;
}

function defaultQueryQueryConstraints(options?: { sortKey: string; orderBy: 'asc' | 'desc'; startValue?: any; endValue?: any }): QueryConstraint[] {
  if (options?.startValue && options?.endValue) {
    // 조회 start~end 조건이 모두 있는 경우
    return [
      orderBy(options.sortKey, options.orderBy),
      options.orderBy === 'asc' ? startAt(options.startValue) : endAt(options.startValue),
      options.orderBy === 'asc' ? endAt(options.endValue) : startAt(options.endValue),
    ];
  } else if (options?.startValue) {
    // 조회 시작 조건만 있는 경우
    return [
      orderBy(options.sortKey, options.orderBy),
      options.orderBy === 'asc' ? startAt(options.startValue) : endAt(options.startValue),
    ];
  } else if (options?.sortKey) {
    // orderBy 조건만 있는 경우
    return [orderBy(options.sortKey, options.orderBy)];
  }
  // 정렬 없는 경우
  return [];
}

export { firebase };
