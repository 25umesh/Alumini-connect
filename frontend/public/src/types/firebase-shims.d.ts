declare module 'firebase/app' {
  export type FirebaseApp = any;
  export function initializeApp(config: any): any;
}

declare module 'firebase/auth' {
  export type User = any;
  export function getAuth(app?: any): any;
  export function onAuthStateChanged(auth: any, cb: (u: any) => void): any;
  export function signInWithEmailAndPassword(auth: any, email: string, pass: string): any;
  export function createUserWithEmailAndPassword(auth: any, email: string, pass: string): any;
  export function updateProfile(auth: any, profile: any): any;
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any;
  export function collection(db: any, name: string): any;
  export function doc(db: any, ...args: any[]): any;
  export function updateDoc(ref: any, data: any): any;
  export function onSnapshot(q: any, cb: (snapshot: any) => void): any;
  export function query(...args: any[]): any;
  export function where(...args: any[]): any;
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any;
  export function ref(storage: any, path: string): any;
  export function uploadBytesResumable(ref: any, file: any): any;
  export function getDownloadURL(ref: any): any;
}
