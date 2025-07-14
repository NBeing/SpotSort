import morgan from 'morgan'

// Custom morgan token for user ID
morgan.token('user', (req) => {
  return req.session?.user?.id || 'anonymous'
})

// Custom format
export const loggerFormat = ':remote-addr - :user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms'

export const logger = morgan(loggerFormat)
