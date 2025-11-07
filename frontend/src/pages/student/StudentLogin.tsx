import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function StudentLogin() {
	const [id, setId] = useState('')
	const nav = useNavigate()

	const submit = (e: React.FormEvent) => {
		e.preventDefault()
		if (!id) return
		nav(`/student/dashboard/${encodeURIComponent(id)}`)
	}

	return (
		<div className="page-center">
			<div className="card page-card fade-in text-center">
				<div className="mb-6">
					<div className="icon-wrapper mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500">
						<svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold mb-2 gradient-text">Student Login</h2>
					<p className="text-slate-600 text-lg">Enter your Student ID to access your profile</p>
				</div>
				
				<form onSubmit={submit} className="mt-8">
					<div className="mb-6">
						<label className="block text-left text-sm font-semibold text-slate-700 mb-2">
							Student ID
						</label>
						<input 
							className="form-field text-center text-lg" 
							placeholder="Enter your ID" 
							value={id} 
							onChange={e=>setId(e.target.value)}
							required
						/>
					</div>
					<button className="form-btn w-full flex items-center justify-center gap-2 py-4 text-lg" type="submit">
						<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
						</svg>
						Continue
					</button>
				</form>

				<div className="mt-6 pt-6 border-t border-slate-200">
					<p className="text-sm text-slate-500">
						Don't have a Student ID? Contact your school or college administrator
					</p>
				</div>
			</div>
		</div>
	)
}
