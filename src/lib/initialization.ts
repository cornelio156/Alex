import { MetadataService } from './metadata'
import { AuthService } from './auth'
import { SiteConfigService } from '@/services/siteConfigService'

export interface InitializationStatus {
  isInitialized: boolean
  initializedAt?: string
  version: string
  components: {
    auth: boolean
    siteConfig: boolean
    metadata: boolean
  }
}

export class InitializationService {
  private static readonly INIT_STATUS_KEY = 'init-status'
  private static readonly VERSION = '1.0.0'

  // Verificar se o sistema já foi inicializado
  static async isInitialized(): Promise<boolean> {
    try {
      const status = await this.getInitializationStatus()
      return status.isInitialized
    } catch (error) {
      console.error('Erro ao verificar status de inicialização:', error)
      return false
    }
  }

  // Obter status de inicialização
  static async getInitializationStatus(): Promise<InitializationStatus> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, usar localStorage como fallback
        const savedStatus = localStorage.getItem('init-status')
        if (savedStatus) {
          try {
            return JSON.parse(savedStatus)
          } catch (error) {
            console.error('Erro ao parsear status salvo:', error)
          }
        }
        
        // Status padrão se não existir
        return {
          isInitialized: false,
          version: this.VERSION,
          components: {
            auth: false,
            siteConfig: false,
            metadata: false
          }
        }
      } else {
        // No servidor, usar Wasabi
        const status = await MetadataService.loadGenericMetadata<InitializationStatus>('system', 'init-status')
        if (status) {
          return status
        }

        // Status padrão se não existir
        return {
          isInitialized: false,
          version: this.VERSION,
          components: {
            auth: false,
            siteConfig: false,
            metadata: false
          }
        }
      }
    } catch (error) {
      console.error('Erro ao obter status de inicialização:', error)
      
      // Se o erro for de configuração do Wasabi, retornar status padrão
      if (error instanceof Error && error.message.includes('Wasabi não está configurado')) {
        console.warn('Wasabi não configurado, retornando status padrão de inicialização')
        return {
          isInitialized: false,
          version: this.VERSION,
          components: {
            auth: false,
            siteConfig: false,
            metadata: false
          }
        }
      }
      
      return {
        isInitialized: false,
        version: this.VERSION,
        components: {
          auth: false,
          siteConfig: false,
          metadata: false
        }
      }
    }
  }

  // Salvar status de inicialização
  static async saveInitializationStatus(status: InitializationStatus): Promise<void> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, salvar no localStorage
        localStorage.setItem('init-status', JSON.stringify(status))
      } else {
        // No servidor, salvar no Wasabi
        await MetadataService.saveGenericMetadata('system', status, 'init-status')
      }
    } catch (error) {
      console.error('Erro ao salvar status de inicialização:', error)
      throw error
    }
  }

  // Inicializar sistema completo
  static async initializeSystem(): Promise<InitializationStatus> {
    console.log('🚀 Inicializando sistema...')
    
    const status: InitializationStatus = {
      isInitialized: false,
      version: this.VERSION,
      components: {
        auth: false,
        siteConfig: false,
        metadata: false
      }
    }

    try {
      // 1. Inicializar sistema de autenticação
      console.log('📝 Inicializando sistema de autenticação...')
      await AuthService.initializeAuth()
      status.components.auth = true
      console.log('✅ Sistema de autenticação inicializado')

      // 2. Inicializar configuração do site
      console.log('⚙️ Inicializando configuração do site...')
      await this.initializeSiteConfig()
      status.components.siteConfig = true
      console.log('✅ Configuração do site inicializada')

      // 3. Verificar sistema de metadados
      console.log('📊 Verificando sistema de metadados...')
      await this.verifyMetadataSystem()
      status.components.metadata = true
      console.log('✅ Sistema de metadados verificado')

      // 4. Marcar como inicializado
      status.isInitialized = true
      status.initializedAt = new Date().toISOString()
      await this.saveInitializationStatus(status)

      console.log('🎉 Sistema inicializado com sucesso!')
      
      return status
    } catch (error) {
      console.error('❌ Erro durante inicialização:', error)
      await this.saveInitializationStatus(status)
      throw error
    }
  }

  // Inicializar configuração do site
  private static async initializeSiteConfig(): Promise<void> {
    try {
      // Verificar se já existe configuração
      const existingConfig = await SiteConfigService.getConfig()
      
      // Se não existe ou é a configuração padrão, criar uma nova
      if (!existingConfig || existingConfig.telegramUsername === 'alexchannel') {
        const defaultConfig = {
          telegramUsername: 'alexchannel',
          siteName: 'VipAcess',
          description: 'Exclusive Premium Content +18',
          paypalClientId: '',
          paypalEnvironment: 'sandbox' as const
        }
        
        await SiteConfigService.updateConfig(defaultConfig)
        console.log('📋 Configuração padrão do site criada')
      }
    } catch (error) {
      console.error('Erro ao inicializar configuração do site:', error)
      throw error
    }
  }

  // Verificar sistema de metadados
  private static async verifyMetadataSystem(): Promise<void> {
    try {
      // Verificar se estamos no cliente ou servidor
      if (typeof window !== 'undefined') {
        // No cliente, apenas verificar se o localStorage está funcionando
        const testData = { test: true, timestamp: new Date().toISOString() }
        const testKey = 'metadata_test'
        
        try {
          localStorage.setItem(testKey, JSON.stringify(testData))
          const loadedData = JSON.parse(localStorage.getItem(testKey) || '{}')
          localStorage.removeItem(testKey)
          
          if (!loadedData || loadedData.test !== true) {
            throw new Error('Sistema de metadados não está funcionando corretamente')
          }
        } catch (error) {
          console.error('Erro ao testar localStorage:', error)
          throw new Error('Sistema de metadados não está funcionando corretamente')
        }
      } else {
        // No servidor, testar com Wasabi
        const testData = { test: true, timestamp: new Date().toISOString() }
        await MetadataService.saveGenericMetadata('system', testData, 'test')
        const loadedData = await MetadataService.loadGenericMetadata('system', 'test')
        
        if (!loadedData || (loadedData as { test: boolean }).test !== true) {
          throw new Error('Sistema de metadados não está funcionando corretamente')
        }

        // Limpar dados de teste
        await MetadataService.deleteMetadata('system', 'test')
      }
    } catch (error) {
      console.error('Erro ao verificar sistema de metadados:', error)
      throw error
    }
  }

  // Resetar sistema (para desenvolvimento)
  static async resetSystem(): Promise<void> {
    console.log('🔄 Resetando sistema...')
    
    try {
      // Deletar status de inicialização
      await MetadataService.deleteMetadata('system', 'init-status')
      
      // Deletar configuração de autenticação
      await MetadataService.deleteMetadata('auth', 'config')
      
      // Deletar configuração do site
      await MetadataService.deleteMetadata('site-config', 'main')
      
      console.log('✅ Sistema resetado com sucesso')
    } catch (error) {
      console.error('Erro ao resetar sistema:', error)
      throw error
    }
  }

  // Verificar e inicializar se necessário
  static async ensureInitialized(): Promise<boolean> {
    try {
      const isInit = await this.isInitialized()
      
      if (!isInit) {
        console.log('🔧 Sistema não inicializado. Iniciando...')
        await this.initializeSystem()
        return true
      }
      
      return false
    } catch (error) {
      console.error('Erro ao verificar inicialização:', error)
      return false
    }
  }
}
