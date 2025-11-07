import React from 'react'
import { Link, Routes, Route, useLocation, Navigate } from 'react-router-dom'
// Corrected import paths to align with folder structure under pages/
import SchoolDashboard from './pages/school/SchoolDashboard'
import SchoolGate from './pages/school/SchoolGate'
import StudentDashboard from './pages/student/StudentDashboard'
import StudentLogin from './pages/student/StudentLogin'
import StudentDetail from './pages/admin/StudentDetail'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminAuthLogin from './pages/admin/AdminAuthLogin'
import AdminAuthRegister from './pages/admin/AdminAuthRegister'
// CollegeGate was previously referenced but not imported; assuming same pattern as SchoolGate
// If CollegeGate differs, adjust path accordingly.
// Fallback components for auth (if separate from admin ones)
import SignIn from './pages/auth/SignIn'
import SignUp from './pages/auth/SignUp'

export default function App() {
  const containerStyle: React.CSSProperties = { display: 'flex', minHeight: '100vh', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, system-ui, sans-serif' }
  const boxStyle: React.CSSProperties = { textAlign: 'center' }
  const btn: React.CSSProperties = { display: 'inline-block', margin: 8, padding: '10px 16px', borderRadius: 6, background: '#1f2937', color: 'white', textDecoration: 'none' }

  const location = useLocation()

  // Show the landing cards only on the root path. When the user navigates to
  // any area (e.g. /school, /student), render only the routed component so
  // the landing UI is hidden.
  const isLanding = location.pathname === '/'

  return (
    <div className="app-landing">
      {/* show a small Back link when not on landing so user can return */}
      {!isLanding && (
        <div style={{ position: 'fixed', top: 20, left: 20, zIndex: 50 }}>
          <Link to="/" className="inline-flex items-center gap-2 bg-white/90 backdrop-blur-sm text-slate-700 px-5 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 font-medium border border-white/50 hover:bg-white">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Home
          </Link>
        </div>
      )}
      {isLanding ? (
          <div className="app-box">
            {/* Hero Section */}
            <div className="text-center mb-8 fade-in">
              <h1 className="text-5xl md:text-6xl font-bold mb-4 text-white drop-shadow-2xl">Alumni Connect</h1>
              <p className="text-white/90 text-xl md:text-2xl font-medium drop-shadow-lg">Building bridges between past and present</p>
            </div>

            {/* Main Card with Portal Options */}
            <div className="card fade-in w-full max-w-2xl" style={{ animationDelay: '100ms' }}>
              <h2 className="text-2xl font-bold mb-3 text-slate-800">Choose Your Portal</h2>
              <p className="muted mb-8">Select the appropriate section to continue</p>
              <div className="grid md:grid-cols-3 gap-4">
                <Link to="/school" className="group flex flex-col items-center p-6 bg-gradient-to-br from-blue-50 to-violet-50 rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-blue-300">
                  <div className="icon-wrapper mb-4">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">School</h3>
                  <p className="text-sm text-slate-600 text-center">Manage school alumni</p>
                </Link>

                <Link to="/college" className="group flex flex-col items-center p-6 bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-violet-300">
                  <div className="icon-wrapper mb-4 bg-gradient-to-br from-violet-500 to-purple-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">College</h3>
                  <p className="text-sm text-slate-600 text-center">Manage college alumni</p>
                </Link>

                <Link to="/student" className="group flex flex-col items-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-purple-300">
                  <div className="icon-wrapper mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <h3 className="font-semibold text-lg mb-1">Student</h3>
                  <p className="text-sm text-slate-600 text-center">Access your profile</p>
                </Link>
              </div>
            </div>

            {/* Info Card */}
            <div className="card fade-in w-full max-w-2xl" style={{ animationDelay: '200ms' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-semibold text-xl mb-3 text-slate-800">Getting Started</h3>
                  <ul className="space-y-3 text-slate-600">
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>School / College admins can register and sign in to manage alumni</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Admins can add students and generate unique student IDs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span>Students can sign in using their student ID to access their profile</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
      ) : (
        // When not on landing, don't render the landing cards — routed
        // components will appear below inside the centered Routes wrapper.
        <div className="" style={{ minHeight: 'calc(100vh - 40px)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Routes>
          {/* School & College Gateways */}
          <Route path="/school" element={<SchoolGate role="school" />} />
          <Route path="/college" element={<SchoolGate role="college" />} />

          {/* Admin Auth (School/College) */}
          <Route path="/school/register" element={<AdminAuthRegister role="school" />} />
          <Route path="/college/register" element={<AdminAuthRegister role="college" />} />
          <Route path="/school/login" element={<AdminAuthLogin role="school" />} />
          <Route path="/college/login" element={<AdminAuthLogin role="college" />} />

          {/* Admin Dashboards */}
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/school/dashboard" element={<SchoolDashboard />} />
          <Route path="/school/student/:id" element={<StudentDetail />} />

          {/* Student Auth & Dashboard */}
          {/* Redirect bare /student to login to avoid a blank page */}
          <Route path="/student" element={<Navigate to="/student/login" replace />} />
          <Route path="/student/login" element={<StudentLogin />} />
          <Route path="/student/dashboard/:id" element={<StudentDashboard />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />
          {/* Fallback for unknown routes */}
          <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      )}
    </div>
  )
}