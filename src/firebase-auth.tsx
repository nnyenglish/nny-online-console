// TODO: firebase로 이동시켜야한다
import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	getDocs,
	updateDoc,
	doc,
	QueryConstraint,
	query,
	setDoc,
	DocumentData,
	Timestamp,
	getDoc,
} from "firebase/firestore";
import {
	getAuth,
	signOut,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	User,
} from "firebase/auth";

const firebaseConfig = {
	apiKey: process.env.REACT_APP_API_KEY,
	authDomain: process.env.REACT_APP_AUTH_DOMAIN,
	projectId: process.env.REACT_APP_PROJECT_ID,
	storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
	messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
	appId: process.env.REACT_APP_APP_ID,
	measurementId: process.env.REACT_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);

// Functions
// export const firebaseFunctions = getFunctions(firebaseApp);

// Firestore
export const db = getFirestore(firebaseApp);

export const fbCollectionQuery = (
	collectionPath: string,
	where: QueryConstraint[]
) => query(collection(db, collectionPath), ...where);

export const fbGetDocs = (collectionPath: string) =>
	getDocs(collection(db, collectionPath));

export async function fbSetDoc(collectionPath: string, id: string | undefined, docData: DocumentData, options?: {
	idAsField?: boolean,
	bMerge?: boolean,
	addMetadata?: boolean,
}) {
	const { idAsField = false, bMerge = true, addMetadata = true } = options ?? {};

	if (idAsField && (id === undefined || docData[id] === undefined)) {
		throw new TypeError(`'${id}' field does not exist in doc`);
	}

	const collectionRef = collection(db, collectionPath);

	const docRef = id === undefined
		? doc(collectionRef) :
		idAsField
			? doc(db, `${collectionPath}/${docData[id]}`)
			: doc(db, `${collectionPath}/${id}`);

	// metadata 추가
	if (addMetadata) {
		docData._timeUpdate = Timestamp.now();
		docData._id = docRef.id;
	}

	try {
		await setDoc(docRef, docData, { merge: bMerge })
	} catch (error) {
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
export async function fbCreateDoc(collectionPath: string, id: string | undefined, docData: DocumentData, options?: {
  idAsField?: boolean,
  addMetadata?: boolean,
}) {
  const { idAsField = false, addMetadata = true } = options ?? {};

  if (idAsField && (id === undefined || docData[id] === undefined)) {
    throw new TypeError(`'${id}' field does not exist in doc`);
  }

  const collectionRef = collection(db, collectionPath);

  const docRef = id === undefined
    ? doc(collectionRef) :
    idAsField
      ? doc(db, `${collectionPath}/${docData[id]}`)
      : doc(db, `${collectionPath}/${id}`);

  // metadata 추가
  if (addMetadata) {
    docData._id = docRef.id;
    docData._timeCreate = Timestamp.now();
  }

  const getDocData = await getDoc(docRef);

  if (getDocData.exists()) {
    throw new Error('이미 존재하는 doc');
  }

  try {
		await setDoc(docRef, docData, { merge: true });
  } catch (error) {
    throw error;
  }

  return docRef.id;
}

export const fbUpdateDocField = (
	docPath: string,
	fieldPath: string,
	value: any
) => updateDoc(doc(db, docPath), { [fieldPath]: value });

// Auth
const fbAuth = getAuth(firebaseApp);
export const currentUser = fbAuth.currentUser;

export const signInService = (email: string, password: string) =>
	signInWithEmailAndPassword(fbAuth, email, password);

export const signOutService = () => signOut(fbAuth);

export const onAuthStateChangedService = (
	observer: (user: User | null) => void
) => onAuthStateChanged(fbAuth, observer);
