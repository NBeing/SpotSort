import config from './src/config/index.js'

console.log('🔍 Current Configuration:')
console.log('========================')
console.log('SPOTIFY_REDIRECT_URI:', config.SPOTIFY_REDIRECT_URI)
console.log('')

if (config.SPOTIFY_REDIRECT_URI === 'http://127.0.0.1:5000/api/auth/callback') {
    console.log('✅ Redirect URI is correct for backend!')
} else {
    console.log('❌ Redirect URI should be: http://127.0.0.1:5000/api/auth/callback')
    console.log('   Current value:', config.SPOTIFY_REDIRECT_URI)
}

console.log('')
console.log('🔧 In Spotify Developer Dashboard, you need to set:')
console.log('   http://127.0.0.1:5000/api/auth/callback')
console.log('')
console.log('🔄 The auth flow should be:')
console.log('1. User clicks login → Frontend redirects to /api/auth/login')
console.log('2. Backend redirects to Spotify authorization')
console.log('3. User authorizes → Spotify redirects to /api/auth/callback')
console.log('4. Backend processes callback → Frontend gets redirected with success')
