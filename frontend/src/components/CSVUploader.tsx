// src/components/CSVUploader.tsx
import React from "react";
import Papa from "papaparse";

export default function CSVUploader({ onRows }: { onRows: (rows: any[]) => void }) {
  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    Papa.parse(f, {
      header: true,
      complete: (res) => {
        onRows(res.data as any[]);
      }
    });
  };
  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFile} />
    </div>
  );
}
