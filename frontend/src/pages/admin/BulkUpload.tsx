// src/pages/admin/BulkUpload.tsx
import React from "react";
import CSVUploader from "../../components/CSVUploader";
// For local SPA we don't have cloud functions wired; keep placeholder

export default function BulkUpload() {
  const handleRows = async (rows: any[]) => {
    // TODO: wire to backend /admin/create-bulk endpoint
    alert(`Rows parsed: ${rows.length}. Implement upload to backend.`);
  };

  return (
    <div className="bg-white p-4 rounded max-w-2xl">
      <h3 className="font-semibold">Bulk Upload Students</h3>
      <CSVUploader onRows={handleRows} />
    </div>
  );
}
