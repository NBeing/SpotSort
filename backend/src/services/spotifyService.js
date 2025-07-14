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
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      
      const response = await axios.post(`${this.authURL}/api/token`, 
        new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: this.redirectUri
        }), {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

      return response.data
    } catch (error) {
      console.error('Token exchange error:', error.response?.data || error.message)
      throw new Error('Failed to exchange code for tokens')
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const authString = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')
      
      const response = await axios.post(`${this.authURL}/api/token`,
        new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: refreshToken
        }), {
          headers: {
            'Authorization': `Basic ${authString}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      )

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
      if (error.response?.status === 401) {
        throw new Error('TOKEN_EXPIRED')
      }
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
        is_playing: data.is_playing,
        uri: data.item.uri
      }
    } catch (error) {
      if (error.response?.status === 204) {
        return null // No track currently playing
      }
      throw error
    }
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
}
