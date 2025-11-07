// src/pages/student/UploadResume.tsx
import React, { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../../lib/firebase";
import useAuth from "../../hooks/useAuth";
import { httpsCallable, getFunctions } from "firebase/functions";

export default function UploadResume() {
  const { user } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState("");

  const upload = async () => {
    if (!file || !user) return;
    setStatus("Uploading...");
    const path = `resumes/${user.uid}/${file.name}`;
    const r = ref(storage, path);
    const task = uploadBytesResumable(r, file);
  task.on('state_changed', null, (err: any) => setStatus("Upload error"), async () => {
      const url = await getDownloadURL(r);
      setStatus("Uploaded. Enqueuing parse...");
      // call cloud function to enqueue parse job (replace with your function)
      const fns = getFunctions();
      const fn = httpsCallable(fns, "enqueueParseResume");
      await fn({ alumniId: user.uid, path });
      setStatus("Parse requested. Check Resume Review.");
    });
  };

  return (
    <div className="bg-white p-4 rounded max-w-lg">
      <h3 className="font-semibold">Upload resume</h3>
      <input type="file" accept=".pdf,.docx" onChange={e=>setFile(e.target.files?.[0]||null)} />
      <div className="mt-2">
        <button onClick={upload} className="bg-blue-600 text-white px-3 py-1 rounded">Upload & Parse</button>
      </div>
      <div className="mt-2">{status}</div>
    </div>
  );
}
