import { useState, useEffect, useRef } from 'react'
import { spotifyApi } from '../services/spotifyApi'

export const useSpotifyAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const initRef = useRef(false)

  useEffect(() => {
    // Prevent multiple initializations
    if (initRef.current) return
    initRef.current = true

    const initAuth = async () => {
      try {
        setLoading(true)
        setError(null)

        // Check for auth success/error in URL
        const urlParams = new URLSearchParams(window.location.search)
        const authSuccess = urlParams.get('auth')
        const authError = urlParams.get('error')
        
        if (authError) {
          setError(`Authentication failed: ${authError}`)
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }

        if (authSuccess === 'success') {
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
        }

        // Check if user is already authenticated
        const session = await spotifyApi.getSession()
        if (session && session.user) {
          setUser(session.user)
        } else {
          setUser(null)
        }
      } catch (err) {
        console.error('Auth initialization error:', err)
        // Don't set error for failed session check, just log it
        setUser(null)
      } finally {
        setLoading(false)
      }
    }

    // Add a small delay to prevent rapid-fire requests
    const timer = setTimeout(initAuth, 100)
    return () => clearTimeout(timer)
  }, [])

  const logout = async () => {
    try {
      await spotifyApi.logout()
      setUser(null)
      setError(null)
    } catch (err) {
      console.error('Logout error:', err)
      // Still clear user even if logout request failed
      setUser(null)
    }
  }

  const login = () => {
    window.location.href = spotifyApi.getAuthUrl()
  }

  return {
    user,
    loading,
    error,
    logout,
    login,
    isAuthenticated: !!user
  }
}
