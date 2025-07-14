export const validatePlaylistName = (name) => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Playlist name is required' }
  }
  
  if (name.length < 1 || name.length > 100) {
    return { valid: false, error: 'Playlist name must be between 1 and 100 characters' }
  }
  
  return { valid: true }
}

export const validateTrackId = (trackId) => {
  if (!trackId || typeof trackId !== 'string') {
    return { valid: false, error: 'Track ID is required' }
  }
  
  // Spotify track ID validation (22 characters, base62)
  const spotifyIdRegex = /^[a-zA-Z0-9]{22}$/
  const spotifyUriRegex = /^spotify:track:[a-zA-Z0-9]{22}$/
  
  if (!spotifyIdRegex.test(trackId) && !spotifyUriRegex.test(trackId)) {
    return { valid: false, error: 'Invalid track ID format' }
  }
  
  return { valid: true }
}

export const validateVolumePercent = (volume) => {
  if (typeof volume !== 'number') {
    return { valid: false, error: 'Volume must be a number' }
  }
  
  if (volume < 0 || volume > 100) {
    return { valid: false, error: 'Volume must be between 0 and 100' }
  }
  
  return { valid: true }
}
