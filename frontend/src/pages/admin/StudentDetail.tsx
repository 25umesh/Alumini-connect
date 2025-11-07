// src/pages/admin/StudentDetail.tsx
import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import useStudentDoc from "../../hooks/useStudentDoc";

export default function StudentDetail() {
  const { id } = useParams();
  const student = useStudentDoc(id);
  const navigate = useNavigate();

  const handleBack = () => {
    // Prefer history back when there's a previous entry; fall back to dashboard
    const idx = (window.history.state as { idx?: number } | null)?.idx ?? 0;
    if (idx > 0) {
      navigate(-1);
    } else {
      navigate("/school/dashboard", { replace: true });
    }
  };

  if (!id) {
    return <div className="p-6">Missing student id</div>;
  }

  if (!student) {
    return <div className="p-6">Loading or student not found...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Student Detail</h2>
        <button
          type="button"
          onClick={handleBack}
          className="text-sm text-blue-600 hover:underline"
          aria-label="Go back"
        >
          ↩ Back
        </button>
      </div>
      <div className="card space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Student ID</p>
            <p className="font-medium break-all font-mono text-xs">{student.alumniId}</p>
          </div>
          {student.schoolName && (
            <div>
              <p className="text-gray-500">School</p>
              <p className="font-medium">{student.schoolName}</p>
            </div>
          )}
          {student.collegeName && (
            <div>
              <p className="text-gray-500">College</p>
              <p className="font-medium">{student.collegeName}</p>
            </div>
          )}
          <div>
            <p className="text-gray-500">Name</p>
            <p className="font-medium">{student.firstName} {student.lastName}</p>
          </div>
          {student.admissionNo && (
            <div>
              <p className="text-gray-500">Admission No</p>
              <p className="font-medium">{student.admissionNo}</p>
            </div>
          )}
          {student.yearOfPassing && (
            <div>
              <p className="text-gray-500">Passing Year</p>
              <p className="font-medium">{student.yearOfPassing}</p>
            </div>
          )}
          {student.dob && (
            <div>
              <p className="text-gray-500">DOB</p>
              <p className="font-medium">{student.dob}</p>
            </div>
          )}
          {student.birthPlace && (
            <div>
              <p className="text-gray-500">Birth Place</p>
              <p className="font-medium">{student.birthPlace}</p>
            </div>
          )}
          {student.email && (
            <div>
              <p className="text-gray-500">Email</p>
              <p className="font-medium">{student.email}</p>
            </div>
          )}
          {student.phone && (
            <div>
              <p className="text-gray-500">Phone</p>
              <p className="font-medium">{student.phone}</p>
            </div>
          )}
          {student.currentTitle && (
            <div>
              <p className="text-gray-500">Current Title</p>
              <p className="font-medium">{student.currentTitle}</p>
            </div>
          )}
          {student.currentCompany && (
            <div>
              <p className="text-gray-500">Company</p>
              <p className="font-medium">{student.currentCompany}</p>
            </div>
          )}
          {student.linkedIn && (
            <div className="md:col-span-2">
              <p className="text-gray-500">LinkedIn</p>
              <a href={student.linkedIn} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{student.linkedIn}</a>
            </div>
          )}
          {student.bio && (
            <div className="md:col-span-2">
              <p className="text-gray-500">Bio</p>
              <p className="font-medium whitespace-pre-line">{student.bio}</p>
            </div>
          )}
          {student.cvURL && (
            <div className="md:col-span-2">
              <p className="text-gray-500">CV/Resume</p>
              <a href={student.cvURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                {student.cvFileName || 'Download CV'}
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="bg-slate-50 border border-slate-200 rounded p-4 text-sm">
        <p><strong>Status:</strong> {student.linkedToCollege ? 'Linked to a college' : 'Not linked'}</p>
        <p className="mt-1"><strong>Created:</strong> {student.createdAt || 'Unknown'}</p>
        {student.updatedAt && <p><strong>Updated:</strong> {student.updatedAt}</p>}
      </div>
    </div>
  );
}
