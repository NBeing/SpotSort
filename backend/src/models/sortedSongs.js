import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Simple JSON file storage for sorted songs
const DATA_FILE = path.join(__dirname, '../../data/sorted_songs.json')

export class SortedSongsModel {
  constructor() {
    this.ensureDataDirectory()
  }

  async ensureDataDirectory() {
    const dataDir = path.dirname(DATA_FILE)
    try {
      await fs.mkdir(dataDir, { recursive: true })
    } catch (error) {
      console.error('Error creating data directory:', error)
    }
  }

  async loadSortedSongs() {
    try {
      const data = await fs.readFile(DATA_FILE, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      // File doesn't exist or is invalid, return empty structure
      return {
        users: {},
        last_updated: new Date().toISOString()
      }
    }
  }

  async saveSortedSongs(data) {
    try {
      data.last_updated = new Date().toISOString()
      await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2))
    } catch (error) {
      console.error('Error saving sorted songs:', error)
      throw error
    }
  }

  async getUserSortedSongs(userId) {
    const data = await this.loadSortedSongs()
    return data.users[userId] || {
      sorted_tracks: {},
      total_sorted: 0,
      last_sorted: null
    }
  }

  async markSongAsSorted(userId, trackId, playlistId, playlistName) {
    const data = await this.loadSortedSongs()
    
    if (!data.users[userId]) {
      data.users[userId] = {
        sorted_tracks: {},
        total_sorted: 0,
        last_sorted: null
      }
    }

    data.users[userId].sorted_tracks[trackId] = {
      playlist_id: playlistId,
      playlist_name: playlistName,
      sorted_at: new Date().toISOString()
    }
    
    data.users[userId].total_sorted = Object.keys(data.users[userId].sorted_tracks).length
    data.users[userId].last_sorted = new Date().toISOString()

    await this.saveSortedSongs(data)
    
    console.log(`✅ [SortedSongs] Marked track ${trackId} as sorted for user ${userId}`)
  }

  async isSongSorted(userId, trackId) {
    const userData = await this.getUserSortedSongs(userId)
    return !!userData.sorted_tracks[trackId]
  }

  async getSortingStats(userId) {
    const userData = await this.getUserSortedSongs(userId)
    return {
      total_sorted: userData.total_sorted,
      last_sorted: userData.last_sorted,
      recently_sorted: Object.entries(userData.sorted_tracks)
        .sort(([,a], [,b]) => new Date(b.sorted_at) - new Date(a.sorted_at))
        .slice(0, 10)
        .map(([trackId, info]) => ({ track_id: trackId, ...info }))
    }
  }
}
