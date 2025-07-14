import { useState } from 'react'

export const usePlaylistManager = () => {
  // Sample data for now
  const [currentSong] = useState({
    title: "Blinding Lights",
    artist: "The Weeknd",
    album: "After Hours",
    id: "sample"
  })

  const [playlists] = useState([
    { name: "Workout", key: "W", songs: [], id: "workout" },
    { name: "Chill", key: "C", songs: [], id: "chill" },
    { name: "Party", key: "P", songs: [], id: "party" },
    { name: "Focus", key: "F", songs: [], id: "focus" }
  ])

  const [statusMessage] = useState('Ready to organize! Press a playlist key to add the current song.')
  const [statusType] = useState('info')
  const [activePlaylist] = useState(null)

  const nextSong = () => {
    console.log('Next song clicked')
  }

  const skipSong = () => {
    console.log('Skip song clicked')
  }

  const addToPlaylist = (key) => {
    console.log('Add to playlist:', key)
  }

  const createNewPlaylist = () => {
    console.log('Create new playlist')
  }

  return {
    currentSong,
    playlists,
    statusMessage,
    statusType,
    activePlaylist,
    nextSong,
    skipSong,
    addToPlaylist,
    createNewPlaylist
  }
}
