declare module 'firebase/functions' {
  import { FirebaseApp } from 'firebase/app';
  // Minimal typings to satisfy TS when using firebase functions from compat-less SDK
  export function getFunctions(app?: FirebaseApp, region?: string): any;
  export function httpsCallable(functions: any, name: string): (...args: any[]) => Promise<any>;
}
