import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import rateLimit from 'express-rate-limit'

// Import config first to load environment variables
import config from './config/index.js'
import authRoutes from './routes/auth.js'
import spotifyRoutes from './routes/spotify.js'
import likedSongsRoutes from './routes/likedSongs.js'
import { createPlaybackRoutes } from './routes/playback.js'
import { SpotifyService } from './services/spotifyService.js'

const app = express()
const PORT = config.PORT

// Initialize services
const spotifyService = new SpotifyService()

// Create playback routes with service dependency
const playbackRoutes = createPlaybackRoutes(spotifyService)

// Rate limiting - more lenient for development
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: config.NODE_ENV === 'development' ? 1000 : 100,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false
})

// Middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: false
}))
app.use(morgan('combined'))
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true
}))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  secret: config.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: config.NODE_ENV === 'production' ? 'none' : 'lax'
  }
}))

// Routes
app.use('/api/auth', authRoutes)
app.use('/api/spotify', spotifyRoutes)
app.use('/api/spotify', playbackRoutes)
app.use('/api/liked-songs', likedSongsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
    spotify_configured: !!(config.SPOTIFY_CLIENT_ID && config.SPOTIFY_CLIENT_SECRET)
  })
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err)

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid CSRF token' })
  }

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON' })
  }

  res.status(500).json({ 
    error: 'Internal server error',
    ...(config.NODE_ENV === 'development' && { details: err.message })
  })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🎵 Spotify Organizer Backend running on http://127.0.0.1:${PORT}`)
  console.log(`Environment: ${config.NODE_ENV}`)
  console.log(`CORS Origin: ${config.CORS_ORIGIN}`)
})
