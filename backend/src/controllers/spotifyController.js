import { SpotifyService } from '../services/spotifyService.js'

export class SpotifyController {
  constructor() {
    this.spotifyService = new SpotifyService()
  }

  async getCurrentUser(req, res) {
    try {
      const user = await this.spotifyService.getCurrentUser(req.accessToken)
      res.json(user)
    } catch (error) {
      console.error('Get current user error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get user info' })
    }
  }

  async getCurrentlyPlaying(req, res) {
    try {
      const track = await this.spotifyService.getCurrentlyPlaying(req.accessToken)
      res.json(track)
    } catch (error) {
      console.error('Get currently playing error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get current track' })
    }
  }

  async getUserPlaylists(req, res) {
    try {
      const playlists = await this.spotifyService.getUserPlaylists(req.accessToken)
      res.json(playlists)
    } catch (error) {
      console.error('Get playlists error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get playlists' })
    }
  }

  async createPlaylist(req, res) {
    try {
      const { name, description, public: isPublic } = req.body
      
      if (!name) {
        return res.status(400).json({ error: 'Playlist name is required' })
      }

      const playlist = await this.spotifyService.createPlaylist(
        req.accessToken, 
        name, 
        description || '', 
        isPublic || false
      )
      res.json(playlist)
    } catch (error) {
      console.error('Create playlist error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to create playlist' })
    }
  }

  async addToPlaylist(req, res) {
    try {
      const { id: playlistId } = req.params
      const { track_id } = req.body
      
      if (!track_id) {
        return res.status(400).json({ error: 'Track ID is required' })
      }

      await this.spotifyService.addToPlaylist(req.accessToken, playlistId, track_id)
      res.json({ message: 'Track added to playlist successfully' })
    } catch (error) {
      console.error('Add to playlist error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to add track to playlist' })
    }
  }

  async search(req, res) {
    try {
      const { q, type = 'track', limit = 20 } = req.query
      
      if (!q) {
        return res.status(400).json({ error: 'Query parameter q is required' })
      }

      const results = await this.spotifyService.search(req.accessToken, q, type, limit)
      res.json(results)
    } catch (error) {
      console.error('Search error:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Search failed' })
    }
  }
}
