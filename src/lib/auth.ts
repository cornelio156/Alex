// Sistema de autenticação simples baseado em JSON
export interface User {
  id: string
  email: string
  name: string
  password: string
  role: 'admin' | 'user'
  createdAt: string
  lastLogin?: string
}

export interface AuthConfig {
  users: User[]
  sessionTimeout: number // em minutos
  maxLoginAttempts: number
}

export class AuthService {
  private static readonly AUTH_CONFIG_KEY = 'auth-config'
  
  // Usuário padrão do sistema
  static get defaultAdmin(): User {
    return {
      id: 'admin_001',
      email: 'admin@gmail.com',
      name: 'Administrador',
      password: 'admin123', // Em produção, isso deveria ser hash
      role: 'admin',
      createdAt: new Date().toISOString()
    }
  }

  // Configuração padrão de autenticação
  static get defaultAuthConfig(): AuthConfig {
    return {
      users: [this.defaultAdmin],
      sessionTimeout: 60, // 1 hora
      maxLoginAttempts: 5
    }
  }

  // Inicializar sistema de autenticação
  static async initializeAuth(): Promise<AuthConfig> {
    try {
      // Tentar carregar configuração existente
      const existingConfig = await this.loadAuthConfig()
      if (existingConfig) {
        return existingConfig
      }

      // Se não existir, criar configuração padrão
      const defaultConfig = this.defaultAuthConfig
      await this.saveAuthConfig(defaultConfig)
      return defaultConfig
    } catch (error) {
      console.error('Erro ao inicializar sistema de autenticação:', error)
      // Retornar configuração padrão em caso de erro
      return this.defaultAuthConfig
    }
  }

  // Carregar configuração de autenticação
  static async loadAuthConfig(): Promise<AuthConfig | null> {
    try {
      const { MetadataService } = await import('./metadata')
      const config = await MetadataService.loadGenericMetadata<AuthConfig>('auth', 'config')
      return config
    } catch (error) {
      console.error('Erro ao carregar configuração de autenticação:', error)
      return null
    }
  }

  // Salvar configuração de autenticação
  static async saveAuthConfig(config: AuthConfig): Promise<void> {
    try {
      const { MetadataService } = await import('./metadata')
      await MetadataService.saveGenericMetadata('auth', config, 'config')
    } catch (error) {
      console.error('Erro ao salvar configuração de autenticação:', error)
      throw error
    }
  }

  // Verificar credenciais
  static async verifyCredentials(email: string, password: string): Promise<User | null> {
    try {
      const config = await this.loadAuthConfig()
      if (!config) {
        return null
      }

      const user = config.users.find(u => u.email === email && u.password === password)
      if (user) {
        // Atualizar último login
        user.lastLogin = new Date().toISOString()
        await this.saveAuthConfig(config)
        return user
      }

      return null
    } catch (error) {
      console.error('Erro ao verificar credenciais:', error)
      return null
    }
  }

  // Adicionar novo usuário
  static async addUser(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    try {
      const config = await this.loadAuthConfig()
      if (!config) {
        throw new Error('Configuração de autenticação não encontrada')
      }

      const newUser: User = {
        ...user,
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        createdAt: new Date().toISOString()
      }

      config.users.push(newUser)
      await this.saveAuthConfig(config)
      return newUser
    } catch (error) {
      console.error('Erro ao adicionar usuário:', error)
      throw error
    }
  }

  // Atualizar usuário
  static async updateUser(userId: string, updates: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User | null> {
    try {
      const config = await this.loadAuthConfig()
      if (!config) {
        return null
      }

      const userIndex = config.users.findIndex(u => u.id === userId)
      if (userIndex === -1) {
        return null
      }

      config.users[userIndex] = { ...config.users[userIndex], ...updates }
      await this.saveAuthConfig(config)
      return config.users[userIndex]
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error)
      return null
    }
  }

  // Deletar usuário
  static async deleteUser(userId: string): Promise<boolean> {
    try {
      const config = await this.loadAuthConfig()
      if (!config) {
        return false
      }

      config.users = config.users.filter(u => u.id !== userId)
      await this.saveAuthConfig(config)
      return true
    } catch (error) {
      console.error('Erro ao deletar usuário:', error)
      return false
    }
  }

  // Listar usuários
  static async listUsers(): Promise<User[]> {
    try {
      const config = await this.loadAuthConfig()
      return config?.users || []
    } catch (error) {
      console.error('Erro ao listar usuários:', error)
      return []
    }
  }
}
