// src/pages/admin/AdminDashboard.tsx
import React from "react";
import useCollegeStudents from "../../hooks/useCollegeStudents";

export default function AdminDashboard() {
  const collegeId = "college_demo"; // replace with real admin's collegeId from auth claims
  const students = useCollegeStudents(collegeId);

  return (
    <div>
      <h2 className="text-xl font-semibold">Admin Dashboard</h2>
      <div className="grid gap-4 mt-4">
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold">Students ({students.length})</h3>
          <div className="mt-3 grid gap-2">
            {students.map(s=> <div key={s.alumniId} className="p-2 border rounded">{s.firstName} {s.lastName}</div>)}
          </div>
        </div>
        <div className="bg-white p-4 rounded">
          <h3 className="font-semibold">Announcements</h3>
        </div>
      </div>
    </div>
  );
}
