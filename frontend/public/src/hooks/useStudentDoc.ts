// src/hooks/useStudentDoc.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useStudentDoc(alumniId: string | undefined) {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (!alumniId) return;
    const ref = doc(db, "scl_students", alumniId);
    const unsub = onSnapshot(ref, (snap: any) => {
      if (snap.exists && typeof snap.data === "function") {
        setData({ alumniId: snap.id, ...snap.data() });
      } else {
        setData(null);
      }
    });
    return () => unsub && unsub();
  }, [alumniId]);

  return data;
}
