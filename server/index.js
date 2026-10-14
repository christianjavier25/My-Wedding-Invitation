import crypto from 'node:crypto'
import { Buffer } from 'node:buffer'
import { mkdir, readFile, rename, unlink, writeFile } from 'node:fs/promises'
import path from 'node:path'
import process from 'node:process'
import { fileURLToPath } from 'node:url'
import express from 'express'
import multer from 'multer'
import { defaultInvitation } from '../src/weddingData.js'

const rootDirectory = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const publicDirectory = path.join(rootDirectory, 'public')
const photoDirectory = path.join(publicDirectory, 'PhotoGallery')
const dataDirectory = path.join(rootDirectory, 'data')
const invitationFile = path.join(dataDirectory, 'invitation.json')
const credentialsFile = path.join(dataDirectory, 'admin-credentials.json')
const distDirectory = path.join(rootDirectory, 'dist')
const sessionDuration = 8 * 60 * 60 * 1000
const sessions = new Map()
const loginAttempts = new Map()
const app = express()

app.disable('x-powered-by')
app.set('trust proxy', 1)
app.use(express.json({ limit: '512kb' }))

function isSameOriginRequest(request) {
  const origin = request.get('origin')
  if (!origin) return false

  if (process.env.PUBLIC_ORIGIN) return origin === process.env.PUBLIC_ORIGIN
  if (process.env.NODE_ENV === 'production') return origin === `${request.protocol}://${request.get('host')}`
  return /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin)
}

function requireSameOrigin(request, response, next) {
  if (!isSameOriginRequest(request)) return response.status(403).json({ error: 'Request origin was not allowed.' })
  return next()
}

function cookieValue(request, name) {
  const item = request.headers.cookie?.split(';').map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))
  return item ? decodeURIComponent(item.slice(name.length + 1)) : ''
}

function getSession(request) {
  const token = cookieValue(request, 'wedding_admin')
  const session = sessions.get(token)
  if (!session) return false
  if (session.expiresAt <= Date.now()) {
    sessions.delete(token)
    return false
  }
  return true
}

function requireAdmin(request, response, next) {
  if (!getSession(request)) return response.status(401).json({ error: 'Please unlock the editor first.' })
  return next()
}

function safeEqual(left, right) {
  const leftHash = crypto.createHash('sha256').update(left).digest()
  const rightHash = crypto.createHash('sha256').update(right).digest()
  return crypto.timingSafeEqual(leftHash, rightHash) && left.length === right.length
}

function recordLoginFailure(ip) {
  const previous = loginAttempts.get(ip)
  const entry = previous?.blockedUntil > Date.now() ? previous : { count: 0, blockedUntil: 0 }
  entry.count += 1
  if (entry.count >= 5) entry.blockedUntil = Date.now() + 15 * 60 * 1000
  loginAttempts.set(ip, entry)
  return entry
}

function publicInvitationUrl(value) {
  return typeof value === 'string' && (value.startsWith('https://') || /^\/PhotoGallery\/[a-zA-Z0-9._-]+$/.test(value))
}

