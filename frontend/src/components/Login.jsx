import React from 'react'

const Login = () => {
  const handleLogin = () => {
    console.log('🔍 [Login] Redirecting to Spotify login...')
    window.location.href = 'http://127.0.0.1:5000/api/auth/login'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 flex items-center justify-center">
      <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20 p-8 text-center max-w-md">
        <div className="text-6xl mb-6">🎵</div>
        <h1 className="text-3xl font-bold mb-4 text-white">Spotify Organizer</h1>
        <p className="text-gray-300 mb-8">
          Connect your Spotify account to start organizing your playlists with keyboard shortcuts!
        </p>
        <button 
          onClick={handleLogin}
          className="bg-green-500 hover:bg-green-600 text-black font-bold py-4 px-8 rounded-full transition-all duration-300 hover:-translate-y-1 w-full text-lg"
        >
          Login with Spotify
        </button>
        <div className="text-xs mt-4 opacity-70 text-gray-400">
          You'll be redirected to Spotify to authorize this app
        </div>
      </div>
    </div>
  )
}

export default Login
