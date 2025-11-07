import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import useStudentDoc from '../../hooks/useStudentDoc'
import useAuth from '../../hooks/useAuth'
import { doc } from 'firebase/firestore'
import { db, storage } from '../../lib/firebase'

export default function StudentDashboard() {
	const { id } = useParams()
	const student = useStudentDoc(id)
	const { user } = useAuth()
	
	const [isEditing, setIsEditing] = useState(false)
	const [firstName, setFirstName] = useState('')
	const [lastName, setLastName] = useState('')
	const [email, setEmail] = useState('')
	const [phone, setPhone] = useState('')
	const [currentTitle, setCurrentTitle] = useState('')
	const [currentCompany, setCurrentCompany] = useState('')
	const [linkedIn, setLinkedIn] = useState('')
	const [bio, setBio] = useState('')

	const [message, setMessage] = useState('')
	const [error, setError] = useState('')

	useEffect(() => {
		if (student) {
			setFirstName(student.firstName || '')
			setLastName(student.lastName || '')
			setEmail(student.email || '')
			setPhone(student.phone || '')
			setCurrentTitle(student.currentTitle || '')
			setCurrentCompany(student.currentCompany || '')
			setLinkedIn(student.linkedIn || '')
			setBio(student.bio || '')
		}
	}, [student])

	const handleSave = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!id) return

		setError('')
		setMessage('')

		try {
			// @ts-ignore
			const { setDoc, updateDoc } = await import('firebase/firestore')
			const studentRef = doc(db, 'scl_students', id)
			if (student) {
					// Do not allow students to update their first/last name from the dashboard.
					// Only update other editable profile fields.
					await updateDoc(studentRef, {
						email,
						phone,
						currentTitle,
						currentCompany,
						linkedIn,
						bio,
						updatedAt: new Date().toISOString()
					})
				setMessage('Profile updated successfully!')
			} else {
				await setDoc(studentRef, {
					firstName,
					lastName,
					email,
					phone,
					currentTitle,
					currentCompany,
					linkedIn,
					bio,
					isPublic: true,
					authUid: user?.uid || null,
					ownerType: user ? 'student' : 'anonymous',
					createdAt: new Date().toISOString(),
					updatedAt: new Date().toISOString()
				})
				setMessage('Profile created successfully!')
			}
			setIsEditing(false)
		} catch (err: any) {
			setError(err.message || 'Failed to save profile')
		}
	}

	

	return (
		<div className="page-center">
			<div className="card page-card max-w-3xl">
				<h2 className="text-2xl font-semibold mb-4">Student Dashboard</h2>
				
				{message && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{message}</div>}
				{error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
				
				{/* If student does not exist yet, show creation form immediately */}
				{!student && (
					<form onSubmit={handleSave} className="space-y-4">
						<p className="text-sm text-gray-600">No profile found for this ID. Create one:</p>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium mb-1">First Name</label>
								<input className="form-field" value={firstName} onChange={e => setFirstName(e.target.value)} required />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Last Name</label>
								<input className="form-field" value={lastName} onChange={e => setLastName(e.target.value)} required />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<input type="email" className="form-field" value={email} onChange={e => setEmail(e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Phone</label>
								<input type="tel" className="form-field" value={phone} onChange={e => setPhone(e.target.value)} />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Current Title</label>
								<input className="form-field" value={currentTitle} onChange={e => setCurrentTitle(e.target.value)} placeholder="e.g., Software Engineer" />
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Current Company</label>
								<input className="form-field" value={currentCompany} onChange={e => setCurrentCompany(e.target.value)} placeholder="e.g., Google" />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
								<input type="url" className="form-field" value={linkedIn} onChange={e => setLinkedIn(e.target.value)} placeholder="https://linkedin.com/in/yourprofile" />
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Bio</label>
								<textarea className="form-field" value={bio} onChange={e => setBio(e.target.value)} rows={4} placeholder="Tell us about yourself..." />
							</div>
						</div>
						<button type="submit" className="form-btn w-full">Create Profile</button>
					</form>
				)}
				
				{/* Existing profile view/edit */}
				{student && !isEditing ? (
					<div className="space-y-4">
						<div className="bg-slate-50 p-4 rounded">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<p className="text-sm text-gray-500">Student ID</p>
									<p className="font-medium">{student.alumniId}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">College/School</p>
									{/*
									 If the student doc was linked to a college but the collegeName field
									 wasn't populated (e.g. updated only with collegeId/linkedToCollege),
									 show a sensible placeholder 'Unknown College' rather than 'Not assigned'.
									*/}
									<p className="font-medium">
										{(student.collegeName && student.collegeName !== 'Unknown College')
											? student.collegeName
											: (student.collegeId || student.linkedToCollege)
												? 'Unknown College'
												: 'Not assigned'
										}
									</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Name</p>
									<p className="font-medium">{student.firstName} {student.lastName}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Email</p>
									<p className="font-medium">{student.email || 'Not provided'}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Phone</p>
									<p className="font-medium">{student.phone || 'Not provided'}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Current Title</p>
									<p className="font-medium">{student.currentTitle || 'Not provided'}</p>
								</div>
								<div>
									<p className="text-sm text-gray-500">Current Company</p>
									<p className="font-medium">{student.currentCompany || 'Not provided'}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm text-gray-500">LinkedIn</p>
									<p className="font-medium">{student.linkedIn || 'Not provided'}</p>
								</div>
								<div className="md:col-span-2">
									<p className="text-sm text-gray-500">Bio</p>
									<p className="font-medium">{student.bio || 'Not provided'}</p>
								</div>
								{student.cvURL && (
									<div className="md:col-span-2">
										<p className="text-sm text-gray-500">CV/Resume</p>
										<a href={student.cvURL} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
											{student.cvFileName || 'Download CV'}
										</a>
									</div>
								)}
							</div>
						</div>
						
						<button 
							onClick={() => setIsEditing(true)}
							className="form-btn w-full"
						>
							Edit Profile
						</button>
					</div>
				) : student && (
					/* Edit Mode */
					<form onSubmit={handleSave} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							{/* Name cannot be edited by students here; show static name instead */}
							<div className="md:col-span-2">
								<p className="text-sm text-gray-500">Name</p>
								<p className="font-medium">{student.firstName} {student.lastName}</p>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Email</label>
								<input 
									type="email"
									className="form-field" 
									value={email} 
									onChange={e => setEmail(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Phone</label>
								<input 
									type="tel"
									className="form-field" 
									value={phone} 
									onChange={e => setPhone(e.target.value)}
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Current Title</label>
								<input 
									className="form-field" 
									value={currentTitle} 
									onChange={e => setCurrentTitle(e.target.value)}
									placeholder="e.g., Software Engineer"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium mb-1">Current Company</label>
								<input 
									className="form-field" 
									value={currentCompany} 
									onChange={e => setCurrentCompany(e.target.value)}
									placeholder="e.g., Google"
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">LinkedIn Profile</label>
								<input 
									type="url"
									className="form-field" 
									value={linkedIn} 
									onChange={e => setLinkedIn(e.target.value)}
									placeholder="https://linkedin.com/in/yourprofile"
								/>
							</div>
							<div className="md:col-span-2">
								<label className="block text-sm font-medium mb-1">Bio</label>
								<textarea 
									className="form-field" 
									value={bio} 
									onChange={e => setBio(e.target.value)}
									rows={4}
									placeholder="Tell us about yourself..."
								/>
							</div>
						</div>
						
						<div className="flex gap-2">
							<button type="submit" className="form-btn flex-1">
								Save Changes
							</button>
							<button 
								type="button"
								onClick={() => setIsEditing(false)}
								className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex-1"
							>
								Cancel
							</button>
						</div>
					</form>
				)}
				
				{/* CV upload removed: students should not upload CV from dashboard per product rules */}
			</div>
		</div>
	)
}
