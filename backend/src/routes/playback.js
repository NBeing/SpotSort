import express from 'express'
import { authenticateToken } from '../middleware/auth.js'

export const createPlaybackRoutes = (spotifyService) => {
  const router = express.Router()

  // Play/pause a specific track
  router.post('/play-track', authenticateToken, async (req, res) => {
    try {
      const { track_id, action = 'play' } = req.body

      if (!track_id) {
        return res.status(400).json({ error: 'Track ID is required' })
      }

      console.log(`🎵 [Playback] ${action} track ${track_id} for user ${req.session.user.id}`)

      await spotifyService.playTrack(req.accessToken, track_id, action)

      res.json({ 
        message: `Track ${action} command sent successfully`,
        track_id,
        action
      })
    } catch (error) {
      console.error('❌ [Playback] Error controlling playback:', error)
      
      if (error.response?.status === 404) {
        return res.status(404).json({ 
          error: 'No active device found. Please open Spotify on any device first.' 
        })
      }
      
      if (error.response?.status === 403) {
        return res.status(403).json({ 
          error: 'Premium subscription required for playback control.' 
        })
      }

      res.status(500).json({ 
        error: 'Failed to control playback',
        details: error.message 
      })
    }
  })

  // Get current playback state
  router.get('/playback-state', authenticateToken, async (req, res) => {
    try {
      const playbackState = await spotifyService.getPlaybackState(req.accessToken)
      res.json(playbackState)
    } catch (error) {
      console.error('❌ [Playback] Error getting playback state:', error)
      res.status(500).json({ 
        error: 'Failed to get playback state',
        details: error.message 
      })
    }
  })

  return router
}
