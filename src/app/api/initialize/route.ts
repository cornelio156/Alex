import { NextResponse } from 'next/server'
import { InitializationService } from '@/lib/initialization'

export async function POST() {
  try {
    console.log('🚀 Iniciando inicialização do sistema via API...')
    
    // Inicializar sistema no servidor (que tem acesso ao Wasabi)
    const status = await InitializationService.initializeSystem()
    
    console.log('✅ Sistema inicializado com sucesso via API')
    console.log('📊 Status:', status)
    
    return NextResponse.json({ 
      success: true, 
      message: 'Sistema inicializado com sucesso',
      status 
    })
  } catch (error) {
    console.error('❌ Erro ao inicializar sistema via API:', error)
    return NextResponse.json({ 
      success: false, 
      message: 'Erro ao inicializar sistema',
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}

export async function GET() {
  try {
    // Verificar status de inicialização
    const isInitialized = await InitializationService.isInitialized()
    const status = await InitializationService.getInitializationStatus()
    
    return NextResponse.json({ 
      isInitialized,
      status 
    })
  } catch (error) {
    console.error('❌ Erro ao verificar status de inicialização:', error)
    return NextResponse.json({ 
      isInitialized: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
