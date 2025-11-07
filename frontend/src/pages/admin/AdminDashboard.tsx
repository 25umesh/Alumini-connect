// src/pages/admin/AdminDashboard.tsx
import React, { useState, useEffect } from "react";
import useCollegeStudents from "../../hooks/useCollegeStudents";
import useAuth from "../../hooks/useAuth";
import { collection, addDoc, doc } from "firebase/firestore";
import { db } from "../../lib/firebase";

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const collegeId = user?.uid;
  const { students, loading: studentsLoading, error: studentsError } = useCollegeStudents(collegeId);

  // Year-wise view/filter
  const [yearFilter, setYearFilter] = useState<string>('all');
  const [grouped, setGrouped] = useState<boolean>(false);
  const years = Array.from(new Set(students.map(s => s.yearOfPassing).filter(Boolean))).sort();
  const filtered = yearFilter === 'all' ? students : students.filter(s => String(s.yearOfPassing) === String(yearFilter));

  // Group by year when grouped is true
  const groupedByYear: Record<string, any[]> = (grouped ? filtered : students).reduce((acc: any, s: any) => {
    const y = s.yearOfPassing ? String(s.yearOfPassing) : 'Unknown';
    acc[y] = acc[y] || [];
    acc[y].push(s);
    return acc;
  }, {});

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [collegeName, setCollegeName] = useState("");
  // Bulk email state (parity with School/College dashboards)
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // Fetch college name when component loads. We try two patterns:
  //  1) doc id == admin uid (our current convention)
  //  2) any doc with adminUid == uid (fallback for older data)
  useEffect(() => {
    const fetchCollegeName = async () => {
      if (!collegeId) return;
      try {
        // @ts-ignore
        const { getDoc, collection, query, where, getDocs } = await import('firebase/firestore');
        // First try direct doc by uid
        const direct = await getDoc(doc(db, "colleges", collegeId));
        if (direct.exists()) {
          setCollegeName(direct.data().name || "");
          return;
        }
        // Fallback: search by adminUid == uid
        const q = query(collection(db, 'colleges'), where('adminUid', '==', collegeId));
        const snap = await getDocs(q);
        if (!snap.empty) {
          setCollegeName((snap.docs[0].data() as any).name || "");
        }
      } catch (err) {
        console.error("Failed to fetch college name:", err);
      }
    };
    fetchCollegeName();
  }, [collegeId]);

  // Trigger bulk email via backend for this college
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

  const addStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authLoading) {
      setError("Please wait for authentication to complete");
      return;
    }
    
    if (!collegeId) {
      setError("Not signed in as admin");
      return;
    }
    
    setError("");
    setCreatedId(null);
    
    try {
      // @ts-ignore dynamic import to minimize initial bundle
      const { updateDoc } = await import('firebase/firestore');
      const sid = (createdId || '').trim();
      if (!sid) {
        setError('Enter a valid Student ID');
        return;
      }
      const studentRef = doc(db, 'scl_students', sid);
      // Proceed with initial linking
      const payload: any = {
        collegeId,
        linkedToCollege: true,
        linkedAt: new Date().toISOString(),
        lastLinkedBy: collegeId, // now allowed by relaxed rules
      };
      if (collegeName && collegeName.trim()) {
        payload.collegeName = collegeName.trim();
      }
      // NOTE: Avoid a pre-read to satisfy security rules. If the student is
      // already linked to another college or does not exist, this update will
      // fail with an appropriate Firestore error we handle below.
      await updateDoc(studentRef, payload);
      alert(`Student successfully linked to ${collegeName}!`);
      setCreatedId('');
      setFirstName('');
      setLastName('');
      setEmail('');
    } catch (err: any) {
      // Provide clearer messages for common Firestore errors
      console.error('Link student failed:', err);
      const code = err?.code || "";
      if (code === "not-found") {
        setError("Student ID not found. Please check the ID and try again.");
      } else if (code === "permission-denied") {
        setError("Missing or insufficient permissions. Make sure this ID is unlinked and you are signed in as the college account.");
      } else {
        setError(err.message || "Failed to add student");
      }
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h2 className="text-3xl font-bold">Admin Dashboard</h2>
          <p className="text-gray-600 mt-1">Manage your students</p>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students List */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold">Students {grouped ? '(Grouped by Year)' : `(${filtered.length})`}</h3>
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Passing Year:</label>
                <select className="form-field py-1" value={yearFilter} onChange={e=>setYearFilter(e.target.value)}>
                  <option value="all">All</option>
                  {years.map((y:any)=> (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </select>
                <label className="text-sm text-gray-600 ml-2">Grouped</label>
                <input type="checkbox" checked={grouped} onChange={e=>setGrouped(e.target.checked)} />
              </div>
            </div>
            {/* Bulk Email Form */}
            <div className="mb-4">
              <p className="text-xs text-gray-500 mb-2">Querying for your UID: <span className="font-mono">{collegeId}</span></p>
              <form onSubmit={handleBulkEmail} className="space-y-2">
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
            </div>
            {authLoading || studentsLoading ? (
              <div className="text-gray-600 text-center py-8">
                <div className="font-medium">Loading students...</div>
              </div>
            ) : studentsError ? (
              <div className="text-red-600 text-center py-8">
                <div className="font-medium">Error loading students</div>
                <div className="text-sm mt-1">{studentsError}</div>
              </div>
            ) : !grouped ? (
              filtered.length === 0 ? (
              <div className="text-gray-600 text-center py-8">
                <div className="font-medium">No students linked yet</div>
                <div className="text-sm mt-1">
                  Link a student using their Student ID in the panel on the right. As soon as they are linked,
                  they will appear here automatically.
                </div>
              </div>
              ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {filtered.map(s => (
                  <div key={s.alumniId} className="bg-slate-50 p-4 rounded border border-slate-200">
                    <div className="font-medium text-lg">{s.firstName} {s.lastName}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <div><strong>ID:</strong> {s.alumniId}</div>
                      {s.yearOfPassing && <div><strong>Passing Year:</strong> {s.yearOfPassing}</div>}
                      <div><strong>College:</strong> {(s.collegeName && s.collegeName !== 'Unknown College') ? s.collegeName : (collegeName || 'Not assigned')}</div>
                      {s.email && <div><strong>Email:</strong> {s.email}</div>}
                      {s.phone && <div><strong>Phone:</strong> {s.phone}</div>}
                      {s.currentTitle && <div><strong>Title:</strong> {s.currentTitle}</div>}
                      {s.currentCompany && <div><strong>Company:</strong> {s.currentCompany}</div>}
                      {s.cvURL && (
                        <div className="mt-2">
                          <a href={s.cvURL} target="_blank" rel="noopener noreferrer" 
                             className="text-blue-600 hover:underline text-sm">
                            📄 View CV/Resume
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              )
            ) : (
              // Grouped view
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {Object.keys(groupedByYear).sort().map(year => (
                  <div key={year}>
                    <div className="sticky top-0 bg-white/90 backdrop-blur border-b font-semibold py-1">Year: {year}</div>
                    <div className="mt-2 space-y-2">
                      {groupedByYear[year].map((s:any) => (
                        <div key={s.alumniId} className="bg-slate-50 p-4 rounded border border-slate-200">
                          <div className="font-medium text-lg">{s.firstName} {s.lastName}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            <div><strong>ID:</strong> {s.alumniId}</div>
                            {s.yearOfPassing && <div><strong>Passing Year:</strong> {s.yearOfPassing}</div>}
                            <div><strong>College:</strong> {(s.collegeName && s.collegeName !== 'Unknown College') ? s.collegeName : (collegeName || 'Not assigned')}</div>
                            {s.email && <div><strong>Email:</strong> {s.email}</div>}
                            {s.phone && <div><strong>Phone:</strong> {s.phone}</div>}
                            {s.currentTitle && <div><strong>Title:</strong> {s.currentTitle}</div>}
                            {s.currentCompany && <div><strong>Company:</strong> {s.currentCompany}</div>}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add Student Form */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Link Student to College</h3>
            <p className="text-sm text-gray-600 mb-4">
              Enter an existing Student ID to link them to your institution. Students must be created by the school first.
            </p>
            
            <form onSubmit={addStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID *</label>
                <input 
                  className="form-field" 
                  placeholder="Enter existing student ID" 
                  value={createdId || ""} 
                  onChange={e=>setCreatedId(e.target.value)}
                  disabled={authLoading || !collegeId}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Ask the school for the student ID
                </p>
              </div>
              
              <button 
                className="form-btn w-full" 
                type="submit"
                disabled={authLoading || !collegeId}
              >
                {authLoading ? 'Loading...' : `Link Student to ${collegeName || 'College'}`}
              </button>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
            </form>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>Schools create students and generate Student IDs</li>
            <li>You (college) link students to your institution using their Student ID</li>
            <li>Each student can only be linked to ONE college</li>
            <li>Students can then update their own profile (title, company, CV, etc.)</li>
            <li>All updates made by students are visible here in real-time</li>
            <li>Both you and the school can view the student's profile</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
