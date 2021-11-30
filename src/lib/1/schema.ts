import { Timestamp } from 'firebase/firestore';

export interface UserDoc {
  _timeCreate: Timestamp;
  _timeUpdate?: Timestamp;

  email: string;

  tel?: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;

  roleAdmin?: boolean;
  roleGuest?: boolean;
  roleStudent?: boolean;

  classRooms: string[];
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
  /** 하나의 강의가 여러개의 반에 들어갈 수 있다. */
  rooms: string[];

  title: string;
  subTitle: string;
  description: string;
  videoUrl: string;
  teachers: string[];
  levels: Level[];

  /** 강의자료 id */
  materials?: string[];
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
  levels: Level[];
}

export type Level = 'PRIMER' | 'BEGINNER' | 'CHALLENGER' | 'FLYER' | 'DISCIPLE' | 'EVERYONE';
