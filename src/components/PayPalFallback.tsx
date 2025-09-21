'use client'

import { Video } from '@/types/video'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { getGenericProductName } from '@/utils/productMapper'
import { MessageCircle, AlertTriangle } from 'lucide-react'

interface PayPalFallbackProps {
  video: Video
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PayPalFallback({ video, onSuccess }: PayPalFallbackProps) {
  const { config } = useSiteConfig()

  const handleTelegramPayment = () => {
    const telegramMessage = `💳 Payment Request\n\n📚 Product: ${video.title}\n💰 Amount: $${video.price}\n\nPlease process this payment and send the content.`
    const telegramUrl = `https://t.me/${config.telegramUsername}?text=${encodeURIComponent(telegramMessage)}`
    
    window.open(telegramUrl, '_blank')
    onSuccess?.()
  }

  return (
    <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-start">
        <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">
            PayPal Payment Unavailable
          </h3>
          <p className="text-sm text-yellow-800 mb-4">
            PayPal payment is currently unavailable. You can still complete your purchase through Telegram.
          </p>
          
          <div className="bg-white p-3 rounded-lg mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Product:</span>
              <span className="text-sm font-medium">{getGenericProductName(video.title)}</span>
            </div>
            <div className="flex justify-between items-center mt-1">
              <span className="text-sm text-gray-600">Amount:</span>
              <span className="text-lg font-bold text-green-600">${video.price}</span>
            </div>
          </div>

          <button
            onClick={handleTelegramPayment}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg font-medium transition-colors flex items-center justify-center"
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Pay via Telegram
          </button>
          
          <p className="text-xs text-yellow-700 mt-2 text-center">
            Click to open Telegram and complete your payment
          </p>
        </div>
      </div>
    </div>
  )
}
