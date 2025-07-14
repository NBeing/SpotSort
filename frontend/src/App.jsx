import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'

function App() {
  const { user, loading, error } = useSpotifyAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
        <div className="text-white text-xl">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
          Loading...
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Authentication Error</h2>
          <p className="text-gray-300 mb-4">{error}</p>
          <button 
            onClick={() => window.location.href = '/login'} 
            className="bg-spotify-green text-black px-6 py-2 rounded-full font-bold hover:bg-green-600 transition-colors"
          >
            Try Login Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route 
            path="/callback" 
            element={
              <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-4"></div>
                  Processing authentication...
                </div>
              </div>
            } 
          />
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
