import { SpotifyService } from '../services/spotifyService.js'
import { SortedSongsModel } from '../models/sortedSongs.js'

export class LikedSongsController {
  constructor() {
    this.spotifyService = new SpotifyService()
    this.sortedSongsModel = new SortedSongsModel()
  }

  async getLikedSongs(req, res) {
    try {
      const { limit = 20, offset = 0, include_features = 'false' } = req.query
      const userId = req.session.user.id

      console.log(`🔍 [LikedSongs] Getting liked songs for user ${userId}, limit: ${limit}, offset: ${offset}`)
      
      // Get liked songs from Spotify
      const likedSongs = await this.spotifyService.getLikedSongs(
        req.accessToken, 
        parseInt(limit), 
        parseInt(offset)
      )

      // Check which songs are already sorted
      const songsWithSortStatus = await Promise.all(
        likedSongs.items.map(async (song) => {
          const isSorted = await this.sortedSongsModel.isSongSorted(userId, song.id)
          return { ...song, is_sorted: isSorted }
        })
      )

      // Get audio features if requested
      if (include_features === 'true' && songsWithSortStatus.length > 0) {
        const trackIds = songsWithSortStatus.map(song => song.id).filter(Boolean)
        if (trackIds.length > 0) {
          const audioFeatures = await this.spotifyService.getAudioFeaturesMultiple(
            req.accessToken, 
            trackIds
          )
          
          // Merge audio features with songs
          songsWithSortStatus.forEach((song, index) => {
            const features = audioFeatures.find(f => f && f.id === song.id)
            if (features) {
              song.audio_features = {
                danceability: features.danceability,
                energy: features.energy,
                valence: features.valence, // musical positivity
                tempo: features.tempo,
                loudness: features.loudness,
                acousticness: features.acousticness,
                instrumentalness: features.instrumentalness,
                speechiness: features.speechiness,
                key: features.key,
                mode: features.mode, // major/minor
                time_signature: features.time_signature
              }
            }
          })
        }
      }

      res.json({
        ...likedSongs,
        items: songsWithSortStatus
      })
    } catch (error) {
      console.error('❌ [LikedSongs] Error getting liked songs:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get liked songs' })
    }
  }

  async getUnsortedSongs(req, res) {
    try {
      const { limit = 20 } = req.query
      const userId = req.session.user.id

      console.log(`🔍 [LikedSongs] Getting unsorted songs for user ${userId}`)
      
      // Quick test: Check if Ed Sheeran's "Shape of You" has a preview URL
      if (!req.session.shapeOfYouTested) {
        try {
          console.log('🎵 [Test] Checking Ed Sheeran "Shape of You" for preview URL...')
          const testTrack = await this.spotifyService.makeSpotifyRequest(
            req.accessToken, 
            '/tracks/7qiZfU4dY1lWllzX7mPBI3'
          )
          console.log(`🎵 [Test] "${testTrack.name}" by ${testTrack.artists[0].name}`)
          console.log(`🎵 [Test] Preview URL: ${testTrack.preview_url ? '✅ AVAILABLE' : '❌ NULL'}`)
          if (testTrack.preview_url) {
            console.log(`🎵 [Test] Preview URL: ${testTrack.preview_url}`)
          }
          req.session.shapeOfYouTested = true
        } catch (error) {
          console.log('❌ [Test] Error testing Shape of You:', error.message)
        }
      }

      // We'll need to paginate through liked songs to find unsorted ones
      let unsortedSongs = []
      let offset = 0
      const batchSize = 50

      while (unsortedSongs.length < parseInt(limit)) {
        const likedSongs = await this.spotifyService.getLikedSongs(
          req.accessToken, 
          batchSize, 
          offset
        )

        if (likedSongs.items.length === 0) break

        // Filter for unsorted songs
        for (const song of likedSongs.items) {
          const isSorted = await this.sortedSongsModel.isSongSorted(userId, song.id)
          if (!isSorted) {
            unsortedSongs.push({ ...song, is_sorted: false })
          }
          
          if (unsortedSongs.length >= parseInt(limit)) break
        }

        offset += batchSize
        
        // Safety break to avoid infinite loops
        if (offset > 2000) break
      }

      res.json({
        items: unsortedSongs,
        total_found: unsortedSongs.length,
        searched_up_to_offset: offset
      })
    } catch (error) {
      console.error('❌ [LikedSongs] Error getting unsorted songs:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get unsorted songs' })
    }
  }

  async markAsSorted(req, res) {
    try {
      const { track_id, playlist_id, playlist_name } = req.body
      const userId = req.session.user.id

      if (!track_id || !playlist_id || !playlist_name) {
        return res.status(400).json({ 
          error: 'track_id, playlist_id, and playlist_name are required' 
        })
      }

      await this.sortedSongsModel.markSongAsSorted(
        userId, 
        track_id, 
        playlist_id, 
        playlist_name
      )

      res.json({ 
        message: 'Song marked as sorted',
        track_id,
        playlist_name
      })
    } catch (error) {
      console.error('❌ [LikedSongs] Error marking song as sorted:', error)
      res.status(500).json({ error: 'Failed to mark song as sorted' })
    }
  }

  async getSortingStats(req, res) {
    try {
      const userId = req.session.user.id
      const stats = await this.sortedSongsModel.getSortingStats(userId)
      
      res.json(stats)
    } catch (error) {
      console.error('❌ [LikedSongs] Error getting sorting stats:', error)
      res.status(500).json({ error: 'Failed to get sorting stats' })
    }
  }

  async getTrackWithFeatures(req, res) {
    try {
      const { id } = req.params
      const userId = req.session.user.id

      // Get track details and audio features
      const [trackDetails, audioFeatures] = await Promise.all([
        this.spotifyService.getTrackDetails(req.accessToken, id),
        this.spotifyService.getAudioFeatures(req.accessToken, id)
      ])

      if (!trackDetails) {
        return res.status(404).json({ error: 'Track not found' })
      }

      // Check if sorted
      const isSorted = await this.sortedSongsModel.isSongSorted(userId, id)

      // Get artist details for genres
      const artistDetails = await Promise.all(
        trackDetails.artists.map(artist => 
          this.spotifyService.getArtistDetails(req.accessToken, artist.id)
        )
      )

      const enrichedTrack = {
        id: trackDetails.id,
        title: trackDetails.name,
        artist: trackDetails.artists.map(artist => artist.name).join(', '),
        album: trackDetails.album.name,
        album_art: trackDetails.album.images[0]?.url,
        duration_ms: trackDetails.duration_ms,
        popularity: trackDetails.popularity,
        explicit: trackDetails.explicit,
        preview_url: trackDetails.preview_url,
        uri: trackDetails.uri,
        release_date: trackDetails.album.release_date,
        genres: [...new Set(artistDetails.flatMap(artist => artist?.genres || []))],
        is_sorted: isSorted,
        audio_features: audioFeatures ? {
          danceability: audioFeatures.danceability,
          energy: audioFeatures.energy,
          valence: audioFeatures.valence,
          tempo: audioFeatures.tempo,
          loudness: audioFeatures.loudness,
          acousticness: audioFeatures.acousticness,
          instrumentalness: audioFeatures.instrumentalness,
          speechiness: audioFeatures.speechiness,
          key: audioFeatures.key,
          mode: audioFeatures.mode,
          time_signature: audioFeatures.time_signature
        } : null
      }

      res.json(enrichedTrack)
    } catch (error) {
      console.error('❌ [LikedSongs] Error getting track with features:', error)
      if (error.message === 'TOKEN_EXPIRED') {
        return res.status(401).json({ error: 'Token expired' })
      }
      res.status(500).json({ error: 'Failed to get track details' })
    }
  }
}
