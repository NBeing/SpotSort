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
  }
}