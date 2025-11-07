// src/components/ResumePreview.tsx
import React from "react";

export default function ResumePreview({ parsed }: { parsed: any }) {
  if (!parsed) return <div>No preview</div>;
  return (
    <div className="bg-white p-4 rounded">
      <h3 className="font-semibold">Parsed Resume</h3>
      <pre className="text-sm">{JSON.stringify(parsed, null, 2)}</pre>
    </div>
  );
}
