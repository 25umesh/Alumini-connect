// src/components/StudentCard.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function StudentCard({ student }: { student: any }) {
  return (
    <div className="bg-white p-4 rounded shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-semibold">{student.firstName} {student.lastName}</div>
          <div className="text-sm text-slate-500">{student.currentTitle} • {student.currentCompany}</div>
        </div>
        <Link to={`/admin/students/${student.alumniId}`} className="text-blue-600">View</Link>
      </div>
    </div>
  );
}
