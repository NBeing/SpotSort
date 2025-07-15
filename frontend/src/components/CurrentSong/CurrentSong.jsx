import React from 'react'
import { Play, SkipForward, RefreshCw } from 'lucide-react'

const CurrentSong = ({ song, onNext, onSkip, onRefresh }) => {
  if (!song) {
    return (
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20">
        <h2 className="text-2xl font-bold mb-6 text-spotify-green">Currently Playing</h2>
        <div className="text-center text-gray-400 py-8">
          <div className="text-6xl mb-4">🎵</div>
          <div className="text-lg mb-2">No song playing</div>
          <div className="text-sm">Start playing music on Spotify and click refresh</div>
        </div>
        <div className="flex gap-4">
          <button 
            onClick={onRefresh}
            className="flex-1 bg-spotify-green hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <RefreshCw size={16} />
            Check Now Playing
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl p-8 border border-white border-opacity-20">
      <h2 className="text-2xl font-bold mb-6 text-spotify-green">Currently Playing</h2>
      <div className="flex items-center gap-5 mb-6">
        <div className="w-20 h-20 bg-gradient-to-br from-spotify-green to-green-600 rounded-2xl flex items-center justify-center text-2xl overflow-hidden">
          {song.album_art ? (
            <img 
              src={song.album_art} 
              alt="Album art" 
              className="w-full h-full object-cover rounded-2xl" 
            />
          ) : (
            '🎵'
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-semibold mb-1 truncate" title={song.title}>
            {song.title}
          </h3>
          <p className="text-gray-300 truncate" title={song.artist}>
            {song.artist}
          </p>
          <p className="text-gray-400 text-sm truncate" title={song.album}>
            {song.album}
          </p>
          {song.is_playing !== undefined && (
            <div className="flex items-center gap-2 mt-2">
              <div className={`w-2 h-2 rounded-full ${song.is_playing ? 'bg-green-500' : 'bg-gray-500'}`}></div>
              <span className="text-xs text-gray-400">
                {song.is_playing ? 'Playing' : 'Paused'}
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="flex gap-4">
        <button 
          onClick={onRefresh}
          className="flex-1 bg-spotify-green hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <RefreshCw size={16} />
          Refresh
        </button>
        <button 
          onClick={onNext}
          className="flex-1 bg-white bg-opacity-10 hover:bg-opacity-20 border border-white border-opacity-30 font-bold py-3 px-6 rounded-full transition-all duration-300 flex items-center justify-center gap-2"
          title="Refresh current song (Premium required for skip)"
        >
          <SkipForward size={16} />
          Check Again
        </button>
      </div>
      <div className="text-xs text-gray-400 text-center mt-3">
        💡 Tip: Press any playlist key (like W, C, P) to add this song!
      </div>
    </div>
  )
}

export default CurrentSong
