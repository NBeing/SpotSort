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
