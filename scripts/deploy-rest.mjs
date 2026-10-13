import { createHash } from 'node:crypto'
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs'
import { join, relative, sep } from 'node:path'

const TOKEN = process.env.VERCEL_TOKEN
const ROOT = new URL('..', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const NAME = process.argv[2] || 'agentdate'

const EXCLUDE_DIRS = new Set(['node_modules', '.git', '.next', '.vercel', '.github'])
const EXCLUDE_ROOT = new Set(['.env.local', '.env.production.local', 'vercel.json'])
const dataKeep = new Set(['people.json'])

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry)
    const rel = relative(ROOT, full).split(sep).join('/')
    if (statSync(full).isDirectory()) {
      if (EXCLUDE_DIRS.has(entry)) continue
      if (rel === 'data') continue
      walk(full, out)
    } else {
      if (EXCLUDE_ROOT.has(rel)) continue
      if (rel.endsWith('.log')) continue
      if (rel.startsWith('data/')) continue
      out.push(full)
    }
  }
  return out
}

const files = walk(ROOT)
const seed = join(ROOT, 'data', 'seed', 'people.json')
if (existsSync(seed)) files.push(seed)

let nextConfig = readFileSync(join(ROOT, 'next.config.mjs'), 'utf8')
const envBlock = `
  env: {
    GEMINI_API_KEY: process.env.GEMINI_API_KEY || ${JSON.stringify(process.env.GEMINI_API_KEY || '')},
    APIFY_TOKEN: process.env.APIFY_TOKEN || ${JSON.stringify(process.env.APIFY_TOKEN || '')},
  },
`
if (!nextConfig.includes('GEMINI_API_KEY')) {
  nextConfig = nextConfig.replace('const nextConfig = {', `const nextConfig = {${envBlock}`)
}

const payload = []
for (const file of files) {
  const rel = relative(ROOT, file).split(sep).join('/')
  let buf = readFileSync(file)
  if (rel === 'next.config.mjs') buf = Buffer.from(nextConfig, 'utf8')
  payload.push({
    file: rel,
    data: buf.toString('base64'),
  })
}

console.log(`Uploading ${payload.length} files as "${NAME}"...`)

const res = await fetch(`https://api.vercel.com/v13/deployments?forceNew=1`, {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${TOKEN}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: NAME,
    target: 'production',
    projectSettings: { framework: 'nextjs' },
    files: payload,
  }),
})
const body = await res.json()
console.log('HTTP', res.status)
if (!res.ok) {
  console.log(JSON.stringify(body, null, 2).slice(0, 2000))
  process.exit(1)
}
console.log('deployment id:', body.id, 'url:', body.url, 'state:', body.readyState)

const id = body.id
for (let i = 0; i < 90; i++) {
  await new Promise((r) => setTimeout(r, 5000))
  const s = await fetch(`https://api.vercel.com/v13/deployments/${id}`, {
    headers: { Authorization: `Bearer ${TOKEN}` },
  })
  const j = await s.json()
  const state = j.readyState
  console.log(`poll ${i}: ${state} ${j.status || ''} ${j.errorMessage || ''}`)
  if (state === 'READY') {
    console.log('LIVE:', `https://${j.url}`)
    process.exit(0)
  }
  if (state === 'ERROR' || state === 'CANCELED') {
    console.log('error:', j.errorMessage, JSON.stringify(j).slice(0, 1500))
    process.exit(1)
  }
}
console.log('timed out waiting')
process.exit(1)
