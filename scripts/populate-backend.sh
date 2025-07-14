#!/bin/bash

# scripts/populate-backend-services.sh - Populate backend services and middleware
echo "🔧 Populating backend services and middleware..."

cd backend

# Spotify Service
cat > src/services/spotifyService.js << 'EOF'
import axios from 'axios'

export class SpotifyService {
  constructor() {
    this.clientId = process.env.SPOTIFY_CLIENT_ID
    this.clientSecret = process.env.SPOTIFY_CLIENT_SECRET
    this.redirectUri = process.env.SPOTIFY_REDIRECT_URI
    this.baseURL = 'https://api.spotify.com/v1'
    this.authURL = 'https://accounts.spotify.com'
  }

  getAuthorizationUrl() {
    const scopes = [
      'user-read-private',
      'user-read-email',
      'user-read-playback-state',
      'user-modify-playback-state',
      'user-read-currently-playing',
      'playlist-read-private',
      'playlist-read-collaborative',
      'playlist-modify-private',
      'playlist-modify-public',
      'user-library-read',
      'user-library-modify'
    ].join(' ')

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      scope: scopes,
      redirect_uri: this.redirectUri,
      show_dialog: 'true'
    })

    return `${this.authURL}/authorize?${params.toString()}`
  }

  async exchangeCodeForTokens(code) {
    try {
      const response = await axios.post(`${this.authURL}/api/token`, {
        grant_type: 'authorization_code',
        code,
        redirect_uri: this.redirectUri,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message)
      throw new Error('Failed to exchange code for tokens')
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const response = await axios.post(`${this.authURL}/api/token`, {
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        client_id: this.clientId,
        client_secret: this.clientSecret
      }, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      })

      return response.data
    } catch (error) {
      console.error('Token refresh error:', error.response?.data || error.message)
      throw new Error('Failed to refresh access token')
    }
  }

  async makeSpotifyRequest(accessToken, endpoint, method = 'GET', data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      }

      if (data) {
        config.data = data
      }

      const response = await axios(config)
      return response.data
    } catch (error) {
      console.error(`Spotify API error (${endpoint}):`, error.response?.data || error.message)
      throw error
    }
  }

  async getCurrentUser(accessToken) {
    return this.makeSpotifyRequest(accessToken, '/me')
  }

  async getCurrentlyPlaying(accessToken) {
    try {
      const data = await this.makeSpotifyRequest(accessToken, '/me/player/currently-playing')
      
      if (!data || !data.item) {
        return null
      }

      return {
        id: data.item.id,
        title: data.item.name,
        artist: data.item.artists.map(artist => artist.name).join(', '),
        album: data.item.album.name,
        album_art: data.item.album.images[0]?.url,
        duration_ms: data.item.duration_ms,
        progress_ms: data.progress_ms,
        is_playing: data.is_playing
      }
    } catch (error) {
      if (error.response?.status === 204) {
        return null // No track currently playing
      }
      throw error
    }
  }

  async getPlaybackState(accessToken) {
    try {
      return this.makeSpotifyRequest(accessToken, '/me/player')
    } catch (error) {
      if (error.response?.status === 204) {
        return null // No active device
      }
      throw error
    }
  }

  async play(accessToken, deviceId = null) {
    const endpoint = deviceId ? `/me/player/play?device_id=${deviceId}` : '/me/player/play'
    return this.makeSpotifyRequest(accessToken, endpoint, 'PUT')
  }

  async pause(accessToken) {
    return this.makeSpotifyRequest(accessToken, '/me/player/pause', 'PUT')
  }

  async skipToNext(accessToken) {
    return this.makeSpotifyRequest(accessToken, '/me/player/next', 'POST')
  }

  async skipToPrevious(accessToken) {
    return this.makeSpotifyRequest(accessToken, '/me/player/previous', 'POST')
  }

  async setVolume(accessToken, volumePercent) {
    return this.makeSpotifyRequest(
      accessToken, 
      `/me/player/volume?volume_percent=${volumePercent}`, 
      'PUT'
    )
  }

  async getUserPlaylists(accessToken) {
    return this.makeSpotifyRequest(accessToken, '/me/playlists?limit=50')
  }

  async createPlaylist(accessToken, name, description = '', isPublic = false) {
    const user = await this.getCurrentUser(accessToken)
    
    return this.makeSpotifyRequest(
      accessToken, 
      `/users/${user.id}/playlists`, 
      'POST',
      {
        name,
        description,
        public: isPublic
      }
    )
  }

  async addToPlaylist(accessToken, playlistId, trackId) {
    const trackUri = trackId.startsWith('spotify:') ? trackId : `spotify:track:${trackId}`
    
    return this.makeSpotifyRequest(
      accessToken,
      `/playlists/${playlistId}/tracks`,
      'POST',
      {
        uris: [trackUri]
      }
    )
  }

  async removeFromPlaylist(accessToken, playlistId, trackId) {
    const trackUri = trackId.startsWith('spotify:') ? trackId : `spotify:track:${trackId}`
    
    return this.makeSpotifyRequest(
      accessToken,
      `/playlists/${playlistId}/tracks`,
      'DELETE',
      {
        tracks: [{ uri: trackUri }]
      }
    )
  }

  async search(accessToken, query, type = 'track', limit = 20) {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString()
    })
    
    return this.makeSpotifyRequest(accessToken, `/search?${params.toString()}`)
  }
}
EOF