function validateInvitation(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return 'Invitation settings must be an object.'

  const merged = {
    ...defaultInvitation,
    ...value,
    entourage: { ...defaultInvitation.entourage, ...value.entourage },
  }

  for (const [key, field] of Object.entries(merged)) {
    if (['palette', 'timeline', 'photos', 'reminders', 'entourage'].includes(key)) continue
    if (typeof field !== 'string' && typeof field !== 'number') return `Invalid value for ${key}.`
    if (String(field).length > 5000) return `${key} is too long.`
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(merged.date) || Number.isNaN(Date.parse(`${merged.date}T12:00:00`))) return 'Enter a valid wedding date.'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(merged.replyBy) || Number.isNaN(Date.parse(`${merged.replyBy}T12:00:00`))) return 'Enter a valid RSVP deadline.'
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(merged.ceremonyTime) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(merged.receptionTime)) return 'Enter event times in 24-hour format.'
  if (!publicInvitationUrl(merged.heroImage)) return 'The hero image must use HTTPS or a PhotoGallery upload.'

  if (!Array.isArray(merged.timeline) || merged.timeline.length > 30 || merged.timeline.some((item) => !item || typeof item.time !== 'string' || typeof item.activity !== 'string')) return 'Check the wedding timeline entries.'
  if (!Array.isArray(merged.palette) || merged.palette.length > 12 || merged.palette.some((item) => !item || typeof item.name !== 'string' || !/^#[0-9a-f]{6}$/i.test(item.color))) return 'Check the color palette entries.'
  if (!Array.isArray(merged.reminders) || merged.reminders.length > 20 || merged.reminders.some((item) => !item || typeof item.title !== 'string' || typeof item.text !== 'string')) return 'Check the guest reminder entries.'
  if (!Array.isArray(merged.photos) || merged.photos.length > 40 || merged.photos.some((item) => !item || !publicInvitationUrl(item.src) || typeof item.alt !== 'string' || typeof item.caption !== 'string')) return 'Check the gallery images.'
  if (!merged.entourage || Object.values(merged.entourage).some((item) => typeof item !== 'string')) return 'Check the wedding party entries.'

  for (const mapUrl of [merged.ceremonyMap, merged.receptionMap]) {
    if (typeof mapUrl !== 'string' || !mapUrl.startsWith('https://')) return 'Map links must use HTTPS.'
  }

  return merged
}

async function readInvitation() {
  try {
    return JSON.parse(await readFile(invitationFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return defaultInvitation
    throw error
  }
}

async function readCredentials() {
  try {
    return JSON.parse(await readFile(credentialsFile, 'utf8'))
  } catch (error) {
    if (error.code === 'ENOENT') return null
    throw error
  }
}

function verifyPasscode(passcode, credentials) {
  if (process.env.ADMIN_PASSCODE) return safeEqual(passcode, process.env.ADMIN_PASSCODE)
  if (!credentials?.salt || !credentials?.hash) return false
  const expected = Buffer.from(credentials.hash, 'hex')
  const actual = crypto.scryptSync(passcode, credentials.salt, expected.length)
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual)
}

async function writeInvitation(value) {
  await mkdir(dataDirectory, { recursive: true })
  const temporaryFile = `${invitationFile}.${crypto.randomUUID()}.tmp`
  await writeFile(temporaryFile, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
  await rename(temporaryFile, invitationFile)
}

const imageTypes = new Map([
  ['image/jpeg', { extension: '.jpg', signature: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff }],
  ['image/png', { extension: '.png', signature: (buffer) => buffer.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) }],
  ['image/webp', { extension: '.webp', signature: (buffer) => buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP' }],
])

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 12 * 1024 * 1024, files: 1 },
  fileFilter: (request, file, callback) => callback(null, imageTypes.has(file.mimetype)),
})

app.get('/api/invitation', async (request, response, next) => {
  try {
    response.json({ invitation: await readInvitation() })
  } catch (error) {
    next(error)
  }
})

app.get('/api/admin/session', async (request, response, next) => {
  try {
    response.json({ authenticated: getSession(request), configured: Boolean(process.env.ADMIN_PASSCODE) || Boolean(await readCredentials()) })
  } catch (error) {
    next(error)
  }
})

app.post('/api/admin/setup', requireSameOrigin, async (request, response, next) => {
  try {
    if (process.env.NODE_ENV === 'production' && !process.env.ADMIN_PASSCODE) return response.status(503).json({ error: 'Configure ADMIN_PASSCODE on the server before production use.' })
    if (process.env.ADMIN_PASSCODE || await readCredentials()) return response.status(409).json({ error: 'An admin passcode is already configured. Please sign in.' })
    const passcode = typeof request.body?.passcode === 'string' ? request.body.passcode : ''
    if (passcode.length < 8) return response.status(400).json({ error: 'Choose a passcode with at least 8 characters.' })
    const salt = crypto.randomBytes(16).toString('hex')
    const hash = crypto.scryptSync(passcode, salt, 64).toString('hex')
    await mkdir(dataDirectory, { recursive: true })
    const temporaryFile = `${credentialsFile}.${crypto.randomUUID()}.tmp`
    await writeFile(temporaryFile, `${JSON.stringify({ salt, hash })}\n`, { encoding: 'utf8', mode: 0o600 })
    await rename(temporaryFile, credentialsFile)
    return response.json({ configured: true })
  } catch (error) {
    return next(error)
  }
})

app.post('/api/admin/login', requireSameOrigin, async (request, response, next) => {
  try {
  const ip = request.ip
  const attempts = loginAttempts.get(ip)
  if (attempts?.blockedUntil > Date.now()) return response.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' })
  const credentials = await readCredentials()
  if (!process.env.ADMIN_PASSCODE && !credentials) return response.status(503).json({ error: 'Create an editor passcode first.' })

  const passcode = typeof request.body?.passcode === 'string' ? request.body.passcode : ''
  if (!verifyPasscode(passcode, credentials)) {
    const failure = recordLoginFailure(ip)
    return response.status(failure.blockedUntil ? 429 : 401).json({ error: failure.blockedUntil ? 'Too many attempts. Try again in 15 minutes.' : 'That passcode did not match.' })
  }

  loginAttempts.delete(ip)
  const token = crypto.randomBytes(32).toString('base64url')
  sessions.set(token, { expiresAt: Date.now() + sessionDuration })
  response.cookie('wedding_admin', token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    maxAge: sessionDuration,
    path: '/api/admin',
  })
  return response.json({ authenticated: true })
  } catch (error) {
    return next(error)
  }
})

