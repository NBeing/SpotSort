import React, { useState } from 'react'
import CurrentSong from './CurrentSong/CurrentSong'
import PlaylistGrid from './PlaylistGrid/PlaylistGrid'
import StatusBar from './StatusBar/StatusBar'
import LikedSongsOrganizer from './LikedSongs/LikedSongsOrganizer'
import { usePlaylistManager } from '../hooks/usePlaylistManager'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { useLikedSongsKeyboard } from '../hooks/useLikedSongsKeyboard'
import { Heart, TrendingUp } from 'lucide-react'

const Dashboard = () => {
  const [showLikedSongsOrganizer, setShowLikedSongsOrganizer] = useState(false)
  
  const {
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
  } = usePlaylistManager()

  // Only use regular keyboard shortcuts when liked songs organizer is closed
  useKeyboardShortcuts({
    onKeyPress: showLikedSongsOrganizer ? null : addToPlaylist,
    onSpace: showLikedSongsOrganizer ? null : refreshCurrentSong,
    onEnter: showLikedSongsOrganizer ? null : refreshCurrentSong
  })

  const handleAddToPlaylistFromLiked = async (playlistKey, song) => {
    // Use the existing addToPlaylist function but with the liked song
    const playlist = playlists.find(p => p.key.toLowerCase() === playlistKey.toLowerCase())
    if (!playlist || !song) return

    try {
      // First add to the actual Spotify playlist
      if (playlist.spotify_id && song.id) {
        const response = await fetch(`http://127.0.0.1:5000/api/spotify/playlists/${playlist.spotify_id}/tracks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ track_id: song.id })
        })

        if (!response.ok) throw new Error('Failed to add to playlist')
      }

      // Update local state (similar to existing addToPlaylist)
      // Note: This is handled by the parent usePlaylistManager hook
      return true
    } catch (error) {
      console.error('Error adding song to playlist:', error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl mb-2">Loading your Spotify data...</div>
          <div className="text-sm opacity-70">Getting playlists and current song</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black text-white p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            🎵 Spotify Playlist Organizer
          </h1>
          <p className="text-gray-300">Press keyboard keys to organize your music!</p>
        </div>

        {/* Liked Songs Banner */}
        <div className="bg-gradient-to-r from-pink-500 to-red-500 rounded-2xl p-6 mb-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white bg-opacity-20 rounded-full p-3">
                <Heart size={32} fill="currentColor" />
              </div>
              <div>
                <h2 className="text-2xl font-bold mb-1">Organize Your Liked Songs</h2>
                <p className="text-pink-100">
                  Sort through your saved songs collection with keyboard shortcuts and audio previews
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLikedSongsOrganizer(true)}
              className="bg-white text-pink-600 px-6 py-3 rounded-full font-bold hover:bg-gray-100 transition-colors flex items-center gap-2"
            >
              <TrendingUp size={20} />
              Start Organizing
            </button>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrentSong 
            song={currentSong}
            onNext={nextSong}
            onSkip={skipSong}
            onRefresh={refreshCurrentSong}
          />
          
          <PlaylistGrid 
            playlists={playlists}
            activePlaylist={activePlaylist}
            onCreatePlaylist={createNewPlaylist}
          />
        </div>

        <StatusBar 
          message={statusMessage}
          type={statusType}
        />

        {/* Keyboard shortcuts help */}
        <div className="mt-6 text-center text-sm text-gray-400">
          <div className="bg-white bg-opacity-5 rounded-xl p-4 max-w-2xl mx-auto">
            <div className="font-semibold mb-2">⌨️ Keyboard Shortcuts</div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
              <div><strong>A-Z:</strong> Add current song to playlist</div>
              <div><strong>Space:</strong> Refresh current song</div>
              <div><strong>Enter:</strong> Refresh current song</div>
              <div><strong>Heart Button:</strong> Organize liked songs</div>
            </div>
          </div>
        </div>
      </div>

      {/* Liked Songs Organizer Modal */}
      {showLikedSongsOrganizer && (
        <LikedSongsOrganizer
          onClose={() => setShowLikedSongsOrganizer(false)}
          playlists={playlists}
          onAddToPlaylist={handleAddToPlaylistFromLiked}
        />
      )}
    </div>
  )
}

export default Dashboard
