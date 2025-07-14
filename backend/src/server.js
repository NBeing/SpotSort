import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import rateLimit from 'express-rate-limit'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Middleware
app.use(helmet())
app.use(morgan('combined'))
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000',
  credentials: true
}))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Temporary routes until the full routes are created
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'Auth routes not yet implemented' })
})

app.get('/api/spotify/me', (req, res) => {
  res.json({ message: 'Spotify routes not yet implemented' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🎵 Spotify Organizer Backend running on http://127.0.0.1:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
