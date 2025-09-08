require('dotenv').config()

async function main() {
  const fetch = (await import('node-fetch')).default
  const AUTH_URL = 'http://20.244.56.144/evaluation-service/auth'
  const body = {
    email: process.env.AFF_AUTH_EMAIL,
    name: process.env.AFF_AUTH_NAME,
    rollNo: process.env.AFF_AUTH_ROLLNO,
    accessCode: process.env.AFF_ACCESS_CODE,
    clientID: process.env.AFF_CLIENT_ID,
    clientSecret: process.env.AFF_CLIENT_SECRET
  }
  console.log('Request body (excluding secrets shown as **** where appropriate):')
  console.log({
    ...body,
    clientSecret: body.clientSecret ? '****' : undefined
  })
  const res = await fetch(AUTH_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const text = await res.text()
  console.log('Status:', res.status)
  try {
    const data = JSON.parse(text)
    console.log('Response JSON:', data)
  } catch {
    console.log('Response Text:', text)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})


