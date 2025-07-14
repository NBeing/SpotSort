import { useState, useEffect } from 'react'
import { spotifyApi } from '../services/spotifyApi'

export const useSpotifyAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check if user is already authenticated
        const userData = await spotifyApi.getCurrentUser()
        setUser(userData)
      } catch (err) {
        // Check for auth code in URL (after redirect)
        const urlParams = new URLSearchParams(window.location.search)
        const code = urlParams.get('code')
        
        if (code) {
          try {
            const userData = await spotifyApi.authenticate(code)
            setUser(userData)
            // Clean up URL
            window.history.replaceState({}, document.title, window.location.pathname)
          } catch (authError) {
            setError(authError.message)
          }
        }
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [])

  const logout = async () => {
    try {
      await spotifyApi.logout()
      setUser(null)
    } catch (err) {
      setError(err.message)
    }
  }

  const refreshToken = async () => {
    try {
      const userData = await spotifyApi.refreshAccessToken()
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      setUser(null)
      throw err
    }
  }

  return {
    user,
    loading,
    error,
    logout,
    refreshToken,
    isAuthenticated: !!user
  }
}
