#!/bin/bash

# scripts/populate-services.sh - Populate services and backend files
echo "🔧 Populating services and backend files..."

cd frontend

# Spotify API Service
cat > src/services/spotifyApi.js << 'EOF'
import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

class SpotifyAPI {
  constructor() {
    this.baseURL = API_BASE_URL
    this.accessToken = localStorage.getItem('spotify_access_token')
    this.refreshToken = localStorage.getItem('spotify_refresh_token')
    
    // Setup axios interceptor for auth
    this.setupInterceptors()
  }

  setupInterceptors() {
    axios.interceptors.request.use((config) => {
      if (this.accessToken && config.url?.includes('/spotify/')) {
        config.headers.Authorization = `Bearer ${this.accessToken}`
      }
      return config
    })

    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401 && this.refreshToken) {
          try {
            await this.refreshAccessToken()
            return axios.request(error.config)
          } catch (refreshError) {
            this.logout()
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  // Authentication methods
  getAuthUrl() {
    return `${this.baseURL}/auth/login`
  }

  async authenticate(code) {
    try {
      const response = await axios.post(`${this.baseURL}/auth/callback`, { code })
      const { access_token, refresh_token, user } = response.data
      
      this.accessToken = access_token
      this.refreshToken = refresh_token
      
      localStorage.setItem('spotify_access_token', access_token)
      localStorage.setItem('spotify_refresh_token', refresh_token)
      
      return user
    } catch (error) {
      throw new Error('Authentication failed')
    }
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {
        refresh_token: this.refreshToken
      })
      
      const { access_token } = response.data
      this.accessToken = access_token
      localStorage.setItem('spotify_access_token', access_token)
      
      return response.data
    } catch (error) {
      throw new Error('Token refresh failed')
    }
  }

  async getCurrentUser() {
    try {
      const response = await axios.get(`${this.baseURL}/spotify/me`)
      return response.data
    } catch (error) {
      throw new Error('Failed to get current user')
    }
  }

  logout() {
    this.accessToken = null
    this.refreshToken = null
    localStorage.removeItem('spotify_access_token')
    localStorage.removeItem('spotify_refresh_token')
  }

  // Spotify API methods
  async getCurrentTrack() {
    try {
      const response = await axios.get(`${this.baseURL}/spotify/currently-playing`)
      return response.data
    } catch (error) {
      console.error('Error getting current track:', error)
      return null
    }
  }

  async getPlaybackState() {
    try {
      const response = await axios.get(`${this.baseURL}/spotify/playback-state`)
      return response.data
    } catch (error) {
      console.error('Error getting playback state:', error)
      return null
    }
  }

  async getUserPlaylists() {
    try {
      const response = await axios.get(`${this.baseURL}/spotify/playlists`)
      return response.data.items || []
    } catch (error) {
      console.error('Error getting playlists:', error)
      return []
    }
  }

  async createPlaylist(name, description = '') {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/playlists`, {
        name,
        description,
        public: false
      })
      return response.data
    } catch (error) {
      console.error('Error creating playlist:', error)
      throw error
    }
  }

  async addToPlaylist(playlistId, trackId) {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/playlists/${playlistId}/tracks`, {
        track_id: trackId
      })
      return response.data
    } catch (error) {
      console.error('Error adding to playlist:', error)
      throw error
    }
  }

  async removeFromPlaylist(playlistId, trackId) {
    try {
      const response = await axios.delete(`${this.baseURL}/spotify/playlists/${playlistId}/tracks`, {
        data: { track_id: trackId }
      })
      return response.data
    } catch (error) {
      console.error('Error removing from playlist:', error)
      throw error
    }
  }

  // Playback control methods
  async play(deviceId = null) {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/play`, {
        device_id: deviceId
      })
      return response.data
    } catch (error) {
      console.error('Error playing:', error)
      throw error
    }
  }

  async pause() {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/pause`)
      return response.data
    } catch (error) {
      console.error('Error pausing:', error)
      throw error
    }
  }

  async skipToNext() {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/next`)
      return response.data
    } catch (error) {
      console.error('Error skipping to next:', error)
      throw error
    }
  }

  async skipToPrevious() {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/previous`)
      return response.data
    } catch (error) {
      console.error('Error skipping to previous:', error)
      throw error
    }
  }

  async setVolume(volumePercent) {
    try {
      const response = await axios.post(`${this.baseURL}/spotify/volume`, {
        volume_percent: volumePercent
      })
      return response.data
    } catch (error) {
      console.error('Error setting volume:', error)
      throw error
    }
  }

  async search(query, type = 'track', limit = 20) {
    try {
      const response = await axios.get(`${this.baseURL}/spotify/search`, {
        params: { q: query, type, limit }
      })
      return response.data
    } catch (error) {
      console.error('Error searching:', error)
      throw error
    }
  }
}

export const spotifyApi = new SpotifyAPI()
EOF

# Utils
cat > src/utils/constants.js << 'EOF'
export const SPOTIFY_SCOPES = [
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

export const DEFAULT_PLAYLISTS = [
  { name: "Workout", key: "W" },
  { name: "Chill", key: "C" },
  { name: "Party", key: "P" },
  { name: "Focus", key: "F" },
  { name: "Road Trip", key: "R" },
  { name: "Sleep", key: "S" }
]

export const KEYBOARD_SHORTCUTS = {
  SPACE: ' ',
  ENTER: 'Enter',
  ESCAPE: 'Escape'
}
EOF

cat > src/utils/helpers.js << 'EOF'
export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

export const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return 'Unknown Artist'
  return artists.map(artist => artist.name).join(', ')
}

export const getImageUrl = (images, size = 'medium') => {
  if (!images || images.length === 0) return null
  
  const sizeMap = {
    small: 64,
    medium: 300,
    large: 640
  }
  
  const targetSize = sizeMap[size] || 300
  
  // Find the closest image size
  const sortedImages = images.sort((a, b) => 
    Math.abs(a.width - targetSize) - Math.abs(b.width - targetSize)
  )
  
  return sortedImages[0]?.url || null
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const generatePlaylistKey = (existingKeys) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let char of alphabet) {
    if (!existingKeys.includes(char)) {
      return char
    }
  }
  return null
}
EOF

cd ..

echo "✅ Frontend services and utils populated!"