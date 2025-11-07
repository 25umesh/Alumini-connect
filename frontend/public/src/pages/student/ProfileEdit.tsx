// src/pages/student/ProfileEdit.tsx
import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import useStudentDoc from "../../hooks/useStudentDoc";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function ProfileEdit() {
  const { user } = useAuth();
  const alumniId = (user as any)?.uid;
  const data = useStudentDoc(alumniId);
  const [form, setForm] = useState<any>({});
  useEffect(()=> { if (data) setForm(data); }, [data]);

  if (!data) return <div>Loading...</div>;
  if (!data.linkedToCollege) {
    return <div className="bg-yellow-50 p-4 rounded">Your profile is read-only until your college links the record. Contact your college.</div>;
  }

  const save = async () => {
    // simple Firestore update; in production use server-side version check
    const ref = doc(db, "scl_students", alumniId);
    await updateDoc(ref, { ...form, lastUpdatedAt: new Date() });
    alert("Saved");
  };

  return (
    <div className="bg-white p-4 rounded max-w-xl">
      <h2 className="text-lg font-semibold">Edit profile</h2>
      <div className="space-y-2 mt-3">
        <input value={form.firstName||""} onChange={e=>setForm({...form, firstName:e.target.value})} className="w-full p-2 border" />
        <input value={form.lastName||""} onChange={e=>setForm({...form, lastName:e.target.value})} className="w-full p-2 border" />
        <input value={form.currentTitle||""} onChange={e=>setForm({...form, currentTitle:e.target.value})} className="w-full p-2 border" />
        <input value={form.currentCompany||""} onChange={e=>setForm({...form, currentCompany:e.target.value})} className="w-full p-2 border" />
        <button onClick={save} className="bg-blue-600 text-white px-4 py-2 rounded">Save</button>
      </div>
    </div>
  );
}
