#!/bin/bash

# scripts/setup-dependencies.sh - Setup all project dependencies
echo "📦 Installing project dependencies..."

# Install root dependencies
npm install

# Setup Frontend Dependencies
echo "🖥️  Setting up frontend dependencies..."
cd frontend

cat > package.json << 'EOF'
{
  "name": "spotify-organizer-frontend",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.14.0",
    "axios": "^1.4.0",
    "lucide-react": "^0.263.1",
    "tailwindcss": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-react": "^4.0.3",
    "vite": "^4.4.0",
    "eslint": "^8.45.0",
    "eslint-plugin-react": "^7.32.2",
    "eslint-plugin-react-hooks": "^4.6.0",
    "autoprefixer": "^10.4.14",
    "postcss": "^8.4.26",
    "@types/react": "^18.2.15",
    "@types/react-dom": "^18.2.7"
  },
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext js,jsx --report-unused-disable-directives --max-warnings 0",
    "test": "echo \"No tests specified\""
  }
}
EOF

npm install

# Create Vite config
cat > vite.config.js << 'EOF'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
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

# Create Tailwind config
cat > tailwind.config.js << 'EOF'
/** @type {import('tailwindcss').Config} */
export default {
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

# Create PostCSS config
cat > postcss.config.js << 'EOF'
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
EOF

# Create index.html
cat > index.html << 'EOF'
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/spotify-icon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Spotify Playlist Organizer</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.jsx"></script>
  </body>
</html>
EOF

cd ..

# Setup Backend Dependencies
echo "🔧 Setting up backend dependencies..."
cd backend

cat > package.json << 'EOF'
{
  "name": "spotify-organizer-backend",
  "version": "1.0.0",
  "description": "Backend API for Spotify Playlist Organizer",
  "main": "src/server.js",
  "scripts": {
    "dev": "nodemon src/server.js",
    "start": "node src/server.js",
    "test": "jest",
    "test:watch": "jest --watch"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "dotenv": "^16.3.1",
    "helmet": "^7.0.0",
    "morgan": "^1.10.0",
    "axios": "^1.4.0",
    "express-rate-limit": "^6.8.1",
    "cookie-parser": "^1.4.6",
    "express-session": "^1.17.3",
    "passport": "^0.6.0",
    "passport-spotify": "^2.0.0"
  },
  "devDependencies": {
    "nodemon": "^3.0.1",
    "jest": "^29.6.1",
    "supertest": "^6.3.3",
    "eslint": "^8.45.0"
  },
  "type": "module"
}
EOF

npm install

# Create .env template
cat > .env.example << 'EOF'
NODE_ENV=development
PORT=5000
SPOTIFY_CLIENT_ID=your_spotify_client_id
SPOTIFY_CLIENT_SECRET=your_spotify_client_secret
SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback
SESSION_SECRET=your_session_secret
CORS_ORIGIN=http://127.0.0.1:3000
EOF

cd ..

echo "✅ Dependencies installed!"
echo "📝 Next steps:"
echo "1. Copy backend/.env.example to backend/.env and fill in your Spotify credentials"
echo "2. Run: ./scripts/populate-files.sh"
echo "3. Run: npm run dev to start both frontend and backend"