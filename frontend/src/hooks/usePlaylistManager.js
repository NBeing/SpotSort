import { useState, useEffect } from 'react'
import { spotifyApi } from '../services/spotifyApi'

export const usePlaylistManager = () => {
  const [currentSong, setCurrentSong] = useState(null)
  const [playlists, setPlaylists] = useState([])
  const [statusMessage, setStatusMessage] = useState('Ready to organize! Press a playlist key to add the current song.')
  const [statusType, setStatusType] = useState('info')
  const [activePlaylist, setActivePlaylist] = useState(null)
  const [loading, setLoading] = useState(true)

  // Generate keyboard shortcuts for playlists
  const generatePlaylistKey = (existingKeys) => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
    for (let char of alphabet) {
      if (!existingKeys.includes(char)) {
        return char
      }
    }
    return null
  }

  // Load initial data
  useEffect(() => {
    const loadSpotifyData = async () => {
      try {
        console.log('🔍 [PlaylistManager] Loading Spotify data...')
        
        // Load current song and playlists in parallel
        const [currentTrackData, playlistsData] = await Promise.all([
          spotifyApi.getCurrentTrack(),
          spotifyApi.getUserPlaylists()
        ])

        console.log('🔍 [PlaylistManager] Current track:', currentTrackData?.title || 'None')
        console.log('🔍 [PlaylistManager] Playlists loaded:', playlistsData?.length || 0)

        setCurrentSong(currentTrackData)

        // Map playlists to our format with keyboard shortcuts
        if (playlistsData && playlistsData.length > 0) {
          const existingKeys = []
          const mappedPlaylists = playlistsData.slice(0, 26).map((playlist) => {
            const key = generatePlaylistKey(existingKeys)
            existingKeys.push(key)
            
            return {
              name: playlist.name,
              key: key,
              songs: [], // We'll track songs we add, not fetch existing ones for performance
              id: playlist.id,
              spotify_id: playlist.id,
              owner: playlist.owner?.display_name || 'You',
              public: playlist.public,
              track_count: playlist.tracks?.total || 0
            }
          })
          setPlaylists(mappedPlaylists)
        } else {
          // Create some default playlists if user has none
          setPlaylists([
            { name: "Workout", key: "W", songs: [], id: "new_workout", spotify_id: null },
            { name: "Chill", key: "C", songs: [], id: "new_chill", spotify_id: null },
            { name: "Party", key: "P", songs: [], id: "new_party", spotify_id: null },
            { name: "Focus", key: "F", songs: [], id: "new_focus", spotify_id: null }
          ])
        }

        setLoading(false)
        showStatus('Spotify data loaded successfully!', 'success')
      } catch (error) {
        console.error('❌ [PlaylistManager] Error loading Spotify data:', error)
        setLoading(false)
        showStatus('Failed to load Spotify data. Using offline mode.', 'warning')
        
        // Fallback to sample data
        setCurrentSong({
          title: "Demo Song",
          artist: "Demo Artist", 
          album: "Demo Album",
          id: "demo_track"
        })
        setPlaylists([
          { name: "Workout", key: "W", songs: [], id: "demo_workout" },
          { name: "Chill", key: "C", songs: [], id: "demo_chill" }
        ])
      }
    }

    loadSpotifyData()
  }, [])

  const showStatus = (message, type = 'info') => {
    setStatusMessage(message)
    setStatusType(type)
    
    setTimeout(() => {
      setStatusMessage('Ready to organize! Press a playlist key to add the current song.')
      setStatusType('info')
    }, 3000)
  }

  const refreshCurrentSong = async () => {
    try {
      console.log('🔍 [PlaylistManager] Refreshing current song...')
      const trackData = await spotifyApi.getCurrentTrack()
      setCurrentSong(trackData)
      
      if (trackData) {
        showStatus('Current song updated!', 'info')
      } else {
        showStatus('No song currently playing', 'warning')
      }
    } catch (error) {
      console.error('❌ [PlaylistManager] Error refreshing current song:', error)
      showStatus('Failed to get current song', 'error')
    }
  }

  const addToPlaylist = async (playlistKey) => {
    const playlist = playlists.find(p => p.key.toLowerCase() === playlistKey.toLowerCase())
    if (!playlist || !currentSong) {
      console.log('❌ [PlaylistManager] No playlist or current song')
      return
    }

    try {
      console.log(`🔍 [PlaylistManager] Adding "${currentSong.title}" to "${playlist.name}"`)

      // Check if song already exists in our local tracking
      const exists = playlist.songs.some(song => 
        song.id === currentSong.id || 
        (song.title === currentSong.title && song.artist === currentSong.artist)
      )
      
      if (exists) {
        showStatus(`"${currentSong.title}" is already in ${playlist.name}`, 'warning')
        return
      }

      // If playlist doesn't exist on Spotify, create it
      if (!playlist.spotify_id) {
        console.log('🔍 [PlaylistManager] Creating new playlist on Spotify...')
        const newPlaylist = await spotifyApi.createPlaylist(playlist.name, `Created by Spotify Organizer`)
        
        // Update the playlist with the new Spotify ID
        setPlaylists(prev => prev.map(p => 
          p.id === playlist.id 
            ? { ...p, spotify_id: newPlaylist.id }
            : p
        ))
        playlist.spotify_id = newPlaylist.id
      }

      // Add to Spotify playlist
      if (currentSong.id && currentSong.id !== 'demo_track') {
        await spotifyApi.addToPlaylist(playlist.spotify_id, currentSong.id)
      }

      // Update local state
      setPlaylists(prev => prev.map(p => 
        p.key === playlist.key 
          ? { 
              ...p, 
              songs: [...p.songs, { ...currentSong }],
              track_count: (p.track_count || 0) + 1
            }
          : p
      ))
      
      showStatus(`Added "${currentSong.title}" to ${playlist.name}!`, 'success')
      
      // Visual feedback
      setActivePlaylist(playlist.key)
      setTimeout(() => setActivePlaylist(null), 1000)

    } catch (error) {
      console.error('❌ [PlaylistManager] Error adding to playlist:', error)
      showStatus(`Failed to add song to ${playlist.name}`, 'error')
    }
  }

  const createNewPlaylist = async () => {
    const name = prompt('Enter playlist name:')
    if (!name) return

    try {
      const availableKeys = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').filter(key => 
        !playlists.some(p => p.key === key)
      )
      
      if (availableKeys.length === 0) {
        showStatus('No more keyboard shortcuts available!', 'error')
        return
      }

      const key = availableKeys[0]
      
      console.log(`🔍 [PlaylistManager] Creating playlist "${name}" with key ${key}`)
      
      // Create playlist on Spotify
      const newPlaylist = await spotifyApi.createPlaylist(name, 'Created by Spotify Organizer')
      
      // Add to local state
      const playlistData = {
        name,
        key,
        songs: [],
        id: `new_${Date.now()}`,
        spotify_id: newPlaylist.id,
        owner: 'You',
        public: false,
        track_count: 0
      }
      
      setPlaylists(prev => [...prev, playlistData])
      showStatus(`Created playlist "${name}" with key ${key}!`, 'success')
    } catch (error) {
      console.error('❌ [PlaylistManager] Error creating playlist:', error)
      showStatus('Failed to create playlist', 'error')
    }
  }

  const nextSong = async () => {
    // For now, just refresh current song since we can't control playback without premium
    await refreshCurrentSong()
  }

  const skipSong = async () => {
    await refreshCurrentSong()
    showStatus('Refreshed current song!', 'info')
  }

  return {
    currentSong,
    playlists,
    statusMessage,
    statusType,
    activePlaylist,
    loading,
    nextSong,
    skipSong,
    addToPlaylist,
    createNewPlaylist,
    refreshCurrentSong
  }
}
