import { NextResponse } from 'next/server'
import { WasabiStorage } from '@/lib/wasabi'

export async function GET() {
  try {
    console.log('📁 Listando arquivos do bucket...')
    
    // Listar arquivos do bucket de metadados
    const metadataFiles = await WasabiStorage.listFiles('', 'alex-site-metadata')
    
    console.log('📊 Arquivos encontrados no bucket de metadados:', metadataFiles.files?.length || 0)
    
    return NextResponse.json({ 
      success: true,
      metadataFiles: metadataFiles.files || [],
      count: metadataFiles.files?.length || 0
    })
  } catch (error) {
    console.error('❌ Erro ao listar arquivos do bucket:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 500 })
  }
}
