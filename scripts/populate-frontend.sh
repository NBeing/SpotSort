#!/bin/bash

# scripts/populate-frontend.sh - Populate frontend files
echo "🎨 Populating frontend files..."

cd frontend

# Create main.jsx
cat > src/main.jsx << 'EOF'
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles/index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
EOF

# Create App.jsx
cat > src/App.jsx << 'EOF'
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
EOF

# Create styles/index.css
cat > src/styles/index.css << 'EOF'
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1db954, #191414);
    min-height: 100vh;
    color: white;
  }
}

@layer components {
  .btn-spotify {
    @apply bg-spotify-green hover:bg-green-600 text-black font-bold py-3 px-6 rounded-full transition-all duration-300 hover:-translate-y-1;
  }
  
  .card-glass {
    @apply bg-white bg-opacity-10 backdrop-blur-lg rounded-3xl border border-white border-opacity-20;
  }
}
EOF

# Create Dashboard component
cat > src/components/Dashboard.jsx << 'EOF'
import React from 'react'
import CurrentSong from './CurrentSong/CurrentSong'
import PlaylistGrid from './PlaylistGrid/PlaylistGrid'
import StatusBar from './StatusBar/StatusBar'
import { usePlaylistManager } from '../hooks/usePlaylistManager'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'

const Dashboard = () => {
  const {
    currentSong,
    playlists,
    statusMessage,
    statusType,
    activePlaylist,
    nextSong,
    skipSong,
    addToPlaylist,
    createNewPlaylist
  } = usePlaylistManager()

  useKeyboardShortcuts({
    onKeyPress: addToPlaylist,
    onSpace: nextSong,
    onEnter: nextSong
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-spotify-green to-spotify-black text-white p-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-green-400 to-green-300 bg-clip-text text-transparent">
            🎵 Spotify Playlist Organizer
          </h1>
          <p className="text-gray-300">Press keyboard keys to organize your music!</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <CurrentSong 
            song={currentSong}
            onNext={nextSong}
            onSkip={skipSong}
          />
          
          <PlaylistGrid 
            playlists={playlists}
            activePlaylist={activePlaylist}
            onCreatePlaylist={createNewPlaylist}
          />
        </div>

        <StatusBar 
          message={statusMessage}
          type={statusType}
        />
      </div>
    </div>
  )
}

export default Dashboard
EOF

# Create Login component
cat > src/components/Login.jsx << 'EOF'
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
EOF

echo "✅ Frontend core files created!"