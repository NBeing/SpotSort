import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5000/api'

class SpotifyAPI {
  constructor() {
    this.baseURL = API_BASE_URL
    this.isRefreshing = false
    this.failedQueue = []
    
    // Setup axios interceptor ONLY for this instance
    this.axiosInstance = axios.create({
      baseURL: this.baseURL,
      withCredentials: true,
      timeout: 10000
    })
    
    this.setupInterceptors()
  }

  setupInterceptors() {
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config

        // Don't retry if it's not a 401 or if we already tried
        if (error.response?.status !== 401 || originalRequest._retry) {
          return Promise.reject(error)
        }

        // Don't retry auth endpoints to prevent infinite loops
        if (originalRequest.url?.includes('/auth/')) {
          return Promise.reject(error)
        }

        // If we're already refreshing, queue this request
        if (this.isRefreshing) {
          return new Promise((resolve, reject) => {
            this.failedQueue.push({ resolve, reject })
          }).then(() => {
            return this.axiosInstance.request(originalRequest)
          }).catch(err => {
            return Promise.reject(err)
          })
        }

        originalRequest._retry = true
        this.isRefreshing = true

        try {
          await this.refreshAccessToken()
          this.processQueue(null)
          return this.axiosInstance.request(originalRequest)
        } catch (refreshError) {
          this.processQueue(refreshError)
          // Don't redirect here, let the component handle it
          return Promise.reject(refreshError)
        } finally {
          this.isRefreshing = false
        }
      }
    )
  }

  processQueue(error) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error)
      } else {
        resolve()
      }
    })
    
    this.failedQueue = []
  }

  // Authentication methods
  getAuthUrl() {
    return `${this.baseURL}/auth/login`
  }

  async refreshAccessToken() {
    try {
      const response = await axios.post(`${this.baseURL}/auth/refresh`, {}, {
        withCredentials: true,
        timeout: 5000
      })
      return response.data
    } catch (error) {
      console.error('Token refresh failed:', error)
      throw new Error('Token refresh failed')
    }
  }

  async getSession() {
    try {
      const response = await axios.get(`${this.baseURL}/auth/session`, {
        withCredentials: true,
        timeout: 5000
      })
      return response.data
    } catch (error) {
      if (error.response?.status === 401) {
        return null // Not authenticated, don't throw
      }
      console.error('Session check failed:', error)
      return null
    }
  }

  async logout() {
    try {
      await axios.post(`${this.baseURL}/auth/logout`, {}, {
        withCredentials: true,
        timeout: 5000
      })
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw, just log
    }
  }

  // Spotify API methods using the configured instance
  async getCurrentUser() {
    try {
      const response = await this.axiosInstance.get('/spotify/me')
      return response.data
    } catch (error) {
      console.error('Failed to get current user:', error)
      throw new Error('Failed to get current user')
    }
  }

  async getCurrentTrack() {
    try {
      const response = await this.axiosInstance.get('/spotify/currently-playing')
      return response.data
    } catch (error) {
      console.error('Error getting current track:', error)
      return null // Don't throw for this, just return null
    }
  }

  async getUserPlaylists() {
    try {
      const response = await this.axiosInstance.get('/spotify/playlists')
      return response.data.items || []
    } catch (error) {
      console.error('Error getting playlists:', error)
      return [] // Don't throw, return empty array
    }
  }

  async createPlaylist(name, description = '') {
    try {
      const response = await this.axiosInstance.post('/spotify/playlists', {
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
      const response = await this.axiosInstance.post(`/spotify/playlists/${playlistId}/tracks`, {
        track_id: trackId
      })
      return response.data
    } catch (error) {
      console.error('Error adding to playlist:', error)
      throw error
    }
  }
}

export const spotifyApi = new SpotifyAPI()
