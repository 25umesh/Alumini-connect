// src/hooks/useCollegeStudents.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function useCollegeStudents(collegeId?: string) {
  const [students, setStudents] = useState<any[]>([]);
  useEffect(() => {
    if (!collegeId) return;
    const q = query(collection(db, "scl_students"), where("collegeId", "==", collegeId));
    const unsub = onSnapshot(q, (snapshot: any) => {
      setStudents(snapshot.docs.map((d: any) => ({ alumniId: d.id, ...d.data() })));
    });
    return () => unsub();
  }, [collegeId]);
  return students;
}
