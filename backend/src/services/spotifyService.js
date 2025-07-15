import axios from 'axios'
import config from '../config/index.js'

export class SpotifyService {
  constructor() {
    this.clientId = config.SPOTIFY_CLIENT_ID
    this.clientSecret = config.SPOTIFY_CLIENT_SECRET
    this.redirectUri = config.SPOTIFY_REDIRECT_URI
    this.baseURL = 'https://api.spotify.com/v1'
    this.authURL = 'https://accounts.spotify.com'

    console.log('✅ [SpotifyService] Successfully initialized')
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
      console.error('❌ [SpotifyService] Token exchange error:', error.response?.data || error.message)
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
      console.error('❌ [SpotifyService] Token refresh error:', error.response?.data || error.message)
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
      console.error(`❌ [SpotifyService] API error (${endpoint}):`, error.response?.data || error.message)
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
        return null
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

  async search(accessToken, query, type = 'track', limit = 20) {
    const params = new URLSearchParams({
      q: query,
      type,
      limit: limit.toString()
    })
    
    return this.makeSpotifyRequest(accessToken, `/search?${params.toString()}`)
  }

  async getLikedSongs(accessToken, limit = 50, offset = 0) {
    // Try to get user's market first
    let userMarket = 'US' // Default fallback
    try {
      const userProfile = await this.getCurrentUser(accessToken)
      userMarket = userProfile.country || 'US'
    } catch (error) {
      console.log('⚠️ [SpotifyService] Could not get user market, using US as default')
    }

    const endpoint = `/me/tracks?limit=${limit}&offset=${offset}&market=${userMarket}`
    const data = await this.makeSpotifyRequest(accessToken, endpoint)
    
    const tracks = data.items.map(item => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(', '),
      album: item.track.album.name,
      album_art: item.track.album.images[0]?.url,
      duration_ms: item.track.duration_ms,
      popularity: item.track.popularity,
      explicit: item.track.explicit,
      preview_url: item.track.preview_url,
      uri: item.track.uri,
      added_at: item.added_at,
      release_date: item.track.album.release_date,
      track_number: item.track.track_number,
      disc_number: item.track.disc_number
    }))

    return {
      items: tracks,
      total: data.total,
      limit: data.limit,
      offset: data.offset,
      next: data.next,
      previous: data.previous
    }
  }

  async getAudioFeatures(accessToken, trackId) {
    try {
      return await this.makeSpotifyRequest(accessToken, `/audio-features/${trackId}`)
    } catch (error) {
      console.error(`Error getting audio features for ${trackId}:`, error)
      return null
    }
  }

  async getAudioFeaturesMultiple(accessToken, trackIds) {
    try {
      const ids = trackIds.join(',')
      const data = await this.makeSpotifyRequest(accessToken, `/audio-features?ids=${ids}`)
      return data.audio_features || []
    } catch (error) {
      console.error('Error getting multiple audio features:', error)
      return []
    }
  }

  async getTrackDetails(accessToken, trackId) {
    try {
      return await this.makeSpotifyRequest(accessToken, `/tracks/${trackId}`)
    } catch (error) {
      console.error(`Error getting track details for ${trackId}:`, error)
      return null
    }
  }

  async testPreviewUrls(accessToken) {
    console.log('🔍 [SpotifyService] Testing mainstream tracks with different API approaches...')
    
    // Test 1: Direct track access without market
    try {
      const track1 = await this.makeSpotifyRequest(accessToken, '/tracks/7qiZfU4dY1lWllzX7mPBI3')
      console.log(`   Test 1 (no market): "${track1.name}" - Preview: ${track1.preview_url ? 'AVAILABLE ✅' : 'NULL ❌'}`)
    } catch (error) {
      console.log(`   Test 1 error:`, error.message)
    }

    // Test 2: With specific market
    try {
      const track2 = await this.makeSpotifyRequest(accessToken, '/tracks/7qiZfU4dY1lWllzX7mPBI3?market=US')
      console.log(`   Test 2 (market=US): "${track2.name}" - Preview: ${track2.preview_url ? 'AVAILABLE ✅' : 'NULL ❌'}`)
    } catch (error) {
      console.log(`   Test 2 error:`, error.message)
    }

    // Test 3: Different popular track
    try {
      const track3 = await this.makeSpotifyRequest(accessToken, '/tracks/1rfofaqEpACxVEHIZBJe6W') // Uptown Funk
      console.log(`   Test 3 (Uptown Funk): "${track3.name}" - Preview: ${track3.preview_url ? 'AVAILABLE ✅' : 'NULL ❌'}`)
    } catch (error) {
      console.log(`   Test 3 error:`, error.message)
    }

    // Test 4: Check user's account type and country
    try {
      const user = await this.getCurrentUser(accessToken)
      console.log(`   User country: ${user.country}`)
      console.log(`   User product: ${user.product || 'unknown'}`)
      console.log(`   User ID: ${user.id}`)
    } catch (error) {
      console.log(`   User info error:`, error.message)
    }

    // Test 5: Check if this is app-specific by testing a simple search
    try {
      const searchResult = await this.makeSpotifyRequest(accessToken, '/search?q=taylor%20swift%20shake%20it%20off&type=track&limit=1')
      if (searchResult.tracks.items[0]) {
        const track = searchResult.tracks.items[0]
        console.log(`   Test 5 (Taylor Swift): "${track.name}" - Preview: ${track.preview_url ? 'AVAILABLE ✅' : 'NULL ❌'}`)
        if (track.preview_url) {
          console.log(`   Preview URL sample: ${track.preview_url.substring(0, 50)}...`)
        }
      }
    } catch (error) {
      console.log(`   Test 5 error:`, error.message)
    }
  }

  async playTrack(accessToken, trackId, action = 'play') {
    try {
      if (action === 'play') {
        // Start playback of specific track
        return await this.makeSpotifyRequest(
          accessToken,
          '/me/player/play',
          'PUT',
          {
            uris: [`spotify:track:${trackId}`]
          }
        )
      } else if (action === 'pause') {
        // Pause playback
        return await this.makeSpotifyRequest(accessToken, '/me/player/pause', 'PUT')
      }
    } catch (error) {
      console.error(`Error controlling playback:`, error)
      throw error
    }
  }

  async getPlaybackState(accessToken) {
    try {
      return await this.makeSpotifyRequest(accessToken, '/me/player')
    } catch (error) {
      if (error.response?.status === 204) {
        return null // No active device
      }
      throw error
    }
  }

  async getArtistDetails(accessToken, artistId) {
    try {
      return await this.makeSpotifyRequest(accessToken, `/artists/${artistId}`)
    } catch (error) {
      console.error(`Error getting artist details for ${artistId}:`, error)
      return null
    }
  }
}
