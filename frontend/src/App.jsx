import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './components/Dashboard'
import Login from './components/Login'
import { useSpotifyAuth } from './hooks/useSpotifyAuth'

function App() {
  const { user, loading, error, login } = useSpotifyAuth()

  console.log('🔍 [App] Auth state:', { user: !!user, loading, error })

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div className="text-xl mb-2">Checking authentication...</div>
          <div className="text-sm opacity-70">This should only take a moment</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 flex items-center justify-center">
        <div className="text-center text-white max-w-md">
          <h2 className="text-2xl font-bold mb-4">Connection Error</h2>
          <p className="text-gray-300 mb-6">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="block w-full bg-green-500 text-black px-6 py-3 rounded-full font-bold hover:bg-green-600 transition-colors"
            >
              Retry Connection
            </button>
            <button 
              onClick={login} 
              className="block w-full bg-gray-600 text-white px-6 py-3 rounded-full font-bold hover:bg-gray-700 transition-colors"
            >
              Try Login Anyway
            </button>
          </div>
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
              <div className="min-h-screen bg-gradient-to-br from-green-500 to-gray-900 flex items-center justify-center text-white">
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
