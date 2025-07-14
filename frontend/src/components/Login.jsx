import React from 'react'
import { spotifyApi } from '../services/spotifyApi'

const Login = () => {
  const handleLogin = () => {
    window.location.href = spotifyApi.getAuthUrl()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">🎵 Spotify Organizer</h1>
        <p className="text-gray-300 mb-8">
          Connect your Spotify account to start organizing your playlists with keyboard shortcuts!
        </p>
        <button 
          onClick={handleLogin}
          className="bg-spotify-green hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:-translate-y-1 w-full"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  )
}

export default Login
