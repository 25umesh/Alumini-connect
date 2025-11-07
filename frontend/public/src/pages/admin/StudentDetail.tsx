// src/pages/admin/StudentDetail.tsx
import React from "react";
import { useParams } from "react-router-dom";
import StudentCard from "../../components/StudentCard";

export default function StudentDetail() {
  const { id } = useParams();
  // in real app fetch student via Firestore or backend
  const student = { alumniId: id, firstName: "Demo", lastName: "Student", currentTitle: "Eng", currentCompany: "Co" };
  return (
    <div>
      <h2>Student Detail</h2>
      <StudentCard student={student} />
      <div className="mt-3 bg-white p-4 rounded">Actions: resend onboarding, edit</div>
    </div>
  );
}
