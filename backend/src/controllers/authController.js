import { SpotifyService } from '../services/spotifyService.js'

export class AuthController {
  constructor() {
    this.spotifyService = new SpotifyService()
  }

  async login(req, res) {
    try {
      console.log('🔍 [AuthController] Login requested')
      const authUrl = this.spotifyService.getAuthorizationUrl()
      console.log('🔍 [AuthController] Redirecting to:', authUrl)
      res.redirect(authUrl)
    } catch (error) {
      console.error('❌ [AuthController] Login error:', error)
      res.status(500).json({ error: 'Failed to initiate login' })
    }
  }

  async callback(req, res) {
    try {
      console.log('🔍 [AuthController] Callback received')
      console.log('🔍 [AuthController] Query params:', req.query)
      
      const { code, error: spotifyError, state } = req.query

      if (spotifyError) {
        console.log('❌ [AuthController] Spotify returned error:', spotifyError)
        return res.redirect(`http://127.0.0.1:3000/login?error=${encodeURIComponent(spotifyError)}`)
      }

      if (!code) {
        console.log('❌ [AuthController] No authorization code received')
        return res.redirect(`http://127.0.0.1:3000/login?error=no_code`)
      }

      console.log('🔍 [AuthController] Authorization code received, exchanging for tokens...')
      
      // Exchange code for tokens
      const tokens = await this.spotifyService.exchangeCodeForTokens(code)
      console.log('✅ [AuthController] Tokens received successfully')

      // Get user info
      console.log('🔍 [AuthController] Getting user info...')
      const user = await this.spotifyService.getCurrentUser(tokens.access_token)
      console.log('✅ [AuthController] User info received:', user.display_name || user.id)

      // Store in session
      req.session.spotify_access_token = tokens.access_token
      req.session.spotify_refresh_token = tokens.refresh_token
      req.session.user = user

      console.log('✅ [AuthController] Session saved, redirecting to frontend')

      // Redirect to frontend with success
      res.redirect(`http://127.0.0.1:3000/?auth=success`)
    } catch (error) {
      console.error('❌ [AuthController] Callback error:', error)
      console.error('❌ [AuthController] Error details:', error.response?.data || error.message)
      res.redirect(`http://127.0.0.1:3000/login?error=auth_failed`)
    }
  }

  async refresh(req, res) {
    try {
      console.log('🔍 [AuthController] Token refresh requested')
      const refreshToken = req.session.spotify_refresh_token

      if (!refreshToken) {
        console.log('❌ [AuthController] No refresh token in session')
        return res.status(401).json({ error: 'No refresh token available' })
      }

      console.log('🔍 [AuthController] Refreshing token...')
      const tokens = await this.spotifyService.refreshAccessToken(refreshToken)
      
      // Update session with new access token
      req.session.spotify_access_token = tokens.access_token
      if (tokens.refresh_token) {
        req.session.spotify_refresh_token = tokens.refresh_token
      }

      console.log('✅ [AuthController] Token refreshed successfully')
      res.json({
        access_token: tokens.access_token,
        message: 'Token refreshed successfully'
      })
    } catch (error) {
      console.error('❌ [AuthController] Token refresh error:', error)
      req.session.destroy()
      res.status(401).json({ error: 'Token refresh failed' })
    }
  }

  async logout(req, res) {
    try {
      console.log('🔍 [AuthController] Logout requested')
      req.session.destroy((err) => {
        if (err) {
          console.error('❌ [AuthController] Logout error:', err)
          return res.status(500).json({ error: 'Logout failed' })
        }
        console.log('✅ [AuthController] Logout successful')
        res.json({ message: 'Logged out successfully' })
      })
    } catch (error) {
      console.error('❌ [AuthController] Logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  }

  async getSession(req, res) {
    try {
      console.log('🔍 [AuthController] Session check requested')
      console.log('🔍 [AuthController] Session user:', !!req.session.user)
      console.log('🔍 [AuthController] Session access token:', !!req.session.spotify_access_token)
      
      if (!req.session.user) {
        console.log('ℹ️ [AuthController] No user in session')
        return res.status(401).json({ error: 'Not authenticated' })
      }

      console.log('✅ [AuthController] Session valid')
      res.json({
        user: req.session.user,
        authenticated: true
      })
    } catch (error) {
      console.error('❌ [AuthController] Get session error:', error)
      res.status(500).json({ error: 'Failed to get session' })
    }
  }
}
