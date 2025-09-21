'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PaymentNotificationProps {
  type: 'success' | 'error' | 'info'
  message: string
  isVisible: boolean
  onClose: () => void
  autoHide?: boolean
  autoHideDelay?: number
}

export function PaymentNotification({
  type,
  message,
  isVisible,
  onClose,
  autoHide = true,
  autoHideDelay = 5000
}: PaymentNotificationProps) {
  const [_isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      
      if (autoHide) {
        const timer = setTimeout(() => {
          onClose()
        }, autoHideDelay)
        
        return () => clearTimeout(timer)
      }
    } else {
      setIsAnimating(false)
    }
  }, [isVisible, autoHide, autoHideDelay, onClose])

  if (!isVisible) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'error':
        return <XCircle className="w-5 h-5 text-red-600" />
      case 'info':
        return <AlertCircle className="w-5 h-5 text-blue-600" />
      default:
        return null
    }
  }

  const getStyles = () => {
    const baseStyles = 'fixed top-4 right-4 z-50 max-w-sm w-full bg-white rounded-lg shadow-lg border p-4 transform transition-all duration-300'
    
    switch (type) {
      case 'success':
        return `${baseStyles} border-green-200`
      case 'error':
        return `${baseStyles} border-red-200`
      case 'info':
        return `${baseStyles} border-blue-200`
      default:
        return baseStyles
    }
  }

  const getTextColor = () => {
    switch (type) {
      case 'success':
        return 'text-green-800'
      case 'error':
        return 'text-red-800'
      case 'info':
        return 'text-blue-800'
      default:
        return 'text-gray-800'
    }
  }

  return (
    <div className={getStyles()}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm font-medium ${getTextColor()}`}>
            {message}
          </p>
        </div>
        <div className="ml-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="inline-flex text-gray-400 hover:text-gray-600 focus:outline-none focus:text-gray-600 transition-colors"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
