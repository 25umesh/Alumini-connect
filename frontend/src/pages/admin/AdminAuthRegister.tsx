import React, { useState } from 'react'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { auth, db } from '../../lib/firebase'
import { setDoc, doc } from 'firebase/firestore'
import { useNavigate } from 'react-router-dom'

export default function AdminRegister({ role }: { role: 'school' | 'college' }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [pwd, setPwd] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const nav = useNavigate()

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pwd)
      const uid = cred.user.uid
      // create a college/school record keyed by uid
      await setDoc(doc(db, 'colleges', uid), {
        name,
        role,
        adminUid: uid,
        createdAt: new Date().toISOString(),
      })
      setSuccess(true)
      // Redirect to proper dashboard after 2 seconds based on role
      setTimeout(() => {
        if (role === 'school') {
          nav('/school/dashboard')
        } else {
          nav('/admin')
        }
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Registration failed')
    }
  }

  return (
    <div className="page-center">
      <div className="card page-card fade-in">
        <div className="text-center mb-6">
          <div className="icon-wrapper mx-auto mb-4">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-2 gradient-text">{role === 'college' ? 'College' : 'School'} Admin</h2>
          <p className="text-slate-600 text-lg">Create your administrator account</p>
        </div>
        
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <div>
                <p className="text-green-700 font-semibold">Successfully registered!</p>
                <p className="text-green-600 text-sm">Redirecting to your dashboard...</p>
              </div>
            </div>
          </div>
        )}
        
        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-left text-sm font-semibold text-slate-700 mb-2">
              {role === 'college' ? 'College' : 'School'} Name
            </label>
            <input 
              className="form-field" 
              placeholder="Enter institution name" 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              required 
            />
          </div>

          <div>
            <label className="block text-left text-sm font-semibold text-slate-700 mb-2">
              Admin Email Address
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
              placeholder="Create a strong password" 
              type="password" 
              value={pwd} 
              onChange={e=>setPwd(e.target.value)} 
              required 
            />
            <p className="text-xs text-slate-500 mt-1 text-left">Minimum 6 characters recommended</p>
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

          <button 
            className="form-btn w-full py-4 text-lg flex items-center justify-center gap-2" 
            type="submit" 
            disabled={success}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            {success ? 'Registered Successfully!' : `Create ${role === 'college' ? 'College' : 'School'} Account`}
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-200 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{' '}
            <a href={`/${role}/login`} className="text-blue-600 hover:text-blue-700 font-semibold hover:underline">
              Sign in here
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
