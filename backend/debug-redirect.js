// Import the config module which loads environment variables
import config from './src/config/index.js'

console.log('🔍 Redirect URI Debug Information:')
console.log('=====================================')
console.log('Configuration from config module:')
console.log('SPOTIFY_CLIENT_ID:', config.SPOTIFY_CLIENT_ID ? 'SET ✅' : 'MISSING ❌')
console.log('SPOTIFY_CLIENT_SECRET:', config.SPOTIFY_CLIENT_SECRET ? 'SET ✅' : 'MISSING ❌')
console.log('SPOTIFY_REDIRECT_URI:', config.SPOTIFY_REDIRECT_URI)
console.log('')

console.log('Expected Configuration:')
console.log('=====================================')
console.log('✅ In Spotify Developer Dashboard:')
console.log('   Redirect URI should be: http://127.0.0.1:3000/callback')
console.log('')
console.log('✅ In backend/.env file:')
console.log('   SPOTIFY_REDIRECT_URI=http://127.0.0.1:3000/callback')
console.log('')

// Test the authorization URL generation
if (config.SPOTIFY_CLIENT_ID && config.SPOTIFY_REDIRECT_URI) {
    const scopes = [
        'user-read-private',
        'user-read-email',
        'user-read-playback-state',
        'user-modify-playback-state',
        'user-read-currently-playing',
        'playlist-read-private',
        'playlist-read-collaborative',
        'playlist-modify-private',
        'playlist-modify-public',
        'user-library-read',
        'user-library-modify'
    ].join(' ')

    const authURL = 'https://accounts.spotify.com/authorize?' + new URLSearchParams({
        response_type: 'code',
        client_id: config.SPOTIFY_CLIENT_ID,
        scope: scopes,
        redirect_uri: config.SPOTIFY_REDIRECT_URI,
        show_dialog: 'true'
    }).toString()

    console.log('Generated Auth URL:')
    console.log('=====================================')
    console.log(authURL)
    console.log('')
    
    // Extract and highlight the redirect_uri parameter
    const url = new URL(authURL)
    const redirectUri = url.searchParams.get('redirect_uri')
    console.log('📍 Redirect URI being sent to Spotify:', redirectUri)
    
    if (redirectUri === 'http://127.0.0.1:3000/callback') {
        console.log('✅ Redirect URI format looks correct!')
    } else {
        console.log('❌ Redirect URI format looks wrong!')
        console.log('   Expected: http://127.0.0.1:3000/callback')
        console.log('   Actual:  ', redirectUri)
    }
} else {
    console.log('❌ Cannot generate auth URL - missing environment variables')
}

console.log('')
console.log('🔧 To fix this issue:')
console.log('1. Go to https://developer.spotify.com/dashboard')
console.log('2. Click on your app')
console.log('3. Click "Settings"')
console.log('4. In "Redirect URIs", make sure you have EXACTLY:')
console.log('   http://127.0.0.1:3000/callback')
console.log('5. Save the settings')
console.log('6. Restart your backend server')
