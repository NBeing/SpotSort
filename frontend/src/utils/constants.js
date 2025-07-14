export const SPOTIFY_SCOPES = [
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

export const DEFAULT_PLAYLISTS = [
  { name: "Workout", key: "W" },
  { name: "Chill", key: "C" },
  { name: "Party", key: "P" },
  { name: "Focus", key: "F" },
  { name: "Road Trip", key: "R" },
  { name: "Sleep", key: "S" }
]

export const KEYBOARD_SHORTCUTS = {
  SPACE: ' ',
  ENTER: 'Enter',
  ESCAPE: 'Escape'
}
