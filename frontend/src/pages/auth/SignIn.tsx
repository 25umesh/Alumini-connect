// src/pages/auth/SignIn.tsx
import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function SignIn() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      nav("/student/dashboard");
    } catch (err: any) {
      setError(err.message || "Sign in failed");
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address first");
      return;
    }
    setError("");
    setMessage("");
    try {
      // @ts-ignore - sendPasswordResetEmail exists in firebase/auth
      const { sendPasswordResetEmail } = await import('firebase/auth');
      await sendPasswordResetEmail(auth, email);
      setMessage("Password reset email sent! Check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to send reset email");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Sign in</h2>
      <form onSubmit={submit} className="space-y-3">
        <input className="w-full p-2 border" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} />
        <input type="password" className="w-full p-2 border" placeholder="Password" value={pwd} onChange={e=>setPwd(e.target.value)} />
        <button className="bg-blue-600 text-white px-4 py-2 rounded">Sign in</button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {message && <div className="text-green-600 text-sm">{message}</div>}
      </form>
      <div className="mt-4 text-center">
        <button 
          type="button"
          onClick={handleForgotPassword}
          className="text-blue-600 hover:text-blue-700 text-sm underline"
        >
          Forgot Password?
        </button>
      </div>
    </div>
  );
}
