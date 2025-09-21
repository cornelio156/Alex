'use client'

import { Video } from '@/types/video'
import { PayPalButton } from './PayPalButton'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { MessageCircle } from 'lucide-react'

interface PaymentOptionsProps {
  video: Video
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PaymentOptions({ video, onSuccess, onError }: PaymentOptionsProps) {
  const { config } = useSiteConfig()

  const handleTelegramClick = () => {
    const telegramMessage = `💬 Negotiation Request\n\n📚 Product: ${video.title}\n💰 Price: $${video.price}\n\nI'm interested in this product. Let's discuss payment options.`
    const telegramUrl = `https://t.me/${config.telegramUsername}?text=${encodeURIComponent(telegramMessage)}`
    
    window.open(telegramUrl, '_blank')
    // Não chama onSuccess() pois é apenas para negociação
  }

  return (
    <div className="w-full space-y-4">
      {/* PayPal Payment */}
      <PayPalButton 
        video={video} 
        onSuccess={onSuccess} 
        onError={onError} 
      />

      {/* Telegram Button */}
      <button
        onClick={handleTelegramClick}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold py-3 px-6 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center"
      >
        <MessageCircle className="w-4 h-4 mr-2" />
        Negotiate via Telegram
      </button>

      {/* Security Information */}
      <div className="bg-gray-50 p-3 rounded-lg">
        <div className="flex items-start">
          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
            <div className="w-2 h-2 bg-green-600 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">Payment Options</p>
            <p className="text-xs text-gray-600 mt-1">
              Pay securely with PayPal or contact us via Telegram to discuss payment options.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
