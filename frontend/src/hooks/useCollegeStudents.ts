// src/hooks/useCollegeStudents.ts
import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

// Returns all students associated with a college account.
// Note: We subscribe only by collegeId to avoid security-rule noise from
// historical fields (like lastLinkedBy). If needed later, we can add a
// server-side job to backfill collegeId on older docs.
export default function useCollegeStudents(collegeId?: string) {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!collegeId) {
      setLoading(false);
      setStudents([]);
      return;
    }

    setLoading(true);
    setError(null);

    const qByCollegeId = query(collection(db, "scl_students"), where("collegeId", "==", collegeId));

    const unsub = onSnapshot(qByCollegeId, {
      next: (snap: any) => {
        const latest = snap.docs.map((d: any) => ({ alumniId: d.id, ...d.data() }));
        setStudents(latest);
        setLoading(false);
      },
      error: (err: unknown) => {
        console.warn("students sub (by collegeId) failed:", err);
        setError(err instanceof Error ? err.message : "Failed to load students");
        setLoading(false);
      },
    });

    return () => {
      unsub();
    };
  }, [collegeId]);

  return { students, loading, error };
}
