import React, { useEffect, useState } from 'react'
import { Container, Tabs, Tab, Box, Typography } from '@mui/material'
import ShortenerPage from './pages/ShortenerPage'
import StatisticsPage from './pages/StatisticsPage'

export default function App() {
  const getInitial = () => (window.location.hash === '#stats' ? 1 : 0)
  const [tab, setTab] = useState(getInitial())

  useEffect(() => {
    const onHash = () => setTab(getInitial())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  const onChange = (e, v) => {
    setTab(v)
    window.location.hash = v === 1 ? '#stats' : '#shorten'
  }
  return (
    <Container maxWidth="md" style={{ paddingTop: 24, paddingBottom: 24 }}>
      <Typography variant="h4" gutterBottom>URL Shortener</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tab} onChange={onChange}>
          <Tab label="Shorten" />
          <Tab label="Statistics" />
        </Tabs>
      </Box>
      <Box hidden={tab !== 0} mt={2}><ShortenerPage /></Box>
      <Box hidden={tab !== 1} mt={2}><StatisticsPage /></Box>
    </Container>
  )
}


