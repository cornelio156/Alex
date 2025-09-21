import { NextResponse } from 'next/server'
import { isWasabiConfigured } from '@/lib/wasabi'

export async function GET() {
  try {
    // Log das variáveis de ambiente para debug
    console.log('🔍 Verificando variáveis de ambiente do Wasabi:')
    console.log('WASABI_ACCESS_KEY_ID:', process.env.WASABI_ACCESS_KEY_ID ? '✅ Definida' : '❌ Não definida')
    console.log('WASABI_SECRET_ACCESS_KEY:', process.env.WASABI_SECRET_ACCESS_KEY ? '✅ Definida' : '❌ Não definida')
    console.log('WASABI_BUCKET_NAME:', process.env.WASABI_BUCKET_NAME || '❌ Não definida')
    console.log('WASABI_METADATA_BUCKET_NAME:', process.env.WASABI_METADATA_BUCKET_NAME || '❌ Não definida')
    console.log('WASABI_REGION:', process.env.WASABI_REGION || '❌ Não definida')
    console.log('WASABI_ENDPOINT:', process.env.WASABI_ENDPOINT || '❌ Não definida')
    
    const configured = isWasabiConfigured()
    console.log('🔍 Resultado da verificação:', configured ? '✅ Configurado' : '❌ Não configurado')
    
    return NextResponse.json({ 
      isConfigured: configured,
      message: configured ? 'Wasabi está configurado' : 'Wasabi não está configurado'
    })
  } catch (error) {
    console.error('Erro ao verificar configuração do Wasabi:', error)
    return NextResponse.json({ 
      isConfigured: false,
      message: 'Erro ao verificar configuração do Wasabi'
    }, { status: 500 })
  }
}
