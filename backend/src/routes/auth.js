import express from 'express'
import { AuthController } from '../controllers/authController.js'

const router = express.Router()
const authController = new AuthController()

// Spotify OAuth flow
router.get('/login', authController.login.bind(authController))
router.get('/callback', authController.callback.bind(authController))

// Token management
router.post('/refresh', authController.refresh.bind(authController))
router.post('/logout', authController.logout.bind(authController))

// Session info
router.get('/session', authController.getSession.bind(authController))

export default router
