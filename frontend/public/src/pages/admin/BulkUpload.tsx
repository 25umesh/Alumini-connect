// src/pages/admin/BulkUpload.tsx
import React from "react";
import CSVUploader from "../../components/CSVUploader";
import { httpsCallable, getFunctions } from "firebase/functions";

export default function BulkUpload() {
  const handleRows = async (rows: any[]) => {
    // call backend cloud function to create students in SCL and send onboarding emails
    const fns = getFunctions();
    const fn = httpsCallable(fns, "createStudents");
    const res: any = await fn({ rows, collegeId: "college_demo" });
    alert(`Created: ${res.data.createdCount}`);
  };

  return (
    <div className="bg-white p-4 rounded max-w-2xl">
      <h3 className="font-semibold">Bulk Upload Students</h3>
      <CSVUploader onRows={handleRows} />
    </div>
  );
}
