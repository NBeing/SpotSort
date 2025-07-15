import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Music, Clock, TrendingUp, Volume2, X } from 'lucide-react'

const LikedSongsOrganizer = ({ onClose, playlists, onAddToPlaylist }) => {
  const [songs, setSongs] = useState([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [error, setError] = useState(null)
  const [pendingPlaylist, setPendingPlaylist] = useState(null)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const currentSong = songs[currentSongIndex]

  useEffect(() => {
    loadUnsortedSongs()
    loadStats()
  }, [])

  useEffect(() => {
    // Cleanup audio when component unmounts or song changes
    return () => {
      if (audioPreview) {
        audioPreview.pause()
        setAudioPreview(null)
        setIsPlaying(false)
      }
    }
  }, [currentSongIndex])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return

      const key = event.key.toUpperCase()

      // Handle confirmation flow
      if (showConfirmation) {
        if (key === 'ENTER') {
          event.preventDefault()
          confirmAddToPlaylist()
          return
        } else if (key === 'ESCAPE') {
          event.preventDefault()
          cancelConfirmation()
          return
        }
        return // Block all other keys during confirmation
      }

      // Handle playlist keys (A-Z)
      if (key.match(/[A-Z]/)) {
        event.preventDefault()
        showPlaylistConfirmation(key)
        return
      }

      // Handle navigation keys
      switch (key) {
        case 'ARROWRIGHT':
          event.preventDefault()
          nextSong()
          break
        case 'ARROWLEFT':
          event.preventDefault()
          prevSong()
          break
        case ' ':
          event.preventDefault()
          togglePreview()
          break
        case 'ENTER':
          event.preventDefault()
          togglePreview()
          break
        case 'ESCAPE':
          event.preventDefault()
          nextSong() // Skip song
          break
        default:
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [currentSong, audioPreview, showConfirmation, pendingPlaylist])

  const loadUnsortedSongs = async () => {
    try {
      setLoading(true)
      setError(null)
      console.log('🔍 Loading unsorted songs...')
      
      const response = await fetch('http://127.0.0.1:5000/api/liked-songs/unsorted?limit=50', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('✅ Loaded unsorted songs:', data.items.length)
        console.log('📊 Sample song data:', data.items[0]) // Debug log
        setSongs(data.items)
        
        if (data.items.length === 0) {
          console.log('🎉 No unsorted songs found!')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }
    } catch (error) {
      console.error('❌ Error loading unsorted songs:', error)
      setError(`Failed to load songs: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('http://127.0.0.1:5000/api/liked-songs/stats', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('📊 Stats loaded:', data)
        setStats(data)
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error)
    }
  }

  const showPlaylistConfirmation = (playlistKey) => {
    const playlist = playlists.find(p => p.key.toLowerCase() === playlistKey.toLowerCase())
    if (!playlist) {
      console.log('❌ Playlist not found for key:', playlistKey)
      return
    }
    setPendingPlaylist({ key: playlistKey, playlist })
    setShowConfirmation(true)
  }

  const confirmAddToPlaylist = async () => {
    if (!pendingPlaylist) return
    await handleAddToPlaylist(pendingPlaylist.key)
    cancelConfirmation()
  }

  const cancelConfirmation = () => {
    setPendingPlaylist(null)
    setShowConfirmation(false)
  }

  const handleAddToPlaylist = async (playlistKey) => {
    if (!currentSong) return

    const playlist = playlists.find(p => p.key.toLowerCase() === playlistKey.toLowerCase())
    if (!playlist) {
      console.log('❌ Playlist not found for key:', playlistKey)
      return
    }

    try {
      console.log(`🔍 Adding "${currentSong.title}" to "${playlist.name}"`)

      // Add to Spotify playlist first
      if (playlist.spotify_id && currentSong.id) {
        const response = await fetch(`http://127.0.0.1:5000/api/spotify/playlists/${playlist.spotify_id}/tracks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ track_id: currentSong.id })
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to add to playlist')
        }
      }

      // Mark as sorted in backend
      await fetch('http://127.0.0.1:5000/api/liked-songs/mark-sorted', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          track_id: currentSong.id,
          playlist_id: playlist.spotify_id || playlist.id,
          playlist_name: playlist.name
        })
      })

      console.log('✅ Song added and marked as sorted')

      // Move to next song
      nextSong()
      
      // Update stats
      loadStats()
    } catch (error) {
      console.error('❌ Error adding song to playlist:', error)
      setError(`Failed to add song: ${error.message}`)
    }
  }

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1)
    } else {
      // No more songs, reload to check for new ones
      loadUnsortedSongs()
    }
  }

  const prevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1)
    }
  }

  const togglePreview = async () => {
    if (!currentSong?.id) {
      console.log('❌ No song ID available')
      return
    }

    console.log('🎵 Attempting to play song:', currentSong.title)
    console.log('🔍 Current song data:', {
      id: currentSong.id,
      title: currentSong.title,
      preview_url: currentSong.preview_url,
      hasPreview: !!currentSong.preview_url
    })

    // Option 1: Try preview URL first (30-second clip)
    if (currentSong.preview_url) {
      console.log('▶️ Playing 30-second preview')
      if (audioPreview && !audioPreview.paused) {
        console.log('⏸️ Pausing current preview')
        audioPreview.pause()
        setIsPlaying(false)
      } else {
        if (audioPreview) {
          console.log('▶️ Resuming existing preview')
          audioPreview.play().then(() => {
            setIsPlaying(true)
          }).catch(error => {
            console.error('❌ Error resuming preview:', error)
            setIsPlaying(false)
          })
        } else {
          console.log('▶️ Creating new audio preview')
          try {
            const audio = new Audio(currentSong.preview_url)
            
            audio.addEventListener('loadstart', () => console.log('🔄 Audio loading started'))
            audio.addEventListener('canplaythrough', () => console.log('✅ Audio can play through'))
            audio.addEventListener('ended', () => {
              console.log('⏹️ Audio ended')
              setIsPlaying(false)
            })
            audio.addEventListener('error', (e) => {
              console.error('❌ Audio error:', e)
              console.error('❌ Audio error details:', {
                error: e.target.error,
                networkState: e.target.networkState,
                readyState: e.target.readyState,
                src: e.target.src
              })
              setIsPlaying(false)
            })
            
            setAudioPreview(audio)
            
            audio.play().then(() => {
              console.log('✅ Audio playback started successfully')
              setIsPlaying(true)
            }).catch(error => {
              console.error('❌ Error starting audio playback:', error)
              setIsPlaying(false)
            })
          } catch (error) {
            console.error('❌ Error creating audio element:', error)
            setIsPlaying(false)
          }
        }
      }
    } else {
      // Option 2: Try Spotify Web Playback API for full song (Premium users)
      console.log('🎧 No preview URL available, attempting Spotify playback...')
      try {
        const response = await fetch('http://127.0.0.1:5000/api/spotify/play-track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ 
            track_id: currentSong.id,
            action: isPlaying ? 'pause' : 'play'
          })
        })

        if (response.ok) {
          const result = await response.json()
          console.log('✅ Spotify playback command sent:', result.message)
          setIsPlaying(!isPlaying)
        } else {
          const error = await response.json()
          console.log('⚠️ Spotify playback not available:', error.error)
          // Fallback: open in Spotify
          window.open(`https://open.spotify.com/track/${currentSong.id}`, '_blank')
        }
      } catch (error) {
        console.error('❌ Error with Spotify playback:', error)
        // Fallback: open in Spotify
        console.log('🔗 Opening in Spotify web player...')
        window.open(`https://open.spotify.com/track/${currentSong.id}`, '_blank')
      }
    }
  }

  const formatDuration = (ms) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = ((ms % 60000) / 1000).toFixed(0)
    return `${minutes}:${seconds.padStart(2, '0')}`
  }

  const getAudioFeatureColor = (value) => {
    if (value > 0.7) return 'text-green-400'
    if (value > 0.4) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-spotify-green mx-auto mb-4"></div>
          <div className="text-xl">Loading your liked songs...</div>
          <div className="text-sm opacity-70 mt-2">This might take a moment for large collections</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 text-center text-white max-w-md">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-4">Oops!</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="flex gap-4">
            <button
              onClick={loadUnsortedSongs}
              className="bg-spotify-green text-black px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={onClose}
              className="bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
        <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 text-center text-white max-w-md">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold mb-4">All caught up!</h2>
          <p className="text-gray-300 mb-6">
            You've sorted all your recent liked songs. Great job organizing your music!
          </p>
          {stats && (
            <div className="bg-white bg-opacity-10 rounded-lg p-4 mb-6">
              <div className="text-lg font-semibold text-spotify-green">📊 Your Progress</div>
              <div className="text-2xl font-bold">{stats.total_sorted}</div>
              <div className="text-sm text-gray-400">songs organized</div>
            </div>
          )}
          <button
            onClick={onClose}
            className="bg-spotify-green text-black px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
          >
            Awesome!
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-spotify-green text-black p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Organize Liked Songs</h2>
              <p className="opacity-80">
                Song {currentSongIndex + 1} of {songs.length}
                {stats && ` • ${stats.total_sorted} sorted total`}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-black hover:bg-black hover:bg-opacity-20 rounded-full p-2 transition-colors"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        <div className="p-6 text-white overflow-y-auto max-h-[calc(90vh-120px)]">
          {currentSong && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Song Info */}
              <div>
                <div className="flex items-center gap-6 mb-6">
                  <div className="w-32 h-32 bg-gradient-to-br from-spotify-green to-green-600 rounded-2xl overflow-hidden">
                    {currentSong.album_art ? (
                      <img 
                        src={currentSong.album_art} 
                        alt="Album art" 
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">🎵</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold mb-2">{currentSong.title}</h3>
                    <p className="text-xl text-gray-300 mb-1">{currentSong.artist}</p>
                    <p className="text-gray-400 mb-2">{currentSong.album}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span className="flex items-center gap-1">
                        <Clock size={14} />
                        {formatDuration(currentSong.duration_ms)}
                      </span>
                      <span className="flex items-center gap-1">
                        <TrendingUp size={14} />
                        {currentSong.popularity}% popular
                      </span>
                    </div>
                  </div>
                </div>

                {/* Preview Controls */}
                <div className="flex items-center gap-4 mb-6">
                  <button
                    onClick={prevSong}
                    disabled={currentSongIndex === 0}
                    className="p-3 bg-white bg-opacity-10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
                  >
                    <SkipBack size={20} />
                  </button>
                  
                  <button
                    onClick={togglePreview}
                    className="p-4 bg-spotify-green text-black rounded-full hover:bg-green-600 transition-colors"
                    title={currentSong.preview_url ? 'Play 30s preview' : 'Play in Spotify or open in new tab'}
                  >
                    {isPlaying ? <Pause size={24} /> : <Play size={24} />}
                  </button>
                  
                  <button
                    onClick={nextSong}
                    disabled={currentSongIndex === songs.length - 1}
                    className="p-3 bg-white bg-opacity-10 rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-opacity-20 transition-colors"
                  >
                    <SkipForward size={20} />
                  </button>
                  
                  <div className="flex-1 text-center">
                    {currentSong.preview_url ? (
                      <div className="flex items-center justify-center gap-2 text-spotify-green">
                        <Volume2 size={16} />
                        <span className="text-sm">🎵 30s preview available</span>
                      </div>
                    ) : (
                      <div className="text-center">
                        <span className="text-sm text-yellow-500 block">🎧 No preview - will use Spotify</span>
                        <div className="text-xs text-gray-600 mt-1">
                          Premium: plays in your Spotify • Others: opens web player
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Progress */}
                <div className="mb-6 p-4 bg-white bg-opacity-5 rounded-xl">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-400">Progress</span>
                    <span className="text-sm font-medium">
                      {currentSongIndex + 1} / {songs.length}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div
                      className="bg-spotify-green h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((currentSongIndex + 1) / songs.length) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* Playlist Selection */}
              <div>
                <h4 className="text-xl font-semibold mb-4 text-spotify-green">
                  Choose a playlist (or press a key):
                </h4>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {playlists.map((playlist) => (
                    <button
                      key={playlist.key}
                      onClick={() => showPlaylistConfirmation(playlist.key)}
                      className="p-4 bg-white bg-opacity-10 rounded-xl hover:bg-opacity-20 transition-all duration-300 hover:-translate-y-1 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-spotify-green text-black rounded-lg px-2 py-1 font-bold text-sm group-hover:bg-green-400 transition-colors">
                          {playlist.key}
                        </div>
                        <div className="flex-1">
                          <div className="font-medium truncate">{playlist.name}</div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            <Music size={10} />
                            {playlist.track_count || playlist.songs?.length || 0} songs
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Skip Song */}
                <button
                  onClick={nextSong}
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors text-center mb-4"
                >
                  Skip this song (don't sort)
                </button>

                {/* Keyboard Shortcuts Help */}
                <div className="bg-white bg-opacity-5 rounded-xl p-4">
                  <h5 className="font-semibold mb-2 text-spotify-green">⌨️ Keyboard Shortcuts</h5>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div><strong>A-Z:</strong> Select playlist (with confirmation)</div>
                    <div><strong>Space/Enter:</strong> Play/pause preview</div>
                    <div><strong>→:</strong> Next song</div>
                    <div><strong>←:</strong> Previous song</div>
                    <div><strong>Escape:</strong> Skip song</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Modal */}
        {showConfirmation && pendingPlaylist && (
          <div className="absolute inset-0 bg-black bg-opacity-80 flex items-center justify-center z-10">
            <div className="bg-gradient-to-br from-spotify-green to-green-600 rounded-2xl p-6 text-black max-w-md mx-4">
              <h3 className="text-xl font-bold mb-4">Confirm Playlist Selection</h3>
              <div className="mb-4">
                <p className="mb-2">Add this song to:</p>
                <div className="bg-black bg-opacity-20 rounded-lg p-3">
                  <div className="flex items-center gap-3">
                    <div className="bg-black text-spotify-green rounded px-2 py-1 font-bold text-sm">
                      {pendingPlaylist.key}
                    </div>
                    <div className="text-black font-medium">
                      {pendingPlaylist.playlist.name}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-sm opacity-80 mb-4">
                Press <strong>Enter</strong> to confirm or <strong>Escape</strong> to cancel
              </div>
              <div className="flex gap-3">
                <button
                  onClick={confirmAddToPlaylist}
                  className="bg-black text-spotify-green px-4 py-2 rounded-lg font-bold hover:bg-gray-900 transition-colors flex-1"
                >
                  ✓ Confirm (Enter)
                </button>
                <button
                  onClick={cancelConfirmation}
                  className="bg-white bg-opacity-20 text-black px-4 py-2 rounded-lg font-bold hover:bg-opacity-30 transition-colors"
                >
                  Cancel (Esc)
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default LikedSongsOrganizer
