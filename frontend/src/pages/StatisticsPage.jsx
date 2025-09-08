import React, { useEffect, useState } from 'react'
import { Box, Typography, Accordion, AccordionSummary, AccordionDetails, Link } from '@mui/material'
import ExpandMoreIcon from '@mui/icons-material/ExpandMore'
import { getStats, listAll, sendLog, deleteShort } from '../api'

export default function StatisticsPage() {
  const [items, setItems] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      try {
        const all = await listAll()
        setItems(all.map((s, idx) => ({ index: idx + 1, code: s.code, shortLink: `${window.location.origin.replace(/:\d+$/, ':8080')}/${s.code}`, expiry: new Date(s.expiry).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }), details: null })))
      } catch (e) {
        setError(e.message)
      }
    }
    load()
    const handler = () => load()
    window.addEventListener('shorts:updated', handler)
    return () => window.removeEventListener('shorts:updated', handler)
  }, [])

  const loadDetails = async (code) => {
    try {
      const data = await getStats(code)
      setItems(list => list.map(it => it.code === code ? { ...it, details: data } : it))
    } catch (e) {
      setError(e.message)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle1" color="text.secondary">Recently created short links</Typography>
      {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
      <Box sx={{ mt: 2 }}>
        {items.length === 0 && <Typography>No items yet. Create some on the Shorten tab.</Typography>}
        {items.map(item => (
          <Accordion key={item.code} onChange={(e, expanded) => { if (expanded && !item.details) loadDetails(item.code) }} sx={{ backgroundColor: 'white', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography>{item.index}. <Link href={item.shortLink} target="_blank" rel="noreferrer">{item.shortLink}</Link> — Expires: {item.expiry} — <span style={{ marginLeft: 8, color: '#1976d2', cursor: 'pointer' }} onClick={async (e)=>{ e.stopPropagation(); try { await deleteShort(item.code); setItems(list => list.filter(x => x.code !== item.code).map((x, i) => ({ ...x, index: i + 1 }))); await sendLog({ level: 'info', pkg: 'page', message: `deleted:${item.code}` }) } catch (err) { setError(err.message) } }}>Delete</span></Typography>
            </AccordionSummary>
            <AccordionDetails>
              {item.details ? (
                <Box>
                  <Typography>Total Clicks: {item.details.totalClicks}</Typography>
                  <Typography>
                    Original: <Link href={item.details.original.url} target="_blank" rel="noreferrer">{item.details.original.url}</Link>
                  </Typography>
                  <Typography>Created: {new Date(item.details.original.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Typography>
                  <Typography>Expiry: {new Date(item.details.original.expiry).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Typography>
                  <Box sx={{ mt: 1 }}>
                    {item.details.clicks.map((c,i)=>(
                      <Typography key={i}>{new Date(c.ts).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Typography>
                    ))}
                  </Box>
                </Box>
              ) : (
                <Typography>Loading...</Typography>
              )}
            </AccordionDetails>
          </Accordion>
        ))}
      </Box>
    </Box>
  )
}