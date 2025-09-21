import { WasabiStorage, wasabiConfig } from './wasabi'

// Tipos para metadados
export interface VideoMetadata {
  id: string
  title: string
  description: string
  price: number
  duration?: string
  uploadDate?: string
  status: 'published' | 'draft' | 'processing'
  views?: number
  tags?: string[]
  videoFileKey?: string // Chave do arquivo de vídeo no Wasabi
  videoUrl?: string // URL direta do vídeo
  fileSize?: number // Tamanho do arquivo em bytes
  mimeType?: string // Tipo MIME do vídeo
  productLink?: string // Link do produto entregue após pagamento
}

export interface SiteConfigMetadata {
  telegramUsername: string
  siteName: string
  description: string
  paypalClientId: string
  paypalEnvironment: 'sandbox' | 'live'
}

export interface PayPalPaymentMetadata {
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

export interface PaymentProofMetadata {
  id: string
  videoId: string
  videoTitle: string
  amount: number
  currency: string
  status: 'pending' | 'approved' | 'rejected'
  proofImageKey?: string // Chave da imagem de comprovante no Wasabi
  proofImageUrl?: string // URL da imagem de comprovante
  uploadedAt: string
  approvedAt?: string
  rejectedAt?: string
  rejectionReason?: string
}

export class MetadataService {
  private static metadataBucket = wasabiConfig.metadataBucketName

