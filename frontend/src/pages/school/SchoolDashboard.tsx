// src/pages/school/SchoolDashboard.tsx
import React, { useState, useEffect } from "react";
import useAuth from "../../hooks/useAuth";
import { collection, addDoc, doc, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../../lib/firebase";
import { Link } from "react-router-dom";

export default function SchoolDashboard() {
  const { user, loading: authLoading } = useAuth();
  const schoolId = user?.uid;
  
  const [students, setStudents] = useState<any[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(true);
  const [studentsError, setStudentsError] = useState<string | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [yearOfPassing, setYearOfPassing] = useState("");
  const [birthPlace, setBirthPlace] = useState("");
  const [admissionNo, setAdmissionNo] = useState("");

  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [schoolName, setSchoolName] = useState("");
  // Bulk email state
  const [bulkSubject, setBulkSubject] = useState("");
  const [bulkBody, setBulkBody] = useState("");
  const [bulkStatus, setBulkStatus] = useState<string | null>(null);
  const [bulkSending, setBulkSending] = useState(false);

  // Adopt existing student by ID (backfill for older records)
  const [adoptId, setAdoptId] = useState("");
  const [adoptMsg, setAdoptMsg] = useState<string | null>(null);

  // Fetch school name (separate collection 'colleges') and subscribe to students
  useEffect(() => {
    if (!schoolId) {
      setStudentsLoading(false);
      return;
    }
    
    setStudentsLoading(true);
    setStudentsError(null);
    
    (async () => {
      try {
        // @ts-ignore dynamic import to avoid type issues
        const { getDoc } = await import('firebase/firestore');
        const schoolDoc = await getDoc(doc(db, 'colleges', schoolId));
        if (schoolDoc.exists()) {
          setSchoolName(schoolDoc.data().name || '');
        }
      } catch (err) {
        console.warn('Failed to fetch school name', err);
      }
    })();
    // Subscribe to two queries and merge results in case older docs miss schoolId
    const qBySchool = query(collection(db, 'scl_students'), where('schoolId', '==', schoolId));
    const qByOwner = query(collection(db, 'scl_students'), where('authUid', '==', schoolId));

    const mergeDocs = (lists: any[][]) => {
      const map = new Map<string, any>();
      for (const list of lists) {
        for (const d of list) map.set(d.alumniId, d);
      }
      setStudents(Array.from(map.values()));
      setStudentsLoading(false);
    };

    let latestA: any[] = [];
    let latestB: any[] = [];

    const unsubA = onSnapshot(qBySchool, {
      next: (snap: any) => {
        latestA = snap.docs.map((d: any) => ({ alumniId: d.id, ...d.data() }));
        mergeDocs([latestA, latestB]);
      },
      error: (err: unknown) => {
        console.warn('students sub (by schoolId) failed:', err);
        setStudentsError(err instanceof Error ? err.message : "Failed to load students");
        setStudentsLoading(false);
      }
    });

    const unsubB = onSnapshot(qByOwner, {
      next: (snap: any) => {
        latestB = snap.docs.map((d: any) => ({ alumniId: d.id, ...d.data() }));
        mergeDocs([latestA, latestB]);
      },
      error: (err: unknown) => {
        console.warn('students sub (by authUid) failed:', err);
        setStudentsError(err instanceof Error ? err.message : "Failed to load students");
        setStudentsLoading(false);
      }
    });

    return () => { unsubA(); unsubB(); };
  }, [schoolId]);

  const createStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (authLoading) {
      setError("Please wait for authentication to complete");
      return;
    }
    
    if (!schoolId) {
      setError("Not signed in as school admin");
      return;
    }
    
    setError("");
    setCreatedId(null);
    
    try {
      const now = new Date().toISOString();
      const ref = await addDoc(collection(db, "scl_students"), {
        firstName,
        lastName,
        email: email || "",
        dob: dob || "",
        yearOfPassing: yearOfPassing || "",
        birthPlace: birthPlace || "",
        admissionNo: admissionNo || "",
        schoolId,
        schoolName: schoolName || "Unknown School",
        createdAt: now,
        updatedAt: now,
        // Mark as public-readable so students can view profile without auth
        isPublic: true,
        // Ownership markers for rules
        authUid: schoolId, // creator ownership
        ownerType: 'school',
        // Initial empty fields that students and colleges can update
        linkedToCollege: false
      });
      
      setCreatedId(ref.id);
      // Optimistically add student so it appears immediately without waiting for snapshot roundtrip
      setStudents(prev => [{
        alumniId: ref.id,
        firstName,
        lastName,
        email: email || '',
        dob: dob || '',
        yearOfPassing: yearOfPassing || '',
        birthPlace: birthPlace || '',
        admissionNo: admissionNo || '',
        schoolId,
        schoolName: schoolName || 'Unknown School',
        isPublic: true,
        authUid: schoolId,
        ownerType: 'school',
        linkedToCollege: false,
        createdAt: now,
        updatedAt: now
      }, ...prev]);
      setFirstName(""); 
      setLastName("");
      setEmail("");
      setDob("");
      setYearOfPassing("");
      setBirthPlace("");
      setAdmissionNo("");
    } catch (err: any) {
      setError(err.message || "Failed to create student");
    }
  };

  // Allow school to adopt a previously created student document by its ID
  const adoptStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdoptMsg(null);
    setError("");
    
    if (authLoading) {
      setError("Please wait for authentication to complete");
      return;
    }
    
    if (!schoolId) {
      setError("Not signed in as school admin");
      return;
    }
    
    if (!adoptId.trim()) {
      setError("Enter a valid Student ID");
      return;
    }
    try {
      // @ts-ignore
      const { getDoc, updateDoc } = await import('firebase/firestore');
      const ref = doc(db, 'scl_students', adoptId.trim());
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        setError('Student ID not found');
        return;
      }
      await updateDoc(ref, {
        schoolId,
        schoolName: schoolName || 'Unknown School'
      });
      setAdoptMsg('Student assigned to this school');
      setAdoptId("");
    } catch (err: any) {
      setError(err.message || 'Failed to adopt student');
    }
  };

  // Trigger bulk email via backend
  async function handleBulkEmail(e: React.FormEvent) {
    e.preventDefault();
    if (!schoolId) return;
    setBulkStatus(null);
    setBulkSending(true);
    try {
      // For dev bypass flows we may not have an id token; fallback to 'dev'
      const idToken = (await user?.getIdToken?.()) || 'dev';
      const resp = await fetch('/bulk-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        },
        body: JSON.stringify({
          subject: bulkSubject || 'Update from your school',
          body: bulkBody || 'Hello students',
          scope: 'school'
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
      <div className="space-y-8">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Students List */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-1">All Students ({students.length})</h3>
            <p className="text-xs text-gray-500 mb-3">Querying for your UID: <span className="font-mono">{schoolId}</span></p>
            {/* Bulk Email Form */}
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
              <p className="text-gray-500 text-center py-8">No students created yet</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {students.map((s) => {
                  return (
                    <div key={s.alumniId} className="bg-slate-50 p-4 rounded border border-slate-200">
                      <div className="font-medium text-lg">{s.firstName} {s.lastName}</div>
                      <div className="text-sm text-gray-600 mt-1 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div>
                          <strong>Student ID:</strong>
                          <div className="font-mono text-xs break-all">{s.alumniId}</div>
                          <div className="mt-1">
                            <a
                              className="text-sm text-blue-600 hover:underline mr-3"
                              href={`/student/dashboard/${encodeURIComponent(s.alumniId)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              View Public
                            </a>
                            <Link to={`/school/student/${s.alumniId}`} className="text-sm text-slate-700 hover:underline">Manage</Link>
                          </div>
                        </div>

                        {s.admissionNo && <div><strong>Admission No:</strong> {s.admissionNo}</div>}

                        <div className="col-span-2"><strong>School:</strong> {s.schoolName || schoolName}</div>

                        {s.linkedToCollege && (
                          <div className="mt-1 text-green-700 col-span-2">
                            <strong>✓ Linked to:</strong> {s.collegeName}
                          </div>
                        )}

                        {s.email && <div className="col-span-2"><strong>Email:</strong> {s.email}</div>}
                        {s.dob && <div><strong>DOB:</strong> {s.dob}</div>}
                        {s.birthPlace && <div><strong>Birth Place:</strong> {s.birthPlace}</div>}
                        {s.yearOfPassing && <div><strong>Passing Year:</strong> {s.yearOfPassing}</div>}
                        {s.phone && <div><strong>Phone:</strong> {s.phone}</div>}
                        {s.currentTitle && <div className="col-span-2"><strong>Title:</strong> {s.currentTitle} @ {s.currentCompany}</div>}

                        {s.cvURL && (
                          <div className="mt-2 col-span-2">
                            <a href={s.cvURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                              📄 View CV/Resume
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Create Student Form */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Create New Student</h3>
            <p className="text-sm text-gray-600 mb-4">
              Create a student and generate their unique Student ID. Share the ID with colleges and students.
            </p>
            
            <form onSubmit={createStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">First Name *</label>
                  <input 
                    className="form-field" 
                    placeholder="John" 
                    value={firstName} 
                    onChange={e=>setFirstName(e.target.value)}
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Surname (Last Name) *</label>
                  <input 
                    className="form-field" 
                    placeholder="Doe" 
                    value={lastName} 
                    onChange={e=>setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Admission No</label>
                <input 
                  className="form-field" 
                  placeholder="e.g., 12345" 
                  value={admissionNo} 
                  onChange={e=>setAdmissionNo(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date of Birth</label>
                  <input 
                    type="date"
                    className="form-field" 
                    value={dob} 
                    onChange={e=>setDob(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Year of Passing</label>
                  <input 
                    type="number"
                    className="form-field" 
                    placeholder="e.g., 2024"
                    value={yearOfPassing} 
                    onChange={e=>setYearOfPassing(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Birth Place</label>
                <input 
                  className="form-field" 
                  placeholder="City, Country" 
                  value={birthPlace} 
                  onChange={e=>setBirthPlace(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email (Optional)</label>
                <input 
                  type="email"
                  className="form-field" 
                  placeholder="john@example.com" 
                  value={email} 
                  onChange={e=>setEmail(e.target.value)}
                />
              </div>
              
              <button 
                className="form-btn w-full" 
                type="submit"
                disabled={authLoading || !schoolId}
              >
                {authLoading ? 'Loading...' : 'Create Student ID'}
              </button>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">
                  {error}
                </div>
              )}
              
              {createdId && (
                <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                  <div className="font-semibold mb-2">✓ Student Created Successfully!</div>
                  <div className="text-sm">
                    <strong>Student ID:</strong> 
                    <div className="bg-white px-3 py-2 rounded mt-1 font-mono text-green-800 break-all text-xs">
                      {createdId}
                    </div>
                    <p className="mt-2 text-xs">
                      Share this ID with:
                      <br/>• College admins (so they can link the student)
                      <br/>• Student (so they can login and update their profile)
                    </p>
                    <div className="mt-3">
                      <a
                        className="form-btn inline-block"
                        target="_blank"
                        rel="noopener noreferrer"
                        href={`/student/dashboard/${encodeURIComponent(createdId)}`}
                      >
                        View Public Profile
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </form>
          </div>
          
          {/* Adopt Existing Student by ID */}
          <div className="card">
            <h3 className="text-xl font-semibold mb-2">Add Existing Student (by ID)</h3>
            <p className="text-sm text-gray-600 mb-4">Attach a previously created student to this school using their Student ID.</p>
            <form onSubmit={adoptStudent} className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">Student ID</label>
                <input
                  className="form-field"
                  placeholder="Paste Student ID"
                  value={adoptId}
                  onChange={(e)=>setAdoptId(e.target.value)}
                  disabled={authLoading || !schoolId}
                />
              </div>
              <button 
                className="form-btn w-full" 
                type="submit"
                disabled={authLoading || !schoolId}
              >
                {authLoading ? 'Loading...' : 'Add to my school'}
              </button>
              {adoptMsg && <div className="text-green-700 text-sm">{adoptMsg}</div>}
              {error && !createdId && !adoptMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded text-sm">{error}</div>
              )}
            </form>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded p-4">
          <h4 className="font-semibold text-blue-900 mb-2">ℹ️ How it works:</h4>
          <ul className="text-sm text-blue-800 space-y-1 list-disc list-inside">
            <li>You (school) create students and generate unique Student IDs</li>
            <li>Share the Student ID with colleges so they can link students to their institution</li>
            <li>Students login with their ID to update their profile (title, company, CV, etc.)</li>
            <li>You can see all students you created, whether they're linked to a college or not</li>
            <li>All updates made by students are visible here in real-time</li>
            <li>Both you and linked colleges can view student profiles</li>
          </ul>
        </div>
      </div>
    </div>
  );
}