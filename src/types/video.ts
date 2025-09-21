export interface Video {
  id: string
  title: string
  description: string
  price: number
  duration?: string
  uploadDate?: string
  status: 'published' | 'draft' | 'processing'
  views?: number
  tags?: string[]
  videoFileId?: string // ID do arquivo de vídeo no Appwrite Storage
  videoUrl?: string // URL direta do vídeo
  fileSize?: number // Tamanho do arquivo em bytes
  mimeType?: string // Tipo MIME do vídeo
  productLink?: string // Link do produto entregue após pagamento
}

export interface SiteConfig {
  telegramUsername: string
  siteName: string
  description: string
  paypalClientId: string // Client ID do PayPal
  paypalEnvironment: 'sandbox' | 'live' // Ambiente do PayPal
}

export interface PayPalPayment {
  id: string
  videoId: string
  videoTitle: string
  amount: number
  currency: string
  status: 'pending' | 'completed' | 'failed'
  paypalOrderId?: string
  paypalPayerId?: string
  createdAt: string
  completedAt?: string
}
