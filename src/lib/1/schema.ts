import { FieldValue, Timestamp } from 'firebase/firestore';

export interface UserDoc {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
  deleted?: boolean;

  email: string;
  userTel: string;

  ip?: string;
  userAgent?: string;
  sessionId?: string;

  roleAdmin?: boolean;
  roleGuest?: boolean;
  roleStudent?: boolean;

  level?: Level;

  classRooms: string[];
  // 결제를 원하는 classRoom을 넣는다.
  cart?: string[];
  // 결제가 완료된 classRoom을 넣는다.
  waitlist?: string[];

  lectures: { [lectureId: string]: {
    /**
     * 마지막으로 시청한 타임라인 좌표(seconds)
     * 1.123
     */
    currentTime?: number;
    /** 총 시청 시간(seconds) */
    playTime?: FieldValue;
    /** 90% 이상 시청하면 완료로 간주한다. */
    completed?: boolean;
  }};
}

export interface UserDocs {
  [email: string]: UserDoc;
}

/** 사용자 local storage */
export interface UserState {
  [key: string]: string | object;
}

export type LectureDoc = Lecture & {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
}

export interface Lecture {
  /** 10001 */
  sortKey: number;
  /** 1 */
  lectureNo: number;
  classRoom: string;

  title: string;
  subTitle: string;
  description: string;
  videoUrl: string;
  teachers: string[];
  levels: Level[];

  /** 강의자료 id */
  files?: {
    [key: string]: LectureFile
  };
}

export interface LectureFile {
  downloadURL: string;
  fullPath: string;
  fileName: string;
}

export type ClassRoomDoc = ClassRoom & {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
}

export interface ClassRoom {
  sortKey: number;
  roomNo: number;
  roomName: string;

  thumbnail: string;
  teachers: string[];
  // 수강 가능한 레벨
  levels: Level[];

  description: string;
  price: number;
}

// 관계를 생각해보자
// 강의실에 강의 목록이있으며, 해당 강의마다 수강 가능한 레벨이 있다. 사용자의 레벨에 수강 가능한 강의만 보인다.
// 만약 강의에 레벨

export type Level = 'PRIMER' | 'BEGINNER' | 'CHALLENGER' | 'FLYER' | 'DISCIPLE' | 'EVERYONE';

export type OrderDoc = Order & {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
  // TODO: _timeDelete로 변경해야할까?
  deleted?: boolean;
}

// 상품이 다양해지면 GeneralType으로 변경하자.
export interface Order {
  products: {
    /** classRoom Id */
    id: string;
    type: 'classRoom';

    // 구매당시 정보를 담는다.
    productName: string;
    // 수량. 현재는 무조건 1
    productVolume: number;
    /** classRoom의 선생님 정보 */
    productInfo: string;
  }[];
  /** 구매자 Id */
  userId: string;
  /** 구매자 이름 */
  userName: string;
  /**
   * 상품의 처리상태
   * ready: 결제 승인, 가상계좌에 결제금액 입금 완료
   * paid: 결제 승인, 가상계좌에 결제금액 입금 완료
   * failed: 예약결제가 시도되었 을때
   * cancelled: 관리자 콘솔에서 환불되었을 때
   */
  status: 'staging' | 'ready' | 'paid' | 'failed' | 'cancelled';

  /** 상품의 전달 여부를 기록한다. 관리자가 변경한다. */
  deliveryStatus: 'none' | 'delivered' | 'returned';

  // 구매당시 정보를 기록한다.
  amount: number;
  paymentMethod: 'card' | 'vbank' | 'phone' | 'kakaopay' | 'naverpay';
  pg: 'html5_inicis' | 'kakaopay' | 'naverpay';

  /** 관리자의 확인여부(ui 표시용) */
  checked?: boolean;
}
