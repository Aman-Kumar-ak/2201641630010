import React, { useState } from 'react'
import { Box, Grid, TextField, Button, Typography } from '@mui/material'
import { createShort, sendLog } from '../api'

const emptyRow = { url: '', validity: '', shortcode: '' }

export default function ShortenerPage() {
  const [rows, setRows] = useState([ { ...emptyRow } ])
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const addRow = () => setRows(r => (r.length < 5 ? [...r, { ...emptyRow }] : r))
  const removeRow = (index) => setRows(r => (r.length > 1 ? r.filter((_, i) => i !== index) : r))

  const update = (i, key, val) => setRows(r => r.map((row, idx) => idx===i ? { ...row, [key]: val } : row))

  const submit = async () => {
    setLoading(true)
    try {
      await sendLog({ level: 'info', pkg: 'page', message: 'shorten_submit_clicked' })
      const calls = rows
        .filter(r => r.url)
        .map(r => createShort({ url: r.url, validity: r.validity ? Number(r.validity) : undefined, shortcode: r.shortcode || undefined }))
      const out = await Promise.allSettled(calls)
      const mapped = out.map(x => x.status === 'fulfilled' ? x.value : { error: x.reason.message })
      setResults(mapped)
      // Persist successful creations to localStorage for Statistics page
      try {
        const existing = JSON.parse(localStorage.getItem('createdShorts') || '[]')
        const adds = mapped
          .filter(m => !m.error && m.shortLink)
          .map(m => {
            const url = new URL(m.shortLink)
            const code = url.pathname.replace(/^\//,'')
            return { code, shortLink: m.shortLink, expiry: m.expiry }
          })
        const combined = [...existing, ...adds]
        localStorage.setItem('createdShorts', JSON.stringify(combined))
        try { window.dispatchEvent(new CustomEvent('shorts:updated')) } catch {}
        await sendLog({ level: 'info', pkg: 'page', message: `persisted_${adds.length}_shorts` })
      } catch {}
      await sendLog({ level: 'info', pkg: 'page', message: 'shorten_submit_completed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box>
      <Typography variant="subtitle1">Enter up to 5 URLs</Typography>
      {rows.map((row, i) => (
        <Grid container spacing={1} key={i} sx={{ mt: 1 }}>
          <Grid item xs={12} md={6}>
            <TextField fullWidth label="Original URL" value={row.url} onChange={e=>update(i,'url',e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Validity (min)" value={row.validity} onChange={e=>update(i,'validity',e.target.value)} />
          </Grid>
          <Grid item xs={6} md={2}>
            <TextField fullWidth label="Shortcode (opt)" value={row.shortcode} onChange={e=>update(i,'shortcode',e.target.value)} />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button color="error" onClick={() => removeRow(i)} disabled={rows.length === 1}>Delete Row</Button>
          </Grid>
        </Grid>
      ))}
      <Box sx={{ mt: 1 }}>
        <Button onClick={addRow} disabled={rows.length>=5}>Add Row</Button>
        <Button variant="contained" onClick={submit} disabled={loading} sx={{ ml: 1 }}>Shorten</Button>
      </Box>

      <Box sx={{ mt: 3 }}>
        {results.map((r, idx) => (
          <Box key={idx} sx={{ mb: 1 }}>
            {r.error ? (
              <Typography color="error">{r.error}</Typography>
            ) : (
              <Typography>Short: <a href={r.shortLink} target="_blank" rel="noreferrer">{r.shortLink}</a> | Expiry: {new Date(r.expiry).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</Typography>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  )
}


