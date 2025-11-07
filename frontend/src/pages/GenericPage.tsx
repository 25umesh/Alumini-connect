import React from 'react'

export default function GenericPage({ title }: { title: string }) {
  const API = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000'

  const [health, setHealth] = React.useState<any>(null)

  async function checkHealth() {
    try {
      const res = await fetch(`${API}/`)
      const data = await res.json()
      setHealth(data)
    } catch (err: any) {
      setHealth({ error: String(err) })
    }
  }

  return (
    <div style={{ marginTop: 16 }}>
      <h2>{title}</h2>
      <p>This is a placeholder page for <strong>{title}</strong>.</p>
      <p>When you open <code>/</code> in the browser this component is rendered by default.</p>

      <div style={{ marginTop: 12 }}>
        <strong>Backend base URL:</strong> <code>{API}</code>
        <div style={{ marginTop: 8 }}>
          <button onClick={checkHealth}>Check backend health</button>
        </div>
      </div>

      {health && (
        <pre style={{ background: '#f4f4f4', padding: 12, marginTop: 12 }}>{JSON.stringify(health, null, 2)}</pre>
      )}
    </div>
  )
}
