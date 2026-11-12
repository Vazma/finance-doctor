// Writes config/access (the email allowlist enforced by firestore.rules). Clients can't write it.
// Emulator:   FIRESTORE_EMULATOR_HOST=127.0.0.1:8080 node scripts/set-access.mjs a@x.com,b@y.com
// Production: ACCESS_TOKEN=$(gcloud auth print-access-token) PROJECT_ID=<id> node scripts/set-access.mjs a@x.com,b@y.com
const emails = (process.argv[2] || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
if (!emails.length) throw new Error('Usage: node scripts/set-access.mjs a@x.com,b@y.com')

const emulator = process.env.FIRESTORE_EMULATOR_HOST
const projectId = process.env.PROJECT_ID || 'demo-couple-finance'
const base = emulator ? `http://${emulator}` : 'https://firestore.googleapis.com'
const url = `${base}/v1/projects/${projectId}/databases/(default)/documents/config/access`
const token = emulator ? 'owner' : process.env.ACCESS_TOKEN

const res = await fetch(url, {
  method: 'PATCH',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ fields: { emails: { arrayValue: { values: emails.map((e) => ({ stringValue: e })) } } } }),
})
if (!res.ok) throw new Error(`${res.status} ${await res.text()}`)
console.log(`config/access = ${emails.join(', ')}`)
