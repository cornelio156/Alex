import { NextResponse } from 'next/server'
import { MetadataService } from '@/lib/metadata'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string; id: string }> }
) {
  try {
    const { type, id } = await params
    const data = await MetadataService.loadGenericMetadata(type, id === 'default' ? undefined : id)
    
    if (!data) {
      return NextResponse.json({ error: 'Metadata not found' }, { status: 404 })
    }
    
    return NextResponse.json(data)
  } catch (error) {
    console.error('Erro ao carregar metadados:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
