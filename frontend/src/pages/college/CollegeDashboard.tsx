// src/pages/college/CollegeDashboard.tsx
import React, { useEffect, useState } from 'react';
import useAuth from '../../hooks/useAuth';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Link } from 'react-router-dom';

export default function CollegeDashboard() {
  const { user, loading: authLoading } = useAuth();
  const collegeId = user?.uid; // assuming college user UID == collegeId

  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [collegeName, setCollegeName] = useState('');
  const [bulkSubject, setBulkSubject] = useState('');
  const [bulkBody, setBulkBody] = useState('');
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  useEffect(() => {
    if (!collegeId) {
      setStudentsLoading(false);
      return;
    }
    
    setStudentsLoading(true);
    setStudentsError(null);
    
    (async () => {
      try {
        // @ts-ignore dynamic import to avoid type issues with getDoc typing
        const { getDoc } = await import('firebase/firestore');
        const snap = await getDoc(doc(db, 'colleges', collegeId));
        if (snap.exists()) setCollegeName(snap.data().name || '');
      } catch (e) {
        console.warn('Failed to fetch college name', e);
      }
    })();

    const qLinked = query(collection(db, 'scl_students'), where('collegeId', '==', collegeId));
    const unsub = onSnapshot(qLinked, {
      next: (snap: any) => {
        setStudents(snap.docs.map((d: any) => ({ alumniId: d.id, ...d.data() })));
        setStudentsLoading(false);
      },
      error: (err: unknown) => {
        console.warn('students sub (college) failed:', err);
        setStudentsError(err instanceof Error ? err.message : "Failed to load students");
        setStudentsLoading(false);
      }
    });
    return () => unsub();
  }, [collegeId]);

  async function handleBulkEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!collegeId) return;
    setBulkStatus(null);
    setBulkSending(true);
    try {
      const idToken = (await user?.getIdToken?.()) || 'dev';
      const resp = await fetch('/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subject: bulkSubject || 'Update from your college',
          body: bulkBody || 'Hello students',
          scope: 'college'
        })
      });
      const data = await resp.json();
      if (!resp.ok || !data.ok) {
        throw new Error(data.detail || data.message || 'Bulk email failed');
      }
      setBulkStatus(`Sent ${data.sent} emails (skipped ${data.skipped})`);
      setBulkSubject('');
      setBulkBody('');
    } catch (err: any) {
      setBulkStatus(`Error: ${err.message}`);
    } finally {
      setBulkSending(false);
    }
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="card mb-6">
        <h2 className="text-2xl font-semibold mb-1">College Dashboard</h2>
        <p className="text-sm text-gray-600">{collegeName ? `College: ${collegeName}` : 'Loading college...'}</p>
      </div>

      <div className="card mb-6">
        <h3 className="text-xl font-semibold mb-1">All Linked Students ({students.length})</h3>
        <p className="text-xs text-gray-500 mb-3">Querying for your UID: <span className="font-mono">{collegeId}</span></p>
        {/* Bulk Email Form (parity with SchoolDashboard) */}
        <form onSubmit={handleBulkEmail} className="mb-4 space-y-2">
          <div>
            <label className="block text-xs font-medium mb-1">Bulk Email Subject</label>
            <input
              className="form-field text-sm"
              placeholder="Subject to all students"
              value={bulkSubject}
              onChange={e => setBulkSubject(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Message Body</label>
            <textarea
              className="form-field text-sm"
              rows={3}
              placeholder="Short announcement or update"
              value={bulkBody}
              onChange={e => setBulkBody(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={bulkSending}
            className="form-btn px-4 py-2 text-sm w-full"
          >
            {bulkSending ? 'Sending...' : 'Mail All Students'}
          </button>
          {bulkStatus && (
            <div className="text-xs mt-1 text-gray-700">{bulkStatus}</div>
          )}
        </form>
        {authLoading || studentsLoading ? (
          <p className="text-gray-500 text-center py-8">Loading students...</p>
        ) : studentsError ? (
          <div className="text-red-600 text-center py-8">
            <div className="font-medium">Error loading students</div>
            <div className="text-sm mt-1">{studentsError}</div>
          </div>
        ) : students.length === 0 ? (
          <p className="text-gray-500 text-center py-8">No linked students yet</p>
        ) : (
          <div className="space-y-3 max-h-[600px] overflow-y-auto">
            {students.map(s => (
              <Link to={`/college/student/${s.alumniId}`} key={s.alumniId} className="block hover:bg-slate-100 rounded">
                <div className="bg-slate-50 p-4 rounded border border-slate-200">
                  <div className="font-medium text-lg">{s.firstName} {s.lastName}</div>
                  <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                    <div><strong>Student ID:</strong> <span className="font-mono text-xs break-all">{s.alumniId}</span></div>
                    {s.email && <div className="col-span-2"><strong>Email:</strong> {s.email}</div>}
                    {s.currentTitle && <div className="col-span-2"><strong>Title:</strong> {s.currentTitle} @ {s.currentCompany}</div>}
                    {s.cvURL && (
                      <div className="mt-2 col-span-2">
                        <a href={s.cvURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">📄 View CV/Resume</a>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
