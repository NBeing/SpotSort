#!/bin/bash

# scripts/quick-fix.sh - Fix immediate issues
echo "🔧 Fixing configuration issues..."

# Get the script directory and project root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "📁 Working from project root: $PROJECT_ROOT"

# Fix 1: Update PostCSS config to use CommonJS
echo "🔧 Fixing PostCSS config..."
cd "$PROJECT_ROOT/frontend"
rm -f postcss.config.js
cat > postcss.config.cjs << 'EOF'
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Fix 2: Update Tailwind config to use CommonJS
echo "🔧 Fixing Tailwind config..."
rm -f tailwind.config.js
cat > tailwind.config.cjs << 'EOF'
/** @type {import('tailwindcjs').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        spotify: {
          green: '#1DB954',
          black: '#191414',
          white: '#FFFFFF',
          gray: '#535353'
        }
      }
    },
  },
  plugins: [],
}
EOF

# Fix 3: Update Vite config to use the correct host
echo "🔧 Fixing Vite config..."
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false
      }
    }
  },
  build: {
    outDir: 'build'
  }
})
EOF

# Fix 4: Ensure backend directory structure exists
echo "🔧 Ensuring backend structure..."
cd "$PROJECT_ROOT/backend"
mkdir -p src

# Fix 5: Create server.js with correct content
echo "🔧 Creating server.js..."
cat > src/server.js << 'EOF'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import dotenv from 'dotenv'
import cookieParser from 'cookie-parser'
import session from 'express-session'
import rateLimit from 'express-rate-limit'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Middleware
app.use(helmet())
app.use(morgan('combined'))
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000',
  credentials: true
}))
app.use(limiter)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() })
})

// Temporary routes until the full routes are created
app.get('/api/auth/login', (req, res) => {
  res.json({ message: 'Auth routes not yet implemented' })
})

app.get('/api/spotify/me', (req, res) => {
  res.json({ message: 'Spotify routes not yet implemented' })
})

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

app.listen(PORT, '127.0.0.1', () => {
  console.log(`🎵 Spotify Organizer Backend running on http://127.0.0.1:${PORT}`)
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`)
})
EOF

# Fix 6: Ensure .env files exist
echo "🔧 Creating .env templates..."
if [ ! -f .env.example ]; then
  cat > .env.example << 'EOF'
NODE_ENV=development
PORT=5000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://127.0.0.1:3000
EOF
fi

cd "$PROJECT_ROOT/frontend"
if [ ! -f .env.example ]; then
  cat > .env.example << 'EOF'
VITE_API_URL=http://127.0.0.1:5000/api
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id
EOF
fi

cd "$PROJECT_ROOT"

echo "✅ Fixed configuration issues!"
echo "📝 Changes made:"
echo "  - Updated PostCSS config to use CommonJS (.cjs)"
echo "  - Updated Tailwind config to use CommonJS (.cjs)"
echo "  - Created basic server.js with temporary routes"
echo "  - Updated Vite config for correct host binding"
echo "  - Ensured all directory structures exist"
echo ""
echo "🚀 Try running 'npm run dev' again!"
echo "📍 If you haven't already, copy backend/.env.example to backend/.env and add your Spotify credentials"