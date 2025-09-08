require('dotenv').config()

async function main() {
  const fetch = (await import('node-fetch')).default
  const URL = 'http://20.244.56.144/evaluation-service/register'

  const body = {
    email: process.env.AFF_AUTH_EMAIL,
    name: process.env.AFF_AUTH_NAME,
    mobileNo: process.env.AFF_AUTH_MOBILE || undefined,
    githubUsername: process.env.AFF_GITHUB || undefined,
    rollNo: process.env.AFF_AUTH_ROLLNO,
    accessCode: process.env.AFF_ACCESS_CODE
  }

  console.log('Register request:', body)
  const res = await fetch(URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  const text = await res.text()
  console.log('Status:', res.status)
  try {
    const data = JSON.parse(text)
    console.log('Response JSON:', data)
    if (data.clientID && data.clientSecret) {
      console.log('\nCopy these into backend/.env:')
      console.log('AFF_CLIENT_ID=' + data.clientID)
      console.log('AFF_CLIENT_SECRET=' + data.clientSecret)
    }
  } catch {
    console.log('Response Text:', text)
  }
}

main().catch(err => {
  console.error('Error:', err.message)
  process.exit(1)
})


