import { initializeApp } from "firebase/app";
import {
	getFirestore,
	collection,
	getDocs,
	updateDoc,
	doc,
	QueryConstraint,
	query,
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
