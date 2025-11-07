// firebase-shims.d.ts
// Lightweight shims for firebase modular SDK to keep TS happy in this demo.
declare module 'firebase/app' {
  export function initializeApp(config: any): any
  const _default: any
  export default _default
}

declare module 'firebase/auth' {
  export function getAuth(app?: any): any
  export function signInWithEmailAndPassword(auth: any, email: string, pwd: string): Promise<any>
  export function createUserWithEmailAndPassword(auth: any, email: string, pwd: string): Promise<any>
  export function onAuthStateChanged(auth: any, cb: (u: any)=>void): any
  export type User = any
}

declare module 'firebase/firestore' {
  export function getFirestore(app?: any): any
  export function collection(db: any, name: string): any
  export function doc(db: any, name: string, id?: string): any
  export function addDoc(coll: any, data: any): Promise<any>
  export function setDoc(ref: any, data: any): Promise<any>
  export function query(...args: any[]): any
  export function where(...args: any[]): any
  export function onSnapshot(ref: any, cb: any): any
  export function getDocs(q: any): Promise<any>
}

declare module 'firebase/storage' {
  export function getStorage(app?: any): any
}
