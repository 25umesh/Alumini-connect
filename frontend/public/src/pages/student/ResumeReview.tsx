// src/pages/student/ResumeReview.tsx
import React from "react";
import { useParams } from "react-router-dom";
import ResumePreview from "../../components/ResumePreview";

export default function ResumeReview() {
  const { id } = useParams();
  // in real app fetch /resumes/{id}
  const parsed = { email: "a@b.com", phone: "9999", skills: ["Python","React"] };
  return (
    <div>
      <h2>Review parsed resume</h2>
      <ResumePreview parsed={parsed} />
      <div className="mt-3">
        <button className="bg-green-600 text-white px-3 py-1 rounded mr-2">Accept</button>
        <button className="bg-gray-200 px-3 py-1 rounded">Edit</button>
      </div>
    </div>
  );
}
