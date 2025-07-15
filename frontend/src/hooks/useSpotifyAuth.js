import { useState, useEffect } from 'react'

export const useSpotifyAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true

    const checkAuth = async () => {
      console.log('🔍 [Auth] Starting authentication check...')
      
      try {
        setLoading(true)
        setError(null)

        // Check URL parameters first
        const urlParams = new URLSearchParams(window.location.search)
        const authError = urlParams.get('error')
        const authSuccess = urlParams.get('auth')
        
        if (authError) {
          console.log('❌ [Auth] Error in URL:', authError)
          if (mounted) {
            setError(`Authentication failed: ${authError}`)
            setLoading(false)
          }
          // Clean up URL
          window.history.replaceState({}, document.title, window.location.pathname)
          return
        }

        if (authSuccess === 'success') {
          console.log('✅ [Auth] Success parameter found, cleaning URL')
          window.history.replaceState({}, document.title, window.location.pathname)
          // Small delay to ensure backend session is ready
          await new Promise(resolve => setTimeout(resolve, 500))
        }

        // Check session with backend
        console.log('🔍 [Auth] Checking session with backend...')
        const response = await fetch('http://127.0.0.1:5000/api/auth/session', {
          credentials: 'include',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })

        console.log('🔍 [Auth] Session response status:', response.status)

        if (response.ok) {
          const sessionData = await response.json()
          console.log('✅ [Auth] Session data received:', sessionData.user?.display_name || sessionData.user?.id || 'User')
          
          if (mounted && sessionData.user) {
            setUser(sessionData.user)
          }
        } else if (response.status === 401) {
          console.log('ℹ️ [Auth] Not authenticated (401)')
          if (mounted) {
            setUser(null)
          }
        } else {
          console.log('⚠️ [Auth] Unexpected response:', response.status)
          const errorText = await response.text()
          console.log('⚠️ [Auth] Error response:', errorText)
          if (mounted) {
            setUser(null)
          }
        }
      } catch (err) {
        console.error('❌ [Auth] Check failed:', err)
        if (mounted) {
          setError(`Connection failed: ${err.message}`)
        }
      } finally {
        if (mounted) {
          console.log('🔍 [Auth] Authentication check complete')
          setLoading(false)
        }
      }
    }

    // Small delay to prevent race conditions
    const timer = setTimeout(checkAuth, 200)

    return () => {
      mounted = false
      clearTimeout(timer)
    }
  }, [])

  const login = () => {
    console.log('🔍 [Auth] Redirecting to login...')
    window.location.href = 'http://127.0.0.1:5000/api/auth/login'
  }

  const logout = async () => {
    try {
      console.log('🔍 [Auth] Logging out...')
      await fetch('http://127.0.0.1:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
      setUser(null)
      setError(null)
      console.log('✅ [Auth] Logout successful')
    } catch (err) {
      console.error('❌ [Auth] Logout failed:', err)
      // Clear user anyway
      setUser(null)
    }
  }

  return {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  }
}
