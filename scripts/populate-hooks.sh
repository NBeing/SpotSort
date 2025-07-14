#!/bin/bash

# scripts/populate-hooks.sh - Populate all custom hooks
echo "🪝 Populating custom hooks..."

cd frontend

# useSpotifyAuth Hook
cat > src/hooks/useSpotifyAuth.js << 'EOF'
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
EOF

# useKeyboardShortcuts Hook
cat > src/hooks/useKeyboardShortcuts.js << 'EOF'
import { useEffect } from 'react'

export const useKeyboardShortcuts = ({ onKeyPress, onSpace, onEnter }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase()
      
      // Ignore if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }
      
      // Handle special keys
      if (key === ' ' && onSpace) {
        event.preventDefault()
        onSpace()
        return
      }
      
      if (key === 'ENTER' && onEnter) {
        event.preventDefault()
        onEnter()
        return
      }
      
      // Handle letter keys for playlists
      if (key.match(/[A-Z]/) && onKeyPress) {
        event.preventDefault()
        onKeyPress(key)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onKeyPress, onSpace, onEnter])
}
EOF

# usePlaylistManager Hook
cat > src/hooks/usePlaylistManager.js << 'EOF'
import { useState, useEffect } from 'react'
import { spotifyApi } from '../services/spotifyApi'

export const usePlaylistManager = () => {
  const [currentSong, setCurrentSong] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready to organize! Press a playlist key to add the current song.')
  const [statusType, setStatusType] = useState('info')
  const [activePlaylist, setActivePlaylist] = useState(null)

  // Sample data for development
  const sampleSongs = [
    { title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", id: "0VjIjW4GlUZAMYd2vXMi3b" },
    { title: "Watermelon Sugar", artist: "Harry Styles", album: "Fine Line", id: "6UelLqGlWMcVH1E5c4H7lY" },
    { title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", id: "463CkQjx2Zk1yXoBuierM9" },
    { title: "Good 4 U", artist: "Olivia Rodrigo", album: "SOUR", id: "4ZtFanR9U6ndgddUvNcjcG" },
    { title: "Stay", artist: "The Kid LAROI & Justin Bieber", album: "F*CK LOVE 3", id: "5HCyWlXZPP0y6Gqq8TgA20" },
    { title: "Industry Baby", artist: "Lil Nas X & Jack Harlow", album: "MONTERO", id: "27NovPIUIRrOZoCHxABJwK" },
    { title: "Heat Waves", artist: "Glass Animals", album: "Dreamland", id: "02MWAaffLxlfxAUY7c5dvx" },
    { title: "Anti-Hero", artist: "Taylor Swift", album: "Midnights", id: "0V3wPSX9ygBnCm8psDIegu" }
  ]

  const [currentSongIndex, setCurrentSongIndex] = useState(0)

  useEffect(() => {
    // Initialize with sample data
    setCurrentSong(sampleSongs[0])
    setPlaylists([
      { name: "Workout", key: "W", songs: [], id: "workout" },
      { name: "Chill", key: "C", songs: [], id: "chill" },
      { name: "Party", key: "P", songs: [], id: "party" },
      { name: "Focus", key: "F", songs: [], id: "focus" },
      { name: "Road Trip", key: "R", songs: [], id: "roadtrip" },
      { name: "Sleep", key: "S", songs: [], id: "sleep" }
    ])

    // Load real data from Spotify API
    loadCurrentSong()
    loadPlaylists()
  }, [])

  const loadCurrentSong = async () => {
    try {
      const song = await spotifyApi.getCurrentTrack()
      if (song) {
        setCurrentSong(song)
      }
    } catch (error) {
      console.error('Error loading current song:', error)
      // Fallback to sample data
      setCurrentSong(sampleSongs[currentSongIndex])
    }