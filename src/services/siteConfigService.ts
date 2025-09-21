import { MetadataService, SiteConfigMetadata } from '@/lib/metadata'
import { SiteConfig } from '@/types/video'

/**
 * Service responsável por carregar e salvar a configuração do site no Wasabi
 */
export class SiteConfigService {
  static get defaultConfig(): SiteConfig {
    return {
      telegramUsername: 'alexchannel',
      siteName: 'VipAcess',
      description: 'Exclusive Premium Content +18',
      paypalClientId: '',
      paypalEnvironment: 'sandbox'
    }
  }

  static async getConfig(): Promise<SiteConfig> {
    try {
      const config = await MetadataService.loadSiteConfig()
      if (config) {
        return {
          telegramUsername: config.telegramUsername,
          siteName: config.siteName,
          description: config.description,
          paypalClientId: config.paypalClientId,
          paypalEnvironment: config.paypalEnvironment
        }
      }
      // Caso não exista, retorna default (admin poderá salvar depois)
      return this.defaultConfig
    } catch (_error) {
      // Caso não exista, retorna default (admin poderá salvar depois)
      return this.defaultConfig
    }
  }

  static async updateConfig(partial: Partial<SiteConfig>): Promise<SiteConfig> {
    try {
      const existing = await this.getConfig()
      const data: SiteConfig = { ...existing, ...partial }
      
      // Converter para o formato de metadados
      const metadata: SiteConfigMetadata = {
        telegramUsername: data.telegramUsername,
        siteName: data.siteName,
        description: data.description,
        paypalClientId: data.paypalClientId,
        paypalEnvironment: data.paypalEnvironment
      }
      
      await MetadataService.saveSiteConfig(metadata)
      return data
    } catch (_error) {
      throw _error
    }
  }
}


