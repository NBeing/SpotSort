import { SpotifyService } from '../src/services/spotifyService.js'

describe('SpotifyService', () => {
  let spotifyService

  beforeEach(() => {
    spotifyService = new SpotifyService()
  })

  test('should generate authorization URL', () => {
    const url = spotifyService.getAuthorizationUrl()
    expect(url).toContain('https://accounts.spotify.com/authorize')
    expect(url).toContain('client_id=')
    expect(url).toContain('scope=')
    expect(url).toContain('redirect_uri=')
  })

  // Add more tests as needed
})
