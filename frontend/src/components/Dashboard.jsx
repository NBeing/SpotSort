import React from 'react'
import CurrentSong from './CurrentSong/CurrentSong'
import PlaylistGrid from './PlaylistGrid/PlaylistGrid'
import StatusBar from './StatusBar/StatusBar'
import { usePlaylistManager } from '../hooks/usePlaylistManager'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const Dashboard = () => {
  const {
    currentSong,
    playlists,
    statusMessage,
    statusType,
    activePlaylist,
    nextSong,
    skipSong,
    addToPlaylist,
    createNewPlaylist
  } = usePlaylistManager()

  useKeyboardShortcuts({
    onKeyPress: addToPlaylist,
    onSpace: nextSong,
    onEnter: nextSong
  })

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

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrentSong 
            song={currentSong}
            onNext={nextSong}
            onSkip={skipSong}
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
      </div>
    </div>
  )
}

export default Dashboard
