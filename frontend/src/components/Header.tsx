// src/components/Header.tsx
import React from "react";
import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-slate-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-violet-600 rounded-lg flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <span className="font-bold text-2xl gradient-text group-hover:opacity-80 transition-opacity">Alumni Connect</span>
        </Link>
        <nav className="flex items-center gap-2">
          <Link to="/student/dashboard" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
            Student
          </Link>
          <Link to="/admin" className="px-4 py-2 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all font-medium">
            Admin
          </Link>
          <Link to="/auth/signin" className="px-5 py-2 bg-gradient-to-r from-blue-600 to-violet-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold">
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