# Auth Middleware
cat > src/middleware/auth.js << 'EOF'
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token && !req.session.spotify_access_token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // Use token from header or session
  req.accessToken = token || req.session.spotify_access_token
  next()
}

export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}
EOF

# Error Handler Middleware
cat > src/middleware/errorHandler.js << 'EOF'
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Spotify API errors
  if (err.response?.status === 401) {
    return res.status(401).json({ 
      error: 'Unauthorized - Token may be expired',
      code: 'TOKEN_EXPIRED'
    })
  }

  if (err.response?.status === 403) {
    return res.status(403).json({ 
      error: 'Forbidden - Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    })
  }

  if (err.response?.status === 429) {
    return res.status(429).json({ 
      error: 'Rate limited - Too many requests',
      code: 'RATE_LIMITED'
    })
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
}
EOF

# Utils
cat > src/utils/logger.js << 'EOF'
import morgan from 'morgan'

// Custom morgan token for user ID
morgan.token('user', (req) => {
  return req.session?.user?.id || 'anonymous'
})

// Custom format
export const loggerFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'

export const logger = morgan(loggerFormat)
EOF

cat > src/utils/validation.js << 'EOF'
export const validatePlaylistName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Playlist name is required' }
  }
  
  if (name.length < 1 || name.length > 100) {
    return { valid: false, error: 'Playlist name must be between 1 and 100 characters' }
  }
  
  return { valid: true }
}

export const validateTrackId = (trackId) => {
  if (!trackId || typeof trackId !== 'string') {
    return { valid: false, error: 'Track ID is required' }
  }
  
  // Spotify track ID validation (22 characters, base62)
  const spotifyIdRegex = /^[a-zA-Z0-9]{22}$/
  const spotifyUriRegex = /^spotify:track:[a-zA-Z0-9]{22}$/
  
  if (!spotifyIdRegex.test(trackId) && !spotifyUriRegex.test(trackId)) {
    return { valid: false, error: 'Invalid track ID format' }
  }
  
  return { valid: true }
}

export const validateVolumePercent = (volume) => {
  if (typeof volume !== 'number') {
    return { valid: false, error: 'Volume must be a number' }
  }
  
  if (volume < 0 || volume > 100) {
    return { valid: false, error: 'Volume must be between 0 and 100' }
  }
  
  return { valid: true }
}
EOF

# Config
cat > src/config/spotify.js << 'EOF'
export const spotifyConfig = {
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  redirectUri: process.env.SPOTIFY_REDIRECT_URI,
  scopes: [
    'user-read-private',
    'user-read-email',
    'user-read-playback-state',
    'user-modify-playback-state',
    'user-read-currently-playing',
    'playlist-read-private',
    'playlist-read-collaborative',
    'playlist-modify-private',
    'playlist-modify-public',
    'user-library-read',
    'user-library-modify'
  ]
}

export const validateSpotifyConfig = () => {
  const required = ['clientId', 'clientSecret', 'redirectUri']
  const missing = required.filter(key => !spotifyConfig[key])
  
  if (missing.length > 0) {
    throw new Error(`Missing required Spotify configuration: ${missing.join(', ')}`)
  }
}
EOF

# Tests
mkdir -p tests
cat > tests/spotify.test.js << 'EOF'
import { SpotifyService } from '../src/services/spotifyService.js'

describe('SpotifyService', () => {
  let spotifyService

  beforeEach(() => {
    spotifyService = new SpotifyService()
  })

  test('should generate authorization URL', () => {
    const url = spotifyService.getAuthorizationUrl()
    expect(url).toContain('https://accounts.spotify.com/authorize')
    expect(url).toContain('client_id=')
    expect(url).toContain('scope=')
    expect(url).toContain('redirect_uri=')
  })

  // Add more tests as needed
})
EOF

echo "✅ Backend services and middleware populated!"