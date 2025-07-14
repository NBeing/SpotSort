import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'

function App() {
  const { user, loading } = useSpotifyAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/callback" element={<div>Processing...</div>} />
          <Route path="/" element={user ? <Dashboard /> : <Login />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
