// src/hooks/useStudentDoc.ts
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../lib/firebase";

// Hook to subscribe to a single student document by alumniId
// Ensures correct snapshot API usage (snap.exists() as function) and merges id.
export default function useStudentDoc(alumniId: string | undefined) {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!alumniId) { setData(null); setLoading(false); return; }
    const ref = doc(db, "scl_students", alumniId);
    const unsub = onSnapshot(ref, {
      next: (snap: any) => {
        try {
          if (typeof snap.exists === 'function' ? snap.exists() : snap.exists) {
            setData({ alumniId: snap.id, ...snap.data() });
          } else {
            setData(null);
          }
        } catch (e: any) {
          setError(e.message || 'Failed to read student document');
        } finally {
          setLoading(false);
        }
      },
      error: (err: any) => {
        setError(err.message || 'Subscription error');
        setLoading(false);
      }
    });
    return () => unsub();
  }, [alumniId]);

  return data;
}
