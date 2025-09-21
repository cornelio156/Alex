import { NextRequest, NextResponse } from 'next/server'
import { MetadataService } from '@/lib/metadata'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🎬 Carregando vídeo:', id)
    
    const video = await MetadataService.loadVideo(id)
    
    if (!video) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }
    
    return NextResponse.json({ 
      success: true,
      video 
    })
  } catch (error) {
    console.error('❌ Erro ao carregar vídeo:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao carregar vídeo'
    }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const updates = await request.json()
    
    console.log('🎬 Atualizando vídeo:', id)
    
    const existing = await MetadataService.loadVideo(id)
    if (!existing) {
      return NextResponse.json({ error: 'Vídeo não encontrado' }, { status: 404 })
    }

    const updatedVideo = {
      ...existing,
      ...updates
    }

    await MetadataService.saveVideo(updatedVideo)
    
    console.log('✅ Vídeo atualizado com sucesso')
    
    return NextResponse.json({ 
      success: true,
      video: updatedVideo
    })
  } catch (error) {
    console.error('❌ Erro ao atualizar vídeo:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar vídeo'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    console.log('🎬 Deletando vídeo:', id)
    
    const success = await MetadataService.deleteVideo(id)
    
    if (!success) {
      return NextResponse.json({ error: 'Erro ao deletar vídeo' }, { status: 500 })
    }
    
    console.log('✅ Vídeo deletado com sucesso')
    
    return NextResponse.json({ 
      success: true
    })
  } catch (error) {
    console.error('❌ Erro ao deletar vídeo:', error)
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao deletar vídeo'
    }, { status: 500 })
  }
}
