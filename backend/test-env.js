import dotenv from 'dotenv'
dotenv.config()

console.log('🔍 Environment Variables:')
console.log('SPOTIFY_CLIENT_ID:', process.env.SPOTIFY_CLIENT_ID ? 'SET ✅' : 'MISSING ❌')
console.log('SPOTIFY_CLIENT_SECRET:', process.env.SPOTIFY_CLIENT_SECRET ? 'SET ✅' : 'MISSING ❌') 
console.log('SPOTIFY_REDIRECT_URI:', process.env.SPOTIFY_REDIRECT_URI || 'MISSING ❌')

if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
    console.log('\n❌ Environment variables not loaded properly!')
    console.log('💡 Make sure your .env file is in the backend directory')
    process.exit(1)
} else {
    console.log('\n✅ Environment variables loaded successfully!')
}
