import { NextResponse } from 'next/server'
import { MetadataService } from '@/lib/metadata'

export async function GET() {
  try {
    console.log('🎬 Carregando vídeos do Wasabi...')
    
    const videos = await MetadataService.listVideos()
    
    console.log(`📊 ${videos.length} vídeos encontrados`)
    
    return NextResponse.json({ 
      success: true,
      videos 
    })
  } catch (error) {
    console.error('❌ Erro ao carregar vídeos:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao carregar vídeos'
    }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const videoData = await request.json()
    
    console.log('🎬 Salvando vídeo no Wasabi:', videoData.title)
    
    const video = await MetadataService.saveVideo(videoData)
    
    console.log('✅ Vídeo salvo com sucesso:', video)
    
    return NextResponse.json({ 
      success: true,
      videoId: video
    })
  } catch (error) {
    console.error('❌ Erro ao salvar vídeo:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao salvar vídeo'
    }, { status: 500 })
  }
}
