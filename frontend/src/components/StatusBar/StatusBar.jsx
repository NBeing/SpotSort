import React from 'react'

const StatusBar = ({ message, type = 'info' }) => {
  const getStatusBackground = () => {
    switch (type) {
      case 'success': return 'rgba(29, 185, 84, 0.2)'
      case 'warning': return 'rgba(255, 193, 7, 0.2)'
      case 'error': return 'rgba(220, 53, 69, 0.2)'
      default: return 'rgba(255, 255, 255, 0.1)'
    }
  }

  return (
    <div 
      className="text-center py-4 px-6 rounded-2xl transition-all duration-300"
      style={{ backgroundColor: getStatusBackground() }}
    >
      {message}
    </div>
  )
}

export default StatusBar
