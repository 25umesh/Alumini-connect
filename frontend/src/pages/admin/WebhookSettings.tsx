// src/pages/admin/WebhookSettings.tsx
import React, { useState } from "react";

export default function WebhookSettings() {
  const [url, setUrl] = useState("");
  const save = async () => {
    // Placeholder: call backend /webhooks/register
    alert('Saved (not implemented)')
  };
  return (
    <div className="bg-white p-4 rounded max-w-lg">
      <h3>Webhook Settings</h3>
      <input className="w-full p-2 border my-2" placeholder="https://your.college/webhook" value={url} onChange={e=>setUrl(e.target.value)} />
      <button onClick={save} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
    </div>
  );
}
