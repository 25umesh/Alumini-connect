// src/pages/auth/OnboardConfirm.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { httpsCallable } from "firebase/functions";
import { getFunctions } from "firebase/functions";
import { auth } from "../../lib/firebase";

export default function OnboardConfirm() {
  const { token } = useParams();
  const [status, setStatus] = useState("Verifying...");
  const nav = useNavigate();
  useEffect(() => {
    async function run() {
      try {
        // call your backend to verify token and link student
        const fns = getFunctions();
        const verify = httpsCallable(fns, "verifyOnboardToken");
        const res: any = await verify({ token });
        if (res.data.success) {
          setStatus("Confirmed! You can now sign in.");
        } else {
          setStatus("Invalid or expired token.");
        }
      } catch (e) {
        setStatus("Error verifying token.");
      }
    }
    run();
  }, [token]);

  return (
    <div className="max-w-lg mx-auto bg-white p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Onboarding</h2>
      <p>{status}</p>
      <div className="mt-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={()=>nav("/auth/signin")}>Go to sign in</button>
      </div>
    </div>
  );
}
