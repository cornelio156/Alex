import { MetadataService, PaymentProofMetadata } from '@/lib/metadata'
import { WasabiStorage } from '@/lib/wasabi'
import { PaymentProof } from '@/types/payment'

export class PaymentProofService {
  // Criar novo comprovante de pagamento
  static async createPaymentProof(imageFile: File, amount: number, customerName?: string): Promise<PaymentProof> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, usar API route para upload
        const imageKey = `payment-proofs/${Date.now()}_${imageFile.name}`
        
        const formData = new FormData()
        formData.append('file', imageFile)
        formData.append('key', imageKey)
        formData.append('bucketName', 'alex-site-storage')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Erro no upload da imagem')
        }
        
        const uploadResult = await response.json()
        const imageUrl = uploadResult.fileUrl
        
        // Criar metadados
        const id = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        const metadata: PaymentProofMetadata = {
          id,
          videoId: '', // Será preenchido quando associado a um vídeo
          videoTitle: '',
          amount,
          currency: 'BRL',
          status: 'pending',
          proofImageKey: imageKey,
          proofImageUrl: imageUrl,
          uploadedAt: new Date().toISOString()
        }
        
        await MetadataService.savePaymentProof(metadata)
        
        return {
          $id: id,
          $createdAt: metadata.uploadedAt,
          $updatedAt: metadata.uploadedAt,
          imageUrl,
          amount,
          customerName: customerName || '',
          paymentDate: metadata.uploadedAt,
          status: 'pending'
        } as PaymentProof
      } else {
        // No servidor, usar Wasabi diretamente
        const imageKey = `payment-proofs/${Date.now()}_${imageFile.name}`
        await WasabiStorage.uploadFile(imageFile, imageKey)
        const imageUrl = await WasabiStorage.getFileUrl(imageKey)
        
        // Criar metadados
        const id = `proof_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
        const metadata: PaymentProofMetadata = {
          id,
          videoId: '', // Será preenchido quando associado a um vídeo
          videoTitle: '',
          amount,
          currency: 'BRL',
          status: 'pending',
          proofImageKey: imageKey,
          proofImageUrl: imageUrl,
          uploadedAt: new Date().toISOString()
        }
        
        await MetadataService.savePaymentProof(metadata)
        
        return {
          $id: id,
          $createdAt: metadata.uploadedAt,
          $updatedAt: metadata.uploadedAt,
          imageUrl,
          amount,
          customerName: customerName || '',
          paymentDate: metadata.uploadedAt,
          status: 'pending'
        } as PaymentProof
      }
    } catch (error) {
      console.error('Erro ao criar comprovante de pagamento:', error)
      throw error
    }
  }

  // Listar todos os comprovantes de pagamento
  static async listPaymentProofs(): Promise<PaymentProof[]> {
    try {
      const metadataList = await MetadataService.listPaymentProofs()
      return metadataList.map(metadata => ({
        $id: metadata.id,
        $createdAt: metadata.uploadedAt,
        $updatedAt: metadata.uploadedAt,
        imageUrl: metadata.proofImageUrl || '',
        amount: metadata.amount,
        customerName: '', // Não armazenado nos metadados atuais
        paymentDate: metadata.uploadedAt,
        status: metadata.status as 'pending' | 'approved' | 'rejected'
      } as PaymentProof))
    } catch (error) {
      console.error('Erro ao listar comprovantes de pagamento:', error)
      throw error
    }
  }

  // Listar apenas comprovantes aprovados (para homepage)
  static async listConfirmedPaymentProofs(): Promise<PaymentProof[]> {
    try {
      const allProofs = await this.listPaymentProofs()
      return allProofs.filter(proof => proof.status === 'approved')
    } catch (error) {
      console.error('Erro ao listar comprovantes confirmados:', error)
      throw error
    }
  }

  // Obter comprovante por ID
  static async getPaymentProof(documentId: string): Promise<PaymentProof> {
    try {
      const metadata = await MetadataService.loadPaymentProof(documentId)
      if (!metadata) {
        throw new Error('Comprovante não encontrado')
      }
      
      return {
        $id: metadata.id,
        $createdAt: metadata.uploadedAt,
        $updatedAt: metadata.uploadedAt,
        imageUrl: metadata.proofImageUrl || '',
        amount: metadata.amount,
        customerName: '', // Não armazenado nos metadados atuais
        paymentDate: metadata.uploadedAt,
        status: metadata.status as 'pending' | 'approved' | 'rejected'
      } as PaymentProof
    } catch (error) {
      console.error('Erro ao obter comprovante de pagamento:', error)
      throw error
    }
  }

  // Atualizar comprovante de pagamento
  static async updatePaymentProof(
    documentId: string, 
    updates: Partial<Omit<PaymentProof, '$id' | '$createdAt' | '$updatedAt'>>
  ): Promise<PaymentProof> {
    try {
      const existing = await MetadataService.loadPaymentProof(documentId)
      if (!existing) {
        throw new Error('Comprovante não encontrado')
      }

      const updatedMetadata: PaymentProofMetadata = {
        ...existing,
        amount: updates.amount || existing.amount,
        status: (updates.status as 'pending' | 'approved' | 'rejected') || existing.status,
        approvedAt: updates.status === 'approved' ? new Date().toISOString() : existing.approvedAt,
        rejectedAt: updates.status === 'rejected' ? new Date().toISOString() : existing.rejectedAt
      }

      await MetadataService.savePaymentProof(updatedMetadata)
      
      return {
        $id: updatedMetadata.id,
        $createdAt: updatedMetadata.uploadedAt,
        $updatedAt: new Date().toISOString(),
        imageUrl: updatedMetadata.proofImageUrl || '',
        amount: updatedMetadata.amount,
        customerName: '', // Não armazenado nos metadados atuais
        paymentDate: updatedMetadata.uploadedAt,
        status: updatedMetadata.status as 'pending' | 'approved' | 'rejected'
      } as PaymentProof
    } catch (error) {
      console.error('Erro ao atualizar comprovante de pagamento:', error)
      throw error
    }
  }

  // Deletar comprovante de pagamento
  static async deletePaymentProof(documentId: string): Promise<boolean> {
    try {
      const metadata = await MetadataService.loadPaymentProof(documentId)
      if (metadata?.proofImageKey) {
        await WasabiStorage.deleteFile(metadata.proofImageKey)
      }
      return await MetadataService.deletePaymentProof(documentId)
    } catch (error) {
      console.error('Erro ao deletar comprovante de pagamento:', error)
      throw error
    }
  }

  // Aprovar comprovante
  static async approvePaymentProof(documentId: string): Promise<PaymentProof> {
    return this.updatePaymentProof(documentId, { status: 'approved' })
  }

  // Rejeitar comprovante
  static async rejectPaymentProof(documentId: string): Promise<PaymentProof> {
    return this.updatePaymentProof(documentId, { status: 'rejected' })
  }

  // Upload de imagem do comprovante
  static async uploadPaymentProofImage(file: File): Promise<{ fileId: string; url: string }> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, usar API route para upload
        const imageKey = `payment-proofs/${Date.now()}_${file.name}`
        
        const formData = new FormData()
        formData.append('file', file)
        formData.append('key', imageKey)
        formData.append('bucketName', 'alex-site-storage')
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData
        })
        
        if (!response.ok) {
          throw new Error('Erro no upload da imagem')
        }
        
        const uploadResult = await response.json()
        
        return {
          fileId: imageKey,
          url: uploadResult.fileUrl
        }
      } else {
        // No servidor, usar Wasabi diretamente
        const imageKey = `payment-proofs/${Date.now()}_${file.name}`
        await WasabiStorage.uploadFile(file, imageKey)
        const url = await WasabiStorage.getFileUrl(imageKey)
        
        return {
          fileId: imageKey,
          url: url
        }
      }
    } catch (error) {
      console.error('Erro ao fazer upload da imagem:', error)
      throw error
    }
  }

  // Deletar imagem do comprovante
  static async deletePaymentProofImage(fileId: string): Promise<boolean> {
    try {
      await WasabiStorage.deleteFile(fileId)
      return true
    } catch (error) {
      console.error('Erro ao deletar imagem do comprovante:', error)
      throw error
    }
  }
}
