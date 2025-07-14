import { useEffect } from 'react'

export const useKeyboardShortcuts = ({ onKeyPress, onSpace, onEnter }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      const key = event.key.toUpperCase()
      
      // Ignore if typing in an input field
      if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') {
        return
      }
      
      // Handle special keys
      if (key === ' ' && onSpace) {
        event.preventDefault()
        onSpace()
        return
      }
      
      if (key === 'ENTER' && onEnter) {
        event.preventDefault()
        onEnter()
        return
      }
      
      // Handle letter keys for playlists
      if (key.match(/[A-Z]/) && onKeyPress) {
        event.preventDefault()
        onKeyPress(key)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onKeyPress, onSpace, onEnter])
}
