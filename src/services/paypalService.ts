import { MetadataService, PayPalPaymentMetadata } from '@/lib/metadata'
import { PayPalPayment } from '@/types/video'

export class PayPalService {
  // Criar um novo pagamento
  static async createPayment(payment: Omit<PayPalPayment, 'id' | 'createdAt'>): Promise<PayPalPayment> {
    try {
      const id = `paypal_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
      
      const metadata: PayPalPaymentMetadata = {
        id,
        videoId: payment.videoId,
        videoTitle: payment.videoTitle,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paypalOrderId: payment.paypalOrderId,
        paypalPayerId: payment.paypalPayerId,
        createdAt: new Date().toISOString(),
        completedAt: payment.completedAt
      }

      await MetadataService.savePayPalPayment(metadata)

      return {
        id,
        videoId: payment.videoId,
        videoTitle: payment.videoTitle,
        amount: payment.amount,
        currency: payment.currency,
        status: payment.status,
        paypalOrderId: payment.paypalOrderId,
        paypalPayerId: payment.paypalPayerId,
        createdAt: metadata.createdAt,
        completedAt: payment.completedAt,
      }
    } catch (error) {
      console.error('Erro ao criar pagamento:', error)
      throw error
    }
  }

  // Atualizar status do pagamento
  static async updatePaymentStatus(
    paymentId: string,
    status: PayPalPayment['status'],
    paypalOrderId?: string,
    paypalPayerId?: string
  ): Promise<void> {
    try {
      const existing = await MetadataService.loadPayPalPayment(paymentId)
      if (!existing) {
        throw new Error('Pagamento não encontrado')
      }

      const updatedMetadata: PayPalPaymentMetadata = {
        ...existing,
        status,
        paypalOrderId: paypalOrderId || existing.paypalOrderId,
        paypalPayerId: paypalPayerId || existing.paypalPayerId,
        completedAt: status === 'completed' ? new Date().toISOString() : existing.completedAt
      }

      await MetadataService.savePayPalPayment(updatedMetadata)
    } catch (error) {
      console.error('Erro ao atualizar status do pagamento:', error)
      throw error
    }
  }

  // Obter pagamento por ID
  static async getPayment(paymentId: string): Promise<PayPalPayment | null> {
    try {
      const metadata = await MetadataService.loadPayPalPayment(paymentId)
      if (!metadata) {
        return null
      }

      return {
        id: metadata.id,
        videoId: metadata.videoId,
        videoTitle: metadata.videoTitle,
        amount: metadata.amount,
        currency: metadata.currency,
        status: metadata.status,
        paypalOrderId: metadata.paypalOrderId,
        paypalPayerId: metadata.paypalPayerId,
        createdAt: metadata.createdAt,
        completedAt: metadata.completedAt,
      }
    } catch (error) {
      console.error('Erro ao obter pagamento:', error)
      return null
    }
  }

  // Listar pagamentos por vídeo
  static async getPaymentsByVideo(videoId: string): Promise<PayPalPayment[]> {
    try {
      const allPayments = await MetadataService.listPayPalPayments()
      
      return allPayments
        .filter(payment => payment.videoId === videoId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .map(metadata => ({
          id: metadata.id,
          videoId: metadata.videoId,
          videoTitle: metadata.videoTitle,
          amount: metadata.amount,
          currency: metadata.currency,
          status: metadata.status,
          paypalOrderId: metadata.paypalOrderId,
          paypalPayerId: metadata.paypalPayerId,
          createdAt: metadata.createdAt,
          completedAt: metadata.completedAt,
        }))
    } catch (error) {
      console.error('Erro ao listar pagamentos do vídeo:', error)
      return []
    }
  }
}
