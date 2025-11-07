// src/pages/admin/Announcements.tsx
import React, { useState } from "react";
import RichTextEditor from "../../components/RichTextEditor";

export default function Announcements() {
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");

  const send = async () => {
    // Placeholder: implement backend call to send announcement
    alert('Queued (not implemented)')
  };

  return (
    <div className="bg-white p-4 rounded max-w-2xl">
      <h3>Create Announcement</h3>
      <input className="w-full p-2 border my-2" placeholder="Subject" value={subject} onChange={e=>setSubject(e.target.value)} />
      <RichTextEditor value={body} onChange={setBody} />
      <div className="mt-2">
        <button onClick={send} className="bg-blue-600 text-white px-3 py-1 rounded">Send</button>
      </div>
    </div>
  );
}
