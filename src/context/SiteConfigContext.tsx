'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { SiteConfig } from '@/types/video'
import { SiteConfigService } from '@/services/siteConfigService'
import { useWasabiConfig } from './WasabiConfigContext'

interface SiteConfigContextType {
  config: SiteConfig
  updateConfig: (newConfig: Partial<SiteConfig>) => void
}

const SiteConfigContext = createContext<SiteConfigContextType | undefined>(undefined)

export const useSiteConfig = () => {
  const context = useContext(SiteConfigContext)
  if (!context) {
    throw new Error('useSiteConfig deve ser usado dentro de um SiteConfigProvider')
  }
  return context
}

interface SiteConfigProviderProps {
  children: ReactNode
}

export const SiteConfigProvider = ({ children }: SiteConfigProviderProps) => {
  const [config, setConfig] = useState<SiteConfig>(SiteConfigService.defaultConfig)
  const [_loading, setLoading] = useState(true)
  const { isConfigured: isWasabiConfigured, loading: wasabiConfigLoading } = useWasabiConfig()

  useEffect(() => {
    const load = async () => {
      // Só carregar configuração se o Wasabi estiver configurado
      if (!wasabiConfigLoading && isWasabiConfigured) {
        const remote = await SiteConfigService.getConfig()
        setConfig(remote)
      } else if (!wasabiConfigLoading && !isWasabiConfigured) {
        // Se o Wasabi não estiver configurado, usar configuração padrão
        setConfig(SiteConfigService.defaultConfig)
      }
      setLoading(false)
    }
    load()
  }, [wasabiConfigLoading, isWasabiConfigured])

  const updateConfig = (newConfig: Partial<SiteConfig>) => {
    const updatedConfig = { ...config, ...newConfig }
    setConfig(updatedConfig)
    // Persistir no Wasabi (não aguarda bloqueando a UI)
    SiteConfigService.updateConfig(newConfig).catch(() => {})
  }

  const value: SiteConfigContextType = {
    config,
    updateConfig
  }

  return (
    <SiteConfigContext.Provider value={value}>
      {children}
    </SiteConfigContext.Provider>
  )
}
