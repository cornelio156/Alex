'use client'

import { useAuth } from '@/hooks/useAuth'
import { useState, useEffect } from 'react'

export default function InitializationLoader() {
  const { isLoading, isInitialized } = useAuth()
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  // Evitar hidratação - só renderizar no cliente
  if (!isClient) {
    return null
  }

  // Se não está carregando e está inicializado, não mostrar nada
  if (!isLoading && isInitialized) {
    return null
  }

  // Se está carregando mas já foi inicializado antes, mostrar apenas um loader discreto
  if (isLoading && isInitialized) {
    return (
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-white rounded-lg shadow-lg p-3 flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600 mr-2"></div>
          <span className="text-sm text-gray-600">Carregando...</span>
        </div>
      </div>
    )
  }

  // Só mostrar a tela de inicialização completa se realmente for a primeira vez
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-8"></div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Inicializando Sistema
        </h2>
        
        <p className="text-gray-600 mb-8">
          Configurando sistema pela primeira vez...
        </p>

               <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                 <h3 className="font-semibold text-blue-900 mb-2">Sistema sendo inicializado</h3>
                 <p className="text-blue-700 text-sm">
                   Configurando sistema pela primeira vez...
                 </p>
               </div>
      </div>
    </div>
  )
}

