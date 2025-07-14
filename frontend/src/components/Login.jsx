import React from 'react'
import { spotifyApi } from '../services/spotifyApi'

const Login = () => {
  const handleLogin = () => {
    window.location.href = spotifyApi.getAuthUrl()
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
      <div className="card-glass p-8 text-center max-w-md">
        <h1 className="text-3xl font-bold mb-4">🎵 Spotify Organizer</h1>
        <p className="text-gray-300 mb-8">
          Connect your Spotify account to start organizing your playlists with keyboard shortcuts!
        </p>
        <button 
          onClick={handleLogin}
          className="btn-spotify w-full"
        >
          Login with Spotify
        </button>
      </div>
    </div>
  )
}

export default Login
