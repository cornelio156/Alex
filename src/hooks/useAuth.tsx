'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { AuthService, User } from '@/lib/auth'
import { useWasabiConfig } from '@/context/WasabiConfigContext'

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  isInitialized: boolean
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isInitialized, setIsInitialized] = useState(false)
  const { } = useWasabiConfig()

  // Verificar se o usuário está logado
  const isAuthenticated = !!user

  // Inicializar sistema na primeira execução
  useEffect(() => {
    const initialize = async () => {
      try {
        setIsLoading(true)
        
        // Verificar se há usuário logado no localStorage primeiro
        const savedUser = localStorage.getItem('auth_user')
        if (savedUser) {
          try {
            const userData = JSON.parse(savedUser)
            setUser(userData)
            setIsInitialized(true)
            setIsLoading(false)
            return // Se já tem usuário logado, não precisa inicializar
          } catch (error) {
            console.error('Erro ao carregar usuário salvo:', error)
            localStorage.removeItem('auth_user')
          }
        }

        // Verificar se o sistema já foi inicializado no servidor (silenciosamente)
        try {
          const response = await fetch('/api/initialize')
          const data = await response.json()
          
          if (data.isInitialized) {
            setIsInitialized(true)
          } else {
            // Inicializar sistema no servidor (silenciosamente)
            const initResponse = await fetch('/api/initialize', { method: 'POST' })
            const initData = await initResponse.json()
            
            if (initData.success) {
              console.log('🎉 Sistema inicializado!')
              setIsInitialized(true)
            } else {
              console.error('Erro ao inicializar sistema:', initData.message)
              setIsInitialized(true)
            }
          }
        } catch (error) {
          console.error('Erro ao verificar inicialização:', error)
          setIsInitialized(true)
        }
      } catch (error) {
        console.error('Erro ao inicializar sistema:', error)
        setIsInitialized(true)
      } finally {
        setIsLoading(false)
      }
    }

    initialize()
  }, [])

  // Fazer login
  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setIsLoading(true)
      
      const userData = await AuthService.verifyCredentials(email, password)
      if (userData) {
        setUser(userData)
        localStorage.setItem('auth_user', JSON.stringify(userData))
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao fazer login:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Fazer logout
  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_user')
  }

  // Atualizar dados do usuário
  const refreshUser = async () => {
    if (!user) return

    try {
      const users = await AuthService.listUsers()
      const updatedUser = users.find(u => u.id === user.id)
      if (updatedUser) {
        setUser(updatedUser)
        localStorage.setItem('auth_user', JSON.stringify(updatedUser))
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
    }
  }

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    isInitialized,
    login,
    logout,
    refreshUser
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
