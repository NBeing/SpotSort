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
