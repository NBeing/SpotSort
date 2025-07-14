#!/bin/bash

# scripts/populate-components.sh - Populate all component files
echo "🧩 Populating component files..."

cd frontend

# CurrentSong Component
cat > src/components/CurrentSong/CurrentSong.jsx << 'EOF'
import React from 'react'
import { Play, SkipForward } from 'lucide-react'

const CurrentSong = ({ song, onNext, onSkip }) => {
  if (!song) {
    return (
      <div className="card-glass p-8">
        <h2 className="text-2xl font-bold mb-6 text-spotify-green">Currently Playing</h2>
        <div className="text-center text-gray-400">
          No song playing
        </div>
      </div>
    )
  }

  return (
    <div className="card-glass p-8">
      <h2 className="text-2xl font-bold mb-6 text-spotify-green">Currently Playing</h2>
      <div className="flex items-center gap-5 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-spotify-green to-green-600 rounded-2xl flex items-center justify-center text-2xl">
          {song.album_art ? (
            <img src={song.album_art} alt="Album art" className="w-full h-full object-cover rounded-2xl" />
          ) : (
            '🎵'
          )}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold mb-1 truncate">{song.title}</h3>
          <p className="text-gray-300 truncate">{song.artist}</p>
          <p className="text-gray-400 text-sm truncate">{song.album}</p>
        </div>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onNext}
          className="flex-1 btn-spotify flex items-center justify-center gap-2"
        >
          <Play size={16} />
          Next Song
        </button>
        <button 
          onClick={onSkip}
          className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
        >
          <SkipForward size={16} />
          Skip
        </button>
      </div>
    </div>
  )
}

export default CurrentSong
EOF

# PlaylistGrid Component
cat > src/components/PlaylistGrid/PlaylistGrid.jsx << 'EOF'
import React from 'react'
import PlaylistItem from '../PlaylistItem/PlaylistItem'

const PlaylistGrid = ({ playlists, activePlaylist, onCreatePlaylist }) => {
  return (
    <div className="card-glass p-8">
      <h2 className="text-2xl font-bold mb-6 text-spotify-green">Your Playlists</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        {playlists.map((playlist) => (
          <PlaylistItem
            key={playlist.key}
            playlist={playlist}
            isActive={activePlaylist === playlist.key}
          />
        ))}
        
        {/* Add New Playlist Button */}
        <div 
          onClick={onCreatePlaylist}
          className="bg-white bg-opacity-5 border-2 border-dashed border-white border-opacity-30 rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer hover:bg-opacity-10 hover:border-spotify-green hover:text-spotify-green flex items-center justify-center text-2xl"
        >
          +
        </div>
      </div>
      <div className="text-center text-sm text-gray-400">
        Press the key shown on each playlist to add the current song
      </div>
    </div>
  )
}

export default PlaylistGrid
EOF

# PlaylistItem Component
cat > src/components/PlaylistItem/PlaylistItem.jsx << 'EOF'
import React from 'react'
import { Music } from 'lucide-react'

const PlaylistItem = ({ playlist, isActive }) => {
  return (
    <div 
      className={`bg-white bg-opacity-10 rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer hover:bg-opacity-20 hover:-translate-y-1 border-2 ${
        isActive ? 'border-spotify-green bg-spotify-green bg-opacity-20' : 'border-transparent'
      }`}
    >
      <div className="bg-spotify-green text-black rounded-lg px-3 py-2 font-bold text-lg mb-2 inline-block">
        {playlist.key}
      </div>
      <div className="font-medium text-sm mb-1">{playlist.name}</div>
      <div className="text-xs text-gray-400 flex items-center justify-center gap-1">
        <Music size={12} />
        {playlist.songs ? playlist.songs.length : 0} songs
      </div>
    </div>
  )
}

export default PlaylistItem
EOF

# StatusBar Component
cat > src/components/StatusBar/StatusBar.jsx << 'EOF'
import React from 'react'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

const StatusBar = ({ message, type = 'info' }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(29, 185, 84, 0.2)',
          icon: <CheckCircle size={16} className="text-spotify-green" />,
          textColor: 'text-green-300'
        }
      case 'warning':
        return {
          bg: 'rgba(255, 193, 7, 0.2)',
          icon: <AlertCircle size={16} className="text-yellow-400" />,
          textColor: 'text-yellow-300'
        }
      case 'error':
        return {
          bg: 'rgba(220, 53, 69, 0.2)',
          icon: <XCircle size={16} className="text-red-400" />,
          textColor: 'text-red-300'
        }
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          icon: <Info size={16} className="text-blue-400" />,
          textColor: 'text-white'
        }
    }
  }

  const { bg, icon, textColor } = getStatusConfig()

  return (
    <div 
      className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl transition-all duration-300 ${textColor}`}
      style={{ backgroundColor: bg }}
    >
      {icon}
      <span>{message}</span>
    </div>
  )
}

export default StatusBar
EOF

# Create index files for cleaner imports
cat > src/components/CurrentSong/index.js << 'EOF'
export { default } from './CurrentSong'
EOF

cat > src/components/PlaylistGrid/index.js << 'EOF'
export { default } from './PlaylistGrid'
EOF

cat > src/components/PlaylistItem/index.js << 'EOF'
export { default } from './PlaylistItem'
EOF

cat > src/components/StatusBar/index.js << 'EOF'
export { default } from './StatusBar'
EOF

echo "✅ Component files populated!"