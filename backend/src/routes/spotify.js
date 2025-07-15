import express from 'express'
import { SpotifyController } from '../controllers/spotifyController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const spotifyController = new SpotifyController()

// Apply authentication to all routes
router.use(authenticateToken)

// User info
router.get('/me', spotifyController.getCurrentUser.bind(spotifyController))

// Playback
router.get('/currently-playing', spotifyController.getCurrentlyPlaying.bind(spotifyController))

// Playlists
router.get('/playlists', spotifyController.getUserPlaylists.bind(spotifyController))
router.post('/playlists', spotifyController.createPlaylist.bind(spotifyController))
router.post('/playlists/:id/tracks', spotifyController.addToPlaylist.bind(spotifyController))

// Search
router.get('/search', spotifyController.search.bind(spotifyController))

export default router
