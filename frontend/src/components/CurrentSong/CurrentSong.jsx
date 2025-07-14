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
