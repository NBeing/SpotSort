export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err)

  // Spotify API errors
  if (err.response?.status === 401) {
    return res.status(401).json({ 
      error: 'Unauthorized - Token may be expired',
      code: 'TOKEN_EXPIRED'
    })
  }

  if (err.response?.status === 403) {
    return res.status(403).json({ 
      error: 'Forbidden - Insufficient permissions',
      code: 'INSUFFICIENT_PERMISSIONS'
    })
  }

  if (err.response?.status === 429) {
    return res.status(429).json({ 
      error: 'Rate limited - Too many requests',
      code: 'RATE_LIMITED'
    })
  }

  // Default error
  res.status(500).json({ 
    error: 'Internal server error',
    code: 'INTERNAL_ERROR'
  })
}
