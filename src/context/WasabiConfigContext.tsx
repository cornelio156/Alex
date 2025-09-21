'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface WasabiConfigContextType {
  isConfigured: boolean
  loading: boolean
}

const WasabiConfigContext = createContext<WasabiConfigContextType | undefined>(undefined)

export const useWasabiConfig = () => {
  const context = useContext(WasabiConfigContext)
  if (!context) {
    throw new Error('useWasabiConfig deve ser usado dentro de um WasabiConfigProvider')
  }
  return context
}

interface WasabiConfigProviderProps {
  children: ReactNode
}

export const WasabiConfigProvider = ({ children }: WasabiConfigProviderProps) => {
  const [isConfigured, setIsConfigured] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar configuração do Wasabi via API
    const checkConfiguration = async () => {
      try {
        const response = await fetch('/api/wasabi-config')
        const data = await response.json()
        
        console.log('🔍 Wasabi configuration check result:', data)
        
        setIsConfigured(data.isConfigured)
        
        if (!data.isConfigured) {
          console.warn('Variáveis de ambiente do Wasabi não configuradas:', data.message)
        }
      } catch (error) {
        console.error('Erro ao verificar configuração do Wasabi:', error)
        setIsConfigured(false)
      } finally {
        setLoading(false)
      }
    }

    checkConfiguration()
  }, [])

  return (
    <WasabiConfigContext.Provider value={{ isConfigured, loading }}>
      {children}
    </WasabiConfigContext.Provider>
  )
}
