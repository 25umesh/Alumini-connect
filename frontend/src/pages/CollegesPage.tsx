import React, { useState } from 'react'

export default function CollegesPage() {
  const [name, setName] = useState('')
  const [domain, setDomain] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [result, setResult] = useState<any>(null)

  async function createCollege(e: React.FormEvent) {
    e.preventDefault()
    setResult(null)
    try {
      const resp = await fetch(`/admin/colleges`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer dev',
        },
        body: JSON.stringify({ name, domain, contactEmail }),
      })
      const data = await resp.json()
      setResult(data)
    } catch (err: any) {
      setResult({ error: String(err) })
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>Colleges</h2>
      <p>Create a new college (admin only). For local dev, DEV_AUTH_BYPASS is used
        and the header Authorization: Bearer dev is sent automatically by this form.</p>

      <form onSubmit={createCollege} style={{ marginTop: 12 }}>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Name</label>
          <input value={name} onChange={e => setName(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Domain</label>
          <input value={domain} onChange={e => setDomain(e.target.value)} />
        </div>
        <div style={{ marginBottom: 8 }}>
          <label style={{ display: 'block' }}>Contact Email</label>
          <input value={contactEmail} onChange={e => setContactEmail(e.target.value)} />
        </div>
        <button type="submit">Create College</button>
      </form>

      {result && (
        <pre style={{ background: '#f4f4f4', padding: 12, marginTop: 12 }}>
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  )
}
