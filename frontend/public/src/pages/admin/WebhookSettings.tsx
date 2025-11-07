// src/pages/admin/WebhookSettings.tsx
import React, { useState } from "react";
import { httpsCallable, getFunctions } from "firebase/functions";

export default function WebhookSettings() {
  const [url, setUrl] = useState("");
  const save = async () => {
    const fns = getFunctions();
    const fn = httpsCallable(fns, "registerWebhook");
    await fn({ collegeId: "college_demo", url });
    alert("Saved");
  };
  return (
    <div className="bg-white p-4 rounded max-w-lg">
      <h3>Webhook Settings</h3>
      <input className="w-full p-2 border my-2" placeholder="https://your.college/webhook" value={url} onChange={e=>setUrl(e.target.value)} />
      <button onClick={save} className="bg-blue-600 text-white px-3 py-1 rounded">Save</button>
    </div>
  );
}
