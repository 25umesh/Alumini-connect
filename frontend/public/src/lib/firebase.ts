// src/lib/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyAbiJAmP2ie57MpLEfDhSSzPhSU2jYFDg4",
  authDomain: "aluminiconnect-271dd.firebaseapp.com",
  projectId: "aluminiconnect-271dd",
  storageBucket: "aluminiconnect-271dd.firebasestorage.app",
  messagingSenderId: "76242126975",
  appId: "1:76242126975:web:0f11654a2038421fb6974a"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
