import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from the backend directory
dotenv.config({ path: path.join(__dirname, '../../.env') })

// Validate and export configuration
const config = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5000,
  SPOTIFY_CLIENT_ID: process.env.SPOTIFY_CLIENT_ID,
  SPOTIFY_CLIENT_SECRET: process.env.SPOTIFY_CLIENT_SECRET,
  SPOTIFY_REDIRECT_URI: process.env.SPOTIFY_REDIRECT_URI,
  SESSION_SECRET: process.env.SESSION_SECRET || 'fallback-secret-change-this',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://127.0.0.1:3000'
}

// Debug logging
console.log('🔍 [Config] Environment variables loaded:')
console.log(`   NODE_ENV: ${config.NODE_ENV}`)
console.log(`   SPOTIFY_CLIENT_ID: ${config.SPOTIFY_CLIENT_ID ? '✅ Set' : '❌ Missing'}`)
console.log(`   SPOTIFY_CLIENT_SECRET: ${config.SPOTIFY_CLIENT_SECRET ? '✅ Set' : '❌ Missing'}`)
console.log(`   SPOTIFY_REDIRECT_URI: ${config.SPOTIFY_REDIRECT_URI || '❌ Missing'}`)

// Validate required variables
const requiredVars = ['SPOTIFY_CLIENT_ID', 'SPOTIFY_CLIENT_SECRET', 'SPOTIFY_REDIRECT_URI']
const missingVars = requiredVars.filter(varName => !config[varName])

if (missingVars.length > 0) {
  console.error('❌ [Config] Missing required environment variables:', missingVars.join(', '))
  console.error('📄 Please check your backend/.env file')
  throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`)
}

export default config
