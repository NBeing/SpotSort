import React, { useState, useEffect } from 'react'
import { Play, Pause, SkipForward, SkipBack, Music, Clock, TrendingUp, Volume2 } from 'lucide-react'

const LikedSongsOrganizer = ({ onClose, playlists, onAddToPlaylist }) => {
  const [songs, setSongs] = useState([])
  const [currentSongIndex, setCurrentSongIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)
  const [audioPreview, setAudioPreview] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)

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

  const loadUnsortedSongs = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://127.0.0.1:5000/api/liked-songs/unsorted?limit=50&include_features=true', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setSongs(data.items)
        console.log('✅ Loaded unsorted songs:', data.items.length)
      }
    } catch (error) {
      console.error('❌ Error loading unsorted songs:', error)
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
        setStats(data)
      }
    } catch (error) {
      console.error('❌ Error loading stats:', error)
    }
  }

  const handleAddToPlaylist = async (playlistKey) => {
    if (!currentSong) return

    const playlist = playlists.find(p => p.key.toLowerCase() === playlistKey.toLowerCase())
    if (!playlist) return

    try {
      // Add to playlist via parent component
      await onAddToPlaylist(playlistKey, currentSong)

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

      // Move to next song
      nextSong()
      
      // Update stats
      loadStats()
    } catch (error) {
      console.error('❌ Error adding song to playlist:', error)
    }
  }

  const nextSong = () => {
    if (currentSongIndex < songs.length - 1) {
      setCurrentSongIndex(prev => prev + 1)
    }
  }

  const prevSong = () => {
    if (currentSongIndex > 0) {
      setCurrentSongIndex(prev => prev - 1)
    }
  }

  const togglePreview = () => {
    if (!currentSong?.preview_url) return

    if (audioPreview && !audioPreview.paused) {
      audioPreview.pause()
      setIsPlaying(false)
    } else {
      if (audioPreview) {
        audioPreview.play()
        setIsPlaying(true)
      } else {
        const audio = new Audio(currentSong.preview_url)
        audio.addEventListener('ended', () => setIsPlaying(false))
        audio.addEventListener('error', () => {
          console.error('Error playing preview')
          setIsPlaying(false)
        })
        setAudioPreview(audio)
        audio.play()
        setIsPlaying(true)
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
            You've sorted all your recent liked songs. Great job!
          </p>
          <button
            onClick={onClose}
            className="bg-spotify-green text-black px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
          >
            Close
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
              ✕
            </button>
          </div>
        </div>

        <div className="p-6 text-white">
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
                    disabled={!currentSong.preview_url}
                    className="p-4 bg-spotify-green text-black rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-600 transition-colors"
                    title={currentSong.preview_url ? 'Play 30s preview' : 'No preview available'}
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
                        <span className="text-sm">Preview available</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">No preview available</span>
                    )}
                  </div>
                </div>

                {/* Audio Features */}
                {currentSong.audio_features && (
                  <div className="bg-white bg-opacity-5 rounded-xl p-4 mb-6">
                    <h4 className="font-semibold mb-3 text-spotify-green">🎵 Audio Analysis</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Energy:</span>
                        <span className={`ml-2 font-medium ${getAudioFeatureColor(currentSong.audio_features.energy)}`}>
                          {Math.round(currentSong.audio_features.energy * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Danceability:</span>
                        <span className={`ml-2 font-medium ${getAudioFeatureColor(currentSong.audio_features.danceability)}`}>
                          {Math.round(currentSong.audio_features.danceability * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Valence:</span>
                        <span className={`ml-2 font-medium ${getAudioFeatureColor(currentSong.audio_features.valence)}`}>
                          {Math.round(currentSong.audio_features.valence * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Tempo:</span>
                        <span className="ml-2 font-medium text-white">
                          {Math.round(currentSong.audio_features.tempo)} BPM
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Acousticness:</span>
                        <span className={`ml-2 font-medium ${getAudioFeatureColor(currentSong.audio_features.acousticness)}`}>
                          {Math.round(currentSong.audio_features.acousticness * 100)}%
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Instrumentalness:</span>
                        <span className={`ml-2 font-medium ${getAudioFeatureColor(currentSong.audio_features.instrumentalness)}`}>
                          {Math.round(currentSong.audio_features.instrumentalness * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Genres (if available) */}
                {currentSong.genres && currentSong.genres.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold mb-2 text-spotify-green">🏷️ Genres</h4>
                    <div className="flex flex-wrap gap-2">
                      {currentSong.genres.map((genre, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-spotify-green bg-opacity-20 text-spotify-green rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
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
                      onClick={() => handleAddToPlaylist(playlist.key)}
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
                  className="w-full p-3 bg-gray-600 hover:bg-gray-700 rounded-xl transition-colors text-center"
                >
                  Skip this song (don't sort)
                </button>

                {/* Progress */}
                <div className="mt-6 p-4 bg-white bg-opacity-5 rounded-xl">
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

                {stats && (
                  <div className="mt-4 text-center text-sm text-gray-400">
                    <div>You've sorted {stats.total_sorted} songs total</div>
                    {stats.last_sorted && (
                      <div>Last sorted: {new Date(stats.last_sorted).toLocaleDateString()}</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default LikedSongsOrganizer
