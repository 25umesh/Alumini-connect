// src/pages/auth/SignUp.tsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../lib/firebase";
import { useNavigate } from "react-router-dom";

export default function SignUp() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const nav = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    try {
      await createUserWithEmailAndPassword(auth, email, pwd);
      setSuccess(true);
      // Redirect to dashboard after 2 seconds
      setTimeout(() => {
        nav("/student/dashboard");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Sign up failed");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded">
      <h2 className="text-xl font-semibold mb-4">Sign up</h2>
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          <strong>Successfully registered!</strong> Redirecting to dashboard...
        </div>
      )}
      
      <form onSubmit={submit} className="space-y-3">
        <input 
          className="w-full p-2 border" 
          placeholder="Email" 
          type="email"
          value={email} 
          onChange={e=>setEmail(e.target.value)}
          required
        />
        <input 
          type="password" 
          className="w-full p-2 border" 
          placeholder="Password" 
          value={pwd} 
          onChange={e=>setPwd(e.target.value)}
          required
        />
        <button 
          className="bg-green-600 text-white px-4 py-2 rounded w-full disabled:opacity-50"
          disabled={success}
        >
          {success ? 'Registered!' : 'Sign up'}
        </button>
        {error && <div className="text-red-600 text-sm">{error}</div>}
      </form>
    </div>
  );
}
