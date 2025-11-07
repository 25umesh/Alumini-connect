import React from 'react'
import { Link } from 'react-router-dom'

export default function SchoolGate({ role }: { role: 'school' | 'college' }) {
  return (
    <div className="page-center">
      <div className="card page-card fade-in text-center">
        <div className="mb-6">
          <div className="icon-wrapper mx-auto mb-4">
            {role === 'school' ? (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            ) : (
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            )}
          </div>
          <h2 className="text-3xl font-bold capitalize mb-2 gradient-text">{role} Portal</h2>
          <p className="text-slate-600 text-lg">Welcome! Please choose an option to continue</p>
        </div>
        
        <div className="grid gap-4 mt-8">
          <Link 
            to={`/${role}/login`}
            className="group flex items-center justify-center gap-3 bg-gradient-to-r from-blue-600 to-violet-600 text-white px-8 py-4 rounded-xl hover:shadow-xl transition-all duration-300 font-semibold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </Link>
          
          <Link 
            to={`/${role}/register`}
            className="group flex items-center justify-center gap-3 bg-white border-2 border-blue-200 text-blue-600 px-8 py-4 rounded-xl hover:border-blue-400 hover:bg-blue-50 hover:shadow-lg transition-all duration-300 font-semibold text-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
            Create Account
          </Link>
        </div>

        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-500">
            {role === 'school' ? 'School administrators' : 'College administrators'} can manage alumni and students
          </p>
        </div>
      </div>
    </div>
  )
}