  // Gerar chave única para arquivos
  private static generateKey(prefix: string, id?: string): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 15)
    return `${prefix}/${id || `${timestamp}_${random}`}.json`
  }

  // Salvar metadados
  static async saveMetadata<T>(type: string, data: T, id?: string): Promise<string> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, salvar no localStorage como fallback
        const key = this.generateKey(type, id)
        localStorage.setItem(`metadata_${key}`, JSON.stringify(data))
        return key
      } else {
        // No servidor, usar Wasabi
        const key = this.generateKey(type, id)
        const jsonData = JSON.stringify(data, null, 2)
        
        const file = new File([jsonData], `${type}.json`, { type: 'application/json' })
        await WasabiStorage.uploadFile(file, key, this.metadataBucket)
        
        return key
      }
    } catch (error) {
      console.error(`Erro ao salvar metadados ${type}:`, error)
      throw error
    }
  }

  // Carregar metadados
  static async loadMetadata<T>(type: string, id?: string): Promise<T | null> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, primeiro tentar localStorage, depois API route
        const key = this.generateKey(type, id)
        const localData = localStorage.getItem(`metadata_${key}`)
        if (localData) {
          try {
            return JSON.parse(localData)
          } catch (error) {
            console.error('Erro ao parsear dados do localStorage:', error)
          }
        }
        
        // Se não encontrar no localStorage, tentar API route
        const response = await fetch(`/api/metadata/${type}/${id || 'default'}`)
        if (!response.ok) {
          return null
        }
        return await response.json()
      } else {
        // No servidor, usar Wasabi diretamente
        const key = this.generateKey(type, id)
        const url = await WasabiStorage.getFileUrl(key, this.metadataBucket)
        const response = await fetch(url)
        if (!response.ok) {
          return null
        }
        return await response.json()
      }
    } catch (error) {
      console.error(`Erro ao carregar metadados ${type}:`, error)
      return null
    }
  }

  // Listar metadados por tipo
  static async listMetadata<T>(type: string): Promise<T[]> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, listar do localStorage
        const metadataList: T[] = []
        const prefix = `metadata_${type}/`
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && key.startsWith(prefix)) {
            try {
              const data = localStorage.getItem(key)
              if (data) {
                metadataList.push(JSON.parse(data))
              }
            } catch (error) {
              console.error(`Erro ao parsear dados do localStorage ${key}:`, error)
            }
          }
        }
        
        return metadataList
      } else {
        // No servidor, usar Wasabi
        const response = await WasabiStorage.listFiles(`${type}/`, this.metadataBucket)
        const metadataList: T[] = []

        for (const file of response.files) {
          if (file.$id && file.$id.endsWith('.json')) {
            const url = await WasabiStorage.getFileUrl(file.$id, this.metadataBucket)
            try {
              const response = await fetch(url)
              if (response.ok) {
                const metadata = await response.json()
                metadataList.push(metadata)
              }
            } catch (error) {
              console.error(`Erro ao carregar arquivo ${file.$id}:`, error)
            }
          }
        }

        return metadataList
      }
    } catch (error) {
      console.error(`Erro ao listar metadados ${type}:`, error)
      return []
    }
  }

  // Deletar metadados
  static async deleteMetadata(type: string, id: string): Promise<boolean> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, deletar do localStorage
        const key = this.generateKey(type, id)
        localStorage.removeItem(`metadata_${key}`)
        return true
      } else {
        // No servidor, deletar do Wasabi
        const key = this.generateKey(type, id)
        await WasabiStorage.deleteFile(key, this.metadataBucket)
        return true
      }
    } catch (error) {
      console.error(`Erro ao deletar metadados ${type}:`, error)
      return false
    }
  }

  // Métodos genéricos para qualquer tipo de metadado
  static async saveGenericMetadata<T>(type: string, data: T, id?: string): Promise<string> {
    return this.saveMetadata(type, data, id)
  }

  static async loadGenericMetadata<T>(type: string, id?: string): Promise<T | null> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, usar API route
        const response = await fetch(`/api/metadata/${type}/${id || 'default'}`)
        if (!response.ok) {
          return null
        }
        return await response.json()
      } else {
        // No servidor, usar método original
        return this.loadMetadata<T>(type, id)
      }
    } catch (error) {
      console.error(`Erro ao carregar metadados genéricos ${type}:`, error)
      return null
    }
  }

  // Métodos específicos para cada tipo de metadado

  // Vídeos
  static async saveVideo(video: VideoMetadata): Promise<string> {
    return this.saveMetadata('videos', video, video.id)
  }

  static async loadVideo(id: string): Promise<VideoMetadata | null> {
    return this.loadMetadata<VideoMetadata>('videos', id)
  }

  static async listVideos(): Promise<VideoMetadata[]> {
    return this.listMetadata<VideoMetadata>('videos')
  }

  static async deleteVideo(id: string): Promise<boolean> {
    return this.deleteMetadata('videos', id)
  }

  // Configuração do site
  static async saveSiteConfig(config: SiteConfigMetadata): Promise<string> {
    return this.saveMetadata('site-config', config, 'main')
  }

  static async loadSiteConfig(): Promise<SiteConfigMetadata | null> {
    return this.loadMetadata<SiteConfigMetadata>('site-config', 'main')
  }

  // Pagamentos PayPal
  static async savePayPalPayment(payment: PayPalPaymentMetadata): Promise<string> {
    return this.saveMetadata('paypal-payments', payment, payment.id)
  }

  static async loadPayPalPayment(id: string): Promise<PayPalPaymentMetadata | null> {
    return this.loadMetadata<PayPalPaymentMetadata>('paypal-payments', id)
  }

  static async listPayPalPayments(): Promise<PayPalPaymentMetadata[]> {
    return this.listMetadata<PayPalPaymentMetadata>('paypal-payments')
  }

  // Comprovantes de pagamento
  static async savePaymentProof(proof: PaymentProofMetadata): Promise<string> {
    return this.saveMetadata('payment-proofs', proof, proof.id)
  }

  static async loadPaymentProof(id: string): Promise<PaymentProofMetadata | null> {
    return this.loadMetadata<PaymentProofMetadata>('payment-proofs', id)
  }

  static async listPaymentProofs(): Promise<PaymentProofMetadata[]> {
    return this.listMetadata<PaymentProofMetadata>('payment-proofs')
  }

  static async deletePaymentProof(id: string): Promise<boolean> {
    return this.deleteMetadata('payment-proofs', id)
  }
}
