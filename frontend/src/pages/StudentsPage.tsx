import React, { useState } from 'react'

export default function StudentsPage() {
  const [alumniId, setAlumniId] = useState('')
  const [text, setText] = useState('')
  const [result, setResult] = useState<any>(null)

  async function parseResume(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    try {
      const resp = await fetch(`/scl/students/${encodeURIComponent(alumniId)}/parse-resume`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dev',
        },
        body: JSON.stringify({ text }),
      })
      const data = await resp.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: String(err) })
    }
  }

  return (
    <div className="page-center">
      <div className="card page-card">
        <h2>Students</h2>
        <p>Parse resume text and update an SCL student record.</p>

        <form onSubmit={parseResume} style={{ marginTop: 12 }}>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block' }}>Alumni ID</label>
            <input value={alumniId} onChange={e => setAlumniId(e.target.value)} />
          </div>
          <div style={{ marginBottom: 8 }}>
            <label style={{ display: 'block' }}>Resume text</label>
            <textarea value={text} onChange={e => setText(e.target.value)} rows={8} cols={60} />
          </div>
          <button type="submit">Parse & Update Student</button>
        </form>

        {result && (
          <pre style={{ background: '#f4f4f4', padding: 12, marginTop: 12 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  )
}
