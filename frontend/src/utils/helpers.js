export const formatDuration = (ms) => {
  const minutes = Math.floor(ms / 60000)
  const seconds = ((ms % 60000) / 1000).toFixed(0)
  return `${minutes}:${seconds.padStart(2, '0')}`
}

export const formatArtists = (artists) => {
  if (!artists || artists.length === 0) return 'Unknown Artist'
  return artists.map(artist => artist.name).join(', ')
}

export const getImageUrl = (images, size = 'medium') => {
  if (!images || images.length === 0) return null
  
  const sizeMap = {
    small: 64,
    medium: 300,
    large: 640
  }
  
  const targetSize = sizeMap[size] || 300
  
  // Find the closest image size
  const sortedImages = images.sort((a, b) => 
    Math.abs(a.width - targetSize) - Math.abs(b.width - targetSize)
  )
  
  return sortedImages[0]?.url || null
}

export const debounce = (func, wait) => {
  let timeout
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }
    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export const generatePlaylistKey = (existingKeys) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  for (let char of alphabet) {
    if (!existingKeys.includes(char)) {
      return char
    }
  }
  return null
}
