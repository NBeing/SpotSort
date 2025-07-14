import { SpotifyService } from '../services/spotifyService.js'

export class AuthController {
  constructor() {
    this.spotifyService = new SpotifyService()
  }

  async login(req, res) {
    try {
      const authUrl = this.spotifyService.getAuthorizationUrl()
      res.redirect(authUrl)
    } catch (error) {
      console.error('Login error:', error)
      res.status(500).json({ error: 'Failed to initiate login' })
    }
  }

  async callback(req, res) {
    try {
      const { code, error } = req.query

      if (error) {
        return res.redirect(`${process.env.CORS_ORIGIN}/login?error=${encodeURIComponent(error)}`)
      }

      if (!code) {
        return res.redirect(`${process.env.CORS_ORIGIN}/login?error=no_code`)
      }

      const tokens = await this.spotifyService.exchangeCodeForTokens(code)
      const user = await this.spotifyService.getCurrentUser(tokens.access_token)

      // Store tokens in session
      req.session.spotify_access_token = tokens.access_token
      req.session.spotify_refresh_token = tokens.refresh_token
      req.session.user = user

      // Redirect to frontend with success
      res.redirect(`${process.env.CORS_ORIGIN}/?auth=success`)
    } catch (error) {
      console.error('Auth callback error:', error)
      res.redirect(`${process.env.CORS_ORIGIN}/login?error=auth_failed`)
    }
  }

  async refresh(req, res) {
    try {
      const refreshToken = req.session.spotify_refresh_token

      if (!refreshToken) {
        return res.status(401).json({ error: 'No refresh token available' })
      }

      const tokens = await this.spotifyService.refreshAccessToken(refreshToken)
      
      // Update session with new access token
      req.session.spotify_access_token = tokens.access_token
      if (tokens.refresh_token) {
        req.session.spotify_refresh_token = tokens.refresh_token
      }

      res.json({
        access_token: tokens.access_token,
        message: 'Token refreshed successfully'
      })
    } catch (error) {
      console.error('Token refresh error:', error)
      req.session.destroy()
      res.status(401).json({ error: 'Token refresh failed' })
    }
  }

  async logout(req, res) {
    try {
      req.session.destroy((err) => {
        if (err) {
          console.error('Logout error:', err)
          return res.status(500).json({ error: 'Logout failed' })
        }
        res.json({ message: 'Logged out successfully' })
      })
    } catch (error) {
      console.error('Logout error:', error)
      res.status(500).json({ error: 'Logout failed' })
    }
  }

  async getSession(req, res) {
    try {
      if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' })
      }

      res.json({
        user: req.session.user,
        authenticated: true
      })
    } catch (error) {
      console.error('Get session error:', error)
      res.status(500).json({ error: 'Failed to get session' })
    }
  }
}
