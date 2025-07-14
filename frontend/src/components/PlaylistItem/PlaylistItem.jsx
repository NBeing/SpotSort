import React from 'react'

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
      <div className="text-xs text-gray-400">
        {playlist.songs ? playlist.songs.length : 0} songs
      </div>
    </div>
  )
}

export default PlaylistItem
