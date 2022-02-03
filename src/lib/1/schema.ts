import { FieldValue, Timestamp } from 'firebase/firestore';

export interface UserDoc {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
  deleted?: boolean;

  email: string;
  // level: string;

  tel?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;

  roleAdmin?: boolean;
  roleGuest?: boolean;
  roleStudent?: boolean;

  level?: Level;

  classRooms: string[];
  // 결제를 원하는 classRoom을 넣는다.
  cart: string[];

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
    [key: string]: {
      downloadURL: string;
      fullPath: string;
      fileName: string;
    }
  };
}

export type MaterialDoc = Material & {
  _id: string;
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;
}

export interface Material {
  sortKey: number;
  materialNo: number;
  rooms: string[];
  lectures: string[];

  /** storage url */
  url: string;
  title: string;
  description: string;
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
