import React from 'react'
import { Music, User, Globe, Lock } from 'lucide-react'

const PlaylistItem = ({ playlist, isActive }) => {
  return (
    <div 
      className={`bg-white bg-opacity-10 rounded-2xl p-4 text-center transition-all duration-300 cursor-pointer hover:bg-opacity-20 hover:-translate-y-1 border-2 ${
        isActive ? 'border-spotify-green bg-spotify-green bg-opacity-20' : 'border-transparent'
      }`}
      title={`${playlist.name} - Press "${playlist.key}" to add current song`}
    >
      <div className="bg-spotify-green text-black rounded-lg px-3 py-2 font-bold text-lg mb-2 inline-block">
        {playlist.key}
      </div>
      <div className="font-medium text-sm mb-1 truncate" title={playlist.name}>
        {playlist.name}
      </div>
      <div className="text-xs text-gray-400 flex items-center justify-center gap-1 mb-1">
        <Music size={12} />
        {playlist.track_count || playlist.songs?.length || 0} songs
      </div>
      {playlist.owner && playlist.owner !== 'You' && (
        <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
          <User size={10} />
          {playlist.owner}
        </div>
      )}
      {playlist.public !== undefined && (
        <div className="text-xs text-gray-500 flex items-center justify-center gap-1 mt-1">
          {playlist.public ? (
            <>
              <Globe size={10} />
              Public
            </>
          ) : (
            <>
              <Lock size={10} />
              Private
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default PlaylistItem
