// src/pages/student/ProfileView.tsx
import React from "react";
import useAuth from "../../hooks/useAuth";
import useStudentDoc from "../../hooks/useStudentDoc";
import { Link } from "react-router-dom";

export default function ProfileView() {
  const { user } = useAuth();
  // assume user has custom claim or local mapping of alumniId
  const alumniId = (user as any)?.uid; // Replace with actual mapping to alumniId
  const data = useStudentDoc(alumniId);

  if (!data) return <div>Profile not found</div>;
  return (
    <div className="bg-white p-4 rounded">
      <h2 className="font-semibold text-xl">{data.firstName} {data.lastName}</h2>
      <div className="text-sm text-slate-600">{data.currentTitle} at {data.currentCompany}</div>
      <div className="mt-3">
        <Link to="/student/profile/edit" className="text-blue-600">Edit profile</Link>
      </div>
    </div>
  );
}
