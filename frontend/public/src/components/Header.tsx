// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white shadow">
      <div className="container mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-xl">Alumni-Connect</Link>
        <nav className="space-x-4">
          <Link to="/student/dashboard" className="text-slate-600">Student</Link>
          <Link to="/admin" className="text-slate-600">Admin</Link>
          <Link to="/auth/signin" className="text-slate-600">Sign In</Link>
        </nav>
      </div>
    </header>
  );
}
