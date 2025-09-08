const express = require('express')
const router = express.Router()
const { log } = require('../../logging-middleware')

router.post('/', async (req, res) => {
  try {
    const { stack, level, pkg, message } = req.body || {}
    await log(stack, level, pkg, message)
    res.status(204).send()
  } catch (e) {
    res.status(400).json({ error: e.message || 'log failed' })
  }
})

module.exports = router


