// src/lib/api.ts
// Placeholder wrappers for backend functions (Cloud Run or Cloud Functions)
export const BACKEND_BASE = "https://your-backend.example.com"; // replace

export async function postCreateStudents(rows: any[], collegeId: string) {
  return fetch(`${BACKEND_BASE}/scl/students/bulk`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ rows, collegeId })
  }).then(r=>r.json());
}

export async function postSendAnnouncement(collegeId: string, payload: any) {
  return fetch(`${BACKEND_BASE}/admin/${collegeId}/announcement`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  }).then(r=>r.json());
}

export async function linkStudentToCollege(alumniId: string, collegeId: string, idToken: string) {
  const url = `${import.meta.env.VITE_API_BASE}/admin/link-student?alumniId=${encodeURIComponent(alumniId)}&collegeId=${encodeURIComponent(collegeId)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${idToken}`,
    },
  });
  if (!res.ok) {
    const detail = await res.json().catch(() => ({}));
    throw new Error(detail.detail?.message || detail.detail || `Link failed (${res.status})`);
  }
  return res.json();
}
