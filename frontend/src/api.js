export const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8080'
export const LOG_BASE = 'http://localhost:8080'

export async function createShort(body) {
  const res = await fetch(`${API_BASE}/shorturls`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const data = await res.json().catch(()=>({}))
  if (!res.ok) throw new Error(data.error || 'create failed')
  return data
}

export async function getStats(code) {
  const res = await fetch(`${API_BASE}/shorturls/${code}`)
  const data = await res.json().catch(()=>({}))
  if (!res.ok) throw new Error(data.error || 'stats failed')
  return data
}

export async function sendLog({ stack='frontend', level='info', pkg='page', message='' }) {
  // forward to backend /logs which uses logging-middleware server-side
  const res = await fetch(`${LOG_BASE}/logs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ stack, level, pkg, message })
  })
  if (!res.ok) {
    const t = await res.text().catch(()=> '')
    throw new Error(`log failed: ${t}`)
  }
}

export async function listAll() {
  const res = await fetch(`${API_BASE}/shorturls`)
  const data = await res.json().catch(()=>({}))
  if (!res.ok) throw new Error(data.error || 'list failed')
  return data.items || []
}

export async function deleteShort(code) {
  const res = await fetch(`${API_BASE}/shorturls/${code}`, { method: 'DELETE' })
  if (!res.ok) {
    const t = await res.text().catch(()=> '')
    throw new Error(`delete failed: ${t}`)
  }
}


