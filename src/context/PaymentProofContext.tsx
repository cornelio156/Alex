'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PaymentProof } from '@/types/payment'
import { PaymentProofService } from '@/services/paymentProofService'
import { useWasabiConfig } from './WasabiConfigContext'

interface PaymentProofContextType {
  paymentProofs: PaymentProof[]
  confirmedProofs: PaymentProof[]
  loading: boolean
  error: string | null
  addPaymentProof: (imageFile: File, amount: number, customerName?: string) => Promise<PaymentProof>
  updatePaymentProof: (documentId: string, updates: Partial<PaymentProof>) => Promise<PaymentProof>
  deletePaymentProof: (documentId: string) => Promise<boolean>
  approvePaymentProof: (documentId: string) => Promise<PaymentProof>
  rejectPaymentProof: (documentId: string) => Promise<PaymentProof>
  refreshPaymentProofs: () => Promise<void>
}

const PaymentProofContext = createContext<PaymentProofContextType | undefined>(undefined)

export const usePaymentProofs = () => {
  const context = useContext(PaymentProofContext)
  if (!context) {
    throw new Error('usePaymentProofs deve ser usado dentro de um PaymentProofProvider')
  }
  return context
}

interface PaymentProofProviderProps {
  children: ReactNode
}

export const PaymentProofProvider = ({ children }: PaymentProofProviderProps) => {
  const [paymentProofs, setPaymentProofs] = useState<PaymentProof[]>([])
  const [confirmedProofs, setConfirmedProofs] = useState<PaymentProof[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isConfigured: isWasabiConfigured, loading: wasabiConfigLoading } = useWasabiConfig()

  // Carregar comprovantes do Appwrite na inicialização
  const refreshPaymentProofs = async () => {
    try {
      setLoading(true)
      setError(null)
      const [allProofs, confirmed] = await Promise.all([
        PaymentProofService.listPaymentProofs(),
        PaymentProofService.listConfirmedPaymentProofs()
      ])
      setPaymentProofs(allProofs)
      setConfirmedProofs(confirmed)
    } catch (err) {
      console.error('Erro ao carregar comprovantes:', err)
      setError('Erro ao carregar comprovantes de pagamento')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Só carregar comprovantes se o Wasabi estiver configurado
    if (!wasabiConfigLoading && isWasabiConfigured) {
      refreshPaymentProofs()
    } else if (!wasabiConfigLoading && !isWasabiConfigured) {
      // Se o Wasabi não estiver configurado, definir loading como false
      setLoading(false)
    }
  }, [wasabiConfigLoading, isWasabiConfigured])

  const addPaymentProof = async (imageFile: File, amount: number, customerName?: string): Promise<PaymentProof> => {
    try {
      setError(null)
      const newProof = await PaymentProofService.createPaymentProof(imageFile, amount, customerName)
      setPaymentProofs(prev => [newProof, ...prev])
      return newProof
    } catch (err) {
      console.error('Erro ao adicionar comprovante:', err)
      setError('Erro ao adicionar comprovante de pagamento')
      throw err
    }
  }

  const updatePaymentProof = async (documentId: string, updates: Partial<PaymentProof>): Promise<PaymentProof> => {
    try {
      setError(null)
      const updatedProof = await PaymentProofService.updatePaymentProof(documentId, updates)
      setPaymentProofs(prev => 
        prev.map(proof => proof.$id === documentId ? updatedProof : proof)
      )
      
      // Atualizar também na lista de confirmados se necessário
      if (updates.status === 'approved') {
        setConfirmedProofs(prev => [updatedProof, ...prev])
      } else if (updates.status === 'rejected') {
        setConfirmedProofs(prev => prev.filter(proof => proof.$id !== documentId))
      }
      
      return updatedProof
    } catch (err) {
      console.error('Erro ao atualizar comprovante:', err)
      setError('Erro ao atualizar comprovante de pagamento')
      throw err
    }
  }

  const deletePaymentProof = async (documentId: string): Promise<boolean> => {
    try {
      setError(null)
      await PaymentProofService.deletePaymentProof(documentId)
      setPaymentProofs(prev => prev.filter(proof => proof.$id !== documentId))
      setConfirmedProofs(prev => prev.filter(proof => proof.$id !== documentId))
      return true
    } catch (err) {
      console.error('Erro ao deletar comprovante:', err)
      setError('Erro ao deletar comprovante de pagamento')
      throw err
    }
  }

  const approvePaymentProof = async (documentId: string): Promise<PaymentProof> => {
    try {
      setError(null)
      const approvedProof = await PaymentProofService.approvePaymentProof(documentId)
      setPaymentProofs(prev => 
        prev.map(proof => proof.$id === documentId ? approvedProof : proof)
      )
      setConfirmedProofs(prev => [approvedProof, ...prev])
      return approvedProof
    } catch (err) {
      console.error('Erro ao aprovar comprovante:', err)
      setError('Erro ao aprovar comprovante de pagamento')
      throw err
    }
  }

  const rejectPaymentProof = async (documentId: string): Promise<PaymentProof> => {
    try {
      setError(null)
      const rejectedProof = await PaymentProofService.rejectPaymentProof(documentId)
      setPaymentProofs(prev => 
        prev.map(proof => proof.$id === documentId ? rejectedProof : proof)
      )
      setConfirmedProofs(prev => prev.filter(proof => proof.$id !== documentId))
      return rejectedProof
    } catch (err) {
      console.error('Erro ao rejeitar comprovante:', err)
      setError('Erro ao rejeitar comprovante de pagamento')
      throw err
    }
  }

  const value: PaymentProofContextType = {
    paymentProofs,
    confirmedProofs,
    loading,
    error,
    addPaymentProof,
    updatePaymentProof,
    deletePaymentProof,
    approvePaymentProof,
    rejectPaymentProof,
    refreshPaymentProofs
  }

  return (
    <PaymentProofContext.Provider value={value}>
      {children}
    </PaymentProofContext.Provider>
  )
}
