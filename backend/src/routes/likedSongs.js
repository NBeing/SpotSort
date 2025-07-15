import express from 'express'
import { LikedSongsController } from '../controllers/likedSongsController.js'
import { authenticateToken } from '../middleware/auth.js'

const router = express.Router()
const likedSongsController = new LikedSongsController()

// Apply authentication to all routes
router.use(authenticateToken)

// Get liked songs with optional audio features
router.get('/', likedSongsController.getLikedSongs.bind(likedSongsController))

// Get only unsorted songs
router.get('/unsorted', likedSongsController.getUnsortedSongs.bind(likedSongsController))

// Mark song as sorted
router.post('/mark-sorted', likedSongsController.markAsSorted.bind(likedSongsController))

// Get sorting statistics
router.get('/stats', likedSongsController.getSortingStats.bind(likedSongsController))

// Get individual track with full metadata
router.get('/track/:id', likedSongsController.getTrackWithFeatures.bind(likedSongsController))

export default router
