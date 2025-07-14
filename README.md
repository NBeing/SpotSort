# 🎵 Spotify Playlist Organizer

A modern web application that allows you to organize your Spotify playlists using keyboard shortcuts. Perfect for quickly categorizing songs while listening!

## ✨ Features

- **Keyboard Shortcuts**: Assign each playlist a letter key for instant organization
- **Real-time Integration**: Works with your actual Spotify playback
- **Modern UI**: Beautiful, responsive interface built with React and Tailwind CSS
- **Playlist Management**: Create, modify, and organize playlists on the fly
- **Cross-platform**: Web-based with mobile-friendly design

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ (check with `node --version`)
- Spotify Premium account (required for playback control)
- Spotify Developer App (for API credentials)

### Setup

1. **Clone and install dependencies:**
```bash
# Setup project structure
./setup-project.sh
cd spotify-playlist-organizer

# Install dependencies
./scripts/setup-dependencies.sh
```

2. **Configure Spotify API:**
   - Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
   - Create a new app
   - Copy your Client ID and Client Secret
   - Add `http://localhost:3000/callback` to your Redirect URIs

3. **Environment Configuration:**
```bash
# Backend configuration
cp backend/.env.example backend/.env
# Edit backend/.env with your Spotify credentials

# Frontend configuration  
cp frontend/.env.example frontend/.env
# Edit frontend/.env if needed
```

4. **Populate project files:**
```bash
./scripts/populate-files.sh
```

5. **Start development servers:**
```bash
npm run dev
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎹 How to Use

1. **Login**: Click "Login with Spotify" and authorize the app
2. **Play Music**: Start playing any song on Spotify
3. **Organize**: Press keyboard keys (W, C, P, F, R, S) to add songs to playlists:
   - **W** - Workout
   - **C** - Chill  
   - **P** - Party
   - **F** - Focus
   - **R** - Road Trip
   - **S** - Sleep
4. **Create New**: Click the + button to create additional playlists
5. **Navigate**: Use Space/Enter to skip songs

## 🏗️ Project Structure

```
spotify-playlist-organizer/
├── frontend/                 # React frontend
│   ├── src/
│   │   ├── components/      # React components
│   │   │   ├── CurrentSong/ # Currently playing song display
│   │   │   ├── PlaylistGrid/# Playlist grid with keyboard shortcuts
│   │   │   ├── PlaylistItem/# Individual playlist items
│   │   │   └── StatusBar/   # Status and feedback messages
│   │   ├── hooks/          # Custom React hooks
│   │   │   ├── useSpotifyAuth.js      # Authentication management
│   │   │   ├── useKeyboardShortcuts.js # Keyboard event handling
│   │   │   └── usePlaylistManager.js   # Playlist operations
│   │   ├── services/       # API services
│   │   │   └── spotifyApi.js # Spotify API integration
│   │   └── utils/          # Utility functions
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # Route controllers
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── routes/         # API routes
│   │   └── utils/          # Backend utilities
└── scripts/                # Setup and build scripts
```

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run dev              # Start both frontend and backend
npm run dev:frontend     # Start only frontend
npm run dev:backend      # Start only backend

# Building
npm run build           # Build frontend for production
npm start              # Start production server

# Testing
npm test               # Run all tests
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
SPOTIFY_CLIENT_ID=your_client_id
SPOTIFY_CLIENT_SECRET=your_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://127.0.0.1:3000
```

**Frontend (.env):**
```
VITE_API_URL=http://127.0.0.1:5000/api
VITE_SPOTIFY_CLIENT_ID=your_client_id
```

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder to your hosting platform
3. Update environment variables for production

### Backend (Railway/Heroku)
1. Deploy the `backend` folder
2. Set environment variables in your hosting platform
3. Update CORS_ORIGIN to your frontend URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -am 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a Pull Request

## 📝 License

MIT License - see LICENSE file for details

## 🎵 Credits

Built with love for music organization enthusiasts!
# SpotSort
