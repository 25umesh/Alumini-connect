import React, { useState } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from '../../lib/firebase'
import { useNavigate } from 'react-router-dom'

export default function AdminLogin({ role }: { role: 'school' | 'college' }) {
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')
    try {
      await signInWithEmailAndPassword(auth, email, pwd)
      // Route by role: schools -> SchoolDashboard, colleges -> AdminDashboard
      if (role === 'school') {
        nav('/school/dashboard')
      } else {
        nav('/admin')
      }
    } catch (err: any) {
      setError(err.message || 'Login failed')
    }
  }

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first')
      return
    }
    setError('')
    setMessage('')
    try {
      // @ts-ignore - sendPasswordResetEmail exists in firebase/auth
      const { sendPasswordResetEmail } = await import('firebase/auth')
      await sendPasswordResetEmail(auth, email)
      setMessage('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    }
  }

  return (
    <div className="page-center">
      <div className="card page-card fade-in">
        <div className="text-center mb-6">
          <div className="icon-wrapper mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">{role === 'college' ? 'College' : 'School'} Admin</h2>
          <p className="text-slate-600 text-lg">Sign in to your account</p>
        </div>
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-left text-sm font-semibold text-slate-700 mb-2">
              Email Address
            </label>
            <input 
              className="form-field" 
              placeholder="admin@example.com" 
              type="email"
              value={email} 
              onChange={e=>setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-left text-sm font-semibold text-slate-700 mb-2">
              Password
            </label>
            <input 
              className="form-field" 
              placeholder="Enter your password" 
              type="password" 
              value={pwd} 
              onChange={e=>setPwd(e.target.value)}
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <span className="text-red-700 text-sm font-medium">{error}</span>
              </div>
            </div>
          )}
          
          {message && (
            <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-700 text-sm font-medium">{message}</span>
              </div>
            </div>
          )}

          <button className="form-btn w-full py-4 text-lg flex items-center justify-center gap-2" type="submit">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
            </svg>
            Sign In
          </button>
        </form>
        
        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <button 
            type="button"
            onClick={handleForgotPassword}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium hover:underline transition-all"
          >
            Forgot your password?
          </button>
        </div>
      </div>
    </div>
  )
}
