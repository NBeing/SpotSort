export const authenticateToken = (req, res, next) => {
  // Check for token in session first (primary method)
  if (req.session && req.session.spotify_access_token) {
    req.accessToken = req.session.spotify_access_token
    return next()
  }

  // Fallback to Authorization header
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (token) {
    req.accessToken = token
    return next()
  }

  return res.status(401).json({ 
    error: 'Access token required',
    code: 'NO_TOKEN'
  })
}

export const requireAuth = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ 
      error: 'Authentication required',
      code: 'NOT_AUTHENTICATED'
    })
  }
  next()
}
