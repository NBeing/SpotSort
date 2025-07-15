const API_BASE_URL = 'http://127.0.0.1:5000/api'

class SpotifyAPI {
  constructor() {
    this.baseURL = API_BASE_URL
    console.log('🔍 [SpotifyAPI] Initialized with baseURL:', this.baseURL)
  }

  // Authentication methods
  getAuthUrl() {
    return `${this.baseURL}/auth/login`
  }

  async getSession() {
    try {
      const response = await fetch(`${this.baseURL}/auth/session`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        return await response.json()
      }
      return null
    } catch (error) {
      console.error('Session check failed:', error)
      return null
    }
  }

  async logout() {
    try {
      await fetch(`${this.baseURL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      })
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Test backend connection
  async testConnection() {
    try {
      const response = await fetch(`${this.baseURL}/health`)
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Backend connection OK:', data)
        return data
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.error('❌ [SpotifyAPI] Backend connection failed:', error)
      throw error
    }
  }

  // Spotify API methods
  async getCurrentTrack() {
    try {
      console.log('🔍 [SpotifyAPI] Getting current track...')
      const response = await fetch(`${this.baseURL}/spotify/currently-playing`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Current track:', data?.title || 'None playing')
        return data
      }
      console.log('ℹ️ [SpotifyAPI] No current track')
      return null
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error getting current track:', error)
      return null
    }
  }

  async getUserPlaylists() {
    try {
      console.log('🔍 [SpotifyAPI] Getting user playlists...')
      const response = await fetch(`${this.baseURL}/spotify/playlists`, {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Playlists loaded:', data.items?.length || 0)
        return data.items || []
      }
      return []
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error getting playlists:', error)
      return []
    }
  }

  async createPlaylist(name, description = '') {
    try {
      console.log(`🔍 [SpotifyAPI] Creating playlist "${name}"...`)
      const response = await fetch(`${this.baseURL}/spotify/playlists`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          name,
          description,
          public: false
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Playlist created:', data.name)
        return data
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error creating playlist:', error)
      throw error
    }
  }

  async addToPlaylist(playlistId, trackId) {
    try {
      console.log(`🔍 [SpotifyAPI] Adding track ${trackId} to playlist ${playlistId}...`)
      const response = await fetch(`${this.baseURL}/spotify/playlists/${playlistId}/tracks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          track_id: trackId
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Track added to playlist')
        return data
      }
      throw new Error(`HTTP ${response.status}`)
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error adding to playlist:', error)
      throw error
    }
  }

  async searchTracks(query, limit = 20) {
    try {
      console.log(`🔍 [SpotifyAPI] Searching for "${query}"...`)
      const response = await fetch(`${this.baseURL}/spotify/search?q=${encodeURIComponent(query)}&type=track&limit=${limit}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Search results:', data.tracks?.items?.length || 0)
        return data.tracks?.items || []
      }
      return []
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error searching:', error)
      return []
    }
  }

  async getPlaylistTracks(playlistId) {
    try {
      console.log(`🔍 [SpotifyAPI] Getting tracks for playlist ${playlistId}...`)
      const response = await fetch(`${this.baseURL}/spotify/playlists/${playlistId}/tracks`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ [SpotifyAPI] Playlist tracks:', data.items?.length || 0)
        return data.items || []
      }
      return []
    } catch (error) {
      console.error('❌ [SpotifyAPI] Error getting playlist tracks:', error)
      return []
    }
  }
}

export const spotifyApi = new SpotifyAPI()

// Test connection on load
spotifyApi.testConnection().catch(() => {
  console.warn('⚠️ Backend may not be running')
})
