export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

  if (!token && !req.session.spotify_access_token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  // Use token from header or session
  req.accessToken = token || req.session.spotify_access_token
  next()
}

export const requireAuth = (req, res, next) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  next()
}
