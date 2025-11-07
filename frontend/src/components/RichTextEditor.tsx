// src/components/RichTextEditor.tsx
import React from "react";

export default function RichTextEditor({ value, onChange }: any) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      className="w-full h-40 p-2 border rounded"
    />
  );
}
