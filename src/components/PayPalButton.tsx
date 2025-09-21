'use client'

import { PayPalButtons, PayPalScriptProvider, FUNDING } from '@paypal/react-paypal-js'
import { useEffect, useState } from 'react'
import { PayPalService } from '@/services/paypalService'
import { Video } from '@/types/video'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { getGenericProductName, getGenericDescription } from '@/utils/productMapper'

interface PayPalButtonProps {
  video: Video
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function PayPalButton({ video, onSuccess, onError }: PayPalButtonProps) {
  const { config } = useSiteConfig()
  const [isProcessing, setIsProcessing] = useState(false)
  const [deliveredLink, setDeliveredLink] = useState<string | null>(null)

  // Hide link on refresh (session only)
  useEffect(() => {
    const key = `delivered-link:${video.id}`
    const link = sessionStorage.getItem(key)
    if (link) {
      setDeliveredLink(link)
    }
    // On refresh, clear
    const handleBeforeUnload = () => {
      sessionStorage.removeItem(key)
    }
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [video.id])

  if (!config.paypalClientId) {
    return (
      <div className="w-full bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
        <p className="text-yellow-800 text-sm">
          PayPal not configured. Contact via Telegram.
        </p>
      </div>
    )
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      alert('Link copied!')
    } catch (_e) {}
  }

  const createOrder = async (actions: unknown) => {
    // Criar pagamento no Appwrite e ordem PayPal
    const payment = await PayPalService.createPayment({
      videoId: video.id,
      videoTitle: video.title,
      amount: video.price || 0,
      currency: 'USD',
      status: 'pending'
    })

    const genericProductName = getGenericProductName(video.title)
    const genericDescription = getGenericDescription(video.title, video.price || 0)

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const order = await (actions as any).order.create({
      purchase_units: [
        {
          description: genericDescription,
          amount: {
            value: (video.price || 0).toString(),
            currency_code: 'USD'
          },
          custom_id: payment.id,
          soft_descriptor: genericProductName
        }
      ],
      application_context: {
        shipping_preference: 'NO_SHIPPING',
        brand_name: 'Digital Content Store',
        user_action: 'PAY_NOW'
      }
    })
    return order
  }

  const onApprove = async (
    _data: unknown,
    actions: unknown
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const details = await (actions as any).order.capture()
    if (details.purchase_units?.[0]?.custom_id) {
      await PayPalService.updatePaymentStatus(
        details.purchase_units[0].custom_id,
        'completed',
        details.id,
        details.payer?.payer_id
      )
    }
    if (video.productLink) {
      const key = `delivered-link:${video.id}`
      sessionStorage.setItem(key, video.productLink)
      setDeliveredLink(video.productLink)
    }
    const genericProductName = getGenericProductName(video.title)
    try {
      await fetch('/api/telegram/notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `✅ Payment confirmed!\n\n📚 Product: ${genericProductName}\n💰 Amount: $${video.price}\n\nPlease send the purchased content.`
        })
      })
    } catch (_e) {
      // silent
    }
    onSuccess?.()
  }

  return (
    <div className="w-full space-y-2">
      {deliveredLink && (
        <div className="w-full border rounded-lg p-3 bg-green-50 border-green-200">
          <div className="text-green-700 text-sm font-medium mb-2">Your product link</div>
          <div className="flex items-center gap-2">
            <input readOnly value={deliveredLink} className="flex-1 border rounded px-3 py-2 bg-white" />
            <button onClick={() => copyToClipboard(deliveredLink)} className="px-3 py-2 bg-green-600 text-white rounded">Copy</button>
          </div>
          <div className="text-xs text-gray-600 mt-1">This link will disappear on refresh.</div>
        </div>
      )}

      <PayPalScriptProvider
        options={{
          clientId: config.paypalClientId,
          currency: 'USD',
          intent: 'capture',
          enableFunding: 'card' // show card button
        }}
      >
        <div className="grid gap-2">
          {/* Pay with PayPal */}
          <PayPalButtons
            createOrder={(_data, actions) => {
              setIsProcessing(true)
              return createOrder(actions)
            }}
            onApprove={(data, actions) => onApprove(data, actions)}
            onError={(_err) => {
              onError?.('Payment error')
              setIsProcessing(false)
            }}
            onCancel={() => {
              onError?.('Payment cancelled')
              setIsProcessing(false)
            }}
            style={{ layout: 'horizontal', color: 'blue', shape: 'rect', label: 'pay' }}
          />

          {/* Pay with Card */}
          <PayPalButtons
            fundingSource={FUNDING.CARD}
            createOrder={(_data, actions) => {
              setIsProcessing(true)
              return createOrder(actions)
            }}
            onApprove={(data, actions) => onApprove(data, actions)}
            onError={(_err) => {
              onError?.('Payment error')
              setIsProcessing(false)
            }}
            onCancel={() => {
              onError?.('Payment cancelled')
              setIsProcessing(false)
            }}
            style={{ layout: 'horizontal', color: 'black', shape: 'rect', label: 'pay' }}
          />
        </div>
        
        {isProcessing && (
          <div className="text-center text-sm text-blue-600">
            Processing payment...
          </div>
        )}
        
        <div className="text-xs text-gray-500 text-center mt-2">
          Secure payment via PayPal or Card
        </div>
      </PayPalScriptProvider>
    </div>
  )
}
