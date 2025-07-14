import React from 'react'
import { CheckCircle, AlertCircle, XCircle, Info } from 'lucide-react'

const StatusBar = ({ message, type = 'info' }) => {
  const getStatusConfig = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'rgba(29, 185, 84, 0.2)',
          icon: <CheckCircle size={16} className="text-spotify-green" />,
          textColor: 'text-green-300'
        }
      case 'warning':
        return {
          bg: 'rgba(255, 193, 7, 0.2)',
          icon: <AlertCircle size={16} className="text-yellow-400" />,
          textColor: 'text-yellow-300'
        }
      case 'error':
        return {
          bg: 'rgba(220, 53, 69, 0.2)',
          icon: <XCircle size={16} className="text-red-400" />,
          textColor: 'text-red-300'
        }
      default:
        return {
          bg: 'rgba(255, 255, 255, 0.1)',
          icon: <Info size={16} className="text-blue-400" />,
          textColor: 'text-white'
        }
    }
  }

  const { bg, icon, textColor } = getStatusConfig()

  return (
    <div 
      className={`flex items-center justify-center gap-2 py-4 px-6 rounded-2xl transition-all duration-300 ${textColor}`}
      style={{ backgroundColor: bg }}
    >
      {icon}
      <span>{message}</span>
    </div>
  )
}

export default StatusBar