app.post('/api/admin/logout', requireSameOrigin, (request, response) => {
  const token = cookieValue(request, 'wedding_admin')
  sessions.delete(token)
  response.clearCookie('wedding_admin', { httpOnly: true, sameSite: 'strict', secure: process.env.NODE_ENV === 'production', path: '/api/admin' })
  response.json({ authenticated: false })
})

app.get('/api/admin/invitation', requireAdmin, async (request, response, next) => {
  try {
    response.json({ invitation: await readInvitation() })
  } catch (error) {
    next(error)
  }
})

app.put('/api/admin/invitation', requireSameOrigin, requireAdmin, async (request, response, next) => {
  try {
    const validation = validateInvitation(request.body?.invitation)
    if (typeof validation === 'string') return response.status(400).json({ error: validation })
    await writeInvitation(validation)
    return response.json({ invitation: validation })
  } catch (error) {
    return next(error)
  }
})

app.post('/api/admin/upload', requireSameOrigin, requireAdmin, upload.single('image'), async (request, response, next) => {
  try {
    const kind = request.query.kind
    if (!['hero', 'gallery'].includes(kind)) return response.status(400).json({ error: 'Choose a hero or gallery image upload.' })
    if (!request.file) return response.status(400).json({ error: 'Choose a JPEG, PNG, or WebP image under 12 MB.' })

    const type = imageTypes.get(request.file.mimetype)
    if (!type.signature(request.file.buffer)) return response.status(400).json({ error: 'The uploaded file is not a valid image.' })

    const filename = `${kind}-${crypto.randomUUID()}${type.extension}`
    await mkdir(photoDirectory, { recursive: true })
    await writeFile(path.join(photoDirectory, filename), request.file.buffer, { flag: 'wx' })
    return response.status(201).json({ image: { src: `/PhotoGallery/${filename}`, alt: '', caption: '' } })
  } catch (error) {
    return next(error)
  }
})

app.delete('/api/admin/images/:filename', requireSameOrigin, requireAdmin, async (request, response, next) => {
  const { filename } = request.params
  if (!/^(hero|gallery)-[0-9a-f-]{36}\.(jpg|png|webp)$/i.test(filename) || path.basename(filename) !== filename) {
    return response.status(400).json({ error: 'That image cannot be removed.' })
  }

  try {
    await unlink(path.join(photoDirectory, filename))
    return response.json({ removed: true })
  } catch (error) {
    if (error.code === 'ENOENT') return response.status(404).json({ error: 'Image not found.' })
    return next(error)
  }
})

if (process.env.NODE_ENV === 'production') {
  app.use('/PhotoGallery', express.static(photoDirectory, { maxAge: '1h' }))
  app.use(express.static(distDirectory, { index: false }))
  app.get('/admin', (request, response) => response.sendFile(path.join(distDirectory, 'index.html')))
  app.get(/.*/, (request, response) => {
    if (request.path.startsWith('/api/')) return response.status(404).json({ error: 'Not found.' })
    return response.sendFile(path.join(distDirectory, 'index.html'))
  })
}

app.use((error, request, response, next) => {
  if (response.headersSent) return next(error)
  if (error instanceof multer.MulterError) {
    const message = error.code === 'LIMIT_FILE_SIZE' ? 'Images must be 12 MB or smaller.' : 'Could not accept that upload.'
    return response.status(400).json({ error: message })
  }
  console.error(error)
  return response.status(500).json({ error: 'The server could not complete that request.' })
})

await mkdir(photoDirectory, { recursive: true })
const port = Number(process.env.PORT || 3001)
if (!process.env.ADMIN_PASSCODE) console.warn('Admin editor is locked until ADMIN_PASSCODE is set in .env.local.')
app.listen(port, '127.0.0.1', () => console.log(`Wedding invitation API listening on http://127.0.0.1:${port}`))