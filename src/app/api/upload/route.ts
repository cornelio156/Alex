import { NextRequest, NextResponse } from 'next/server'
import { WasabiStorage } from '@/lib/wasabi'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const key = formData.get('key') as string
    const bucketName = formData.get('bucketName') as string || 'alex-site-storage'

    if (!file) {
      return NextResponse.json({ error: 'Nenhum arquivo fornecido' }, { status: 400 })
    }

    if (!key) {
      return NextResponse.json({ error: 'Chave do arquivo não fornecida' }, { status: 400 })
    }

    console.log('📤 Iniciando upload de arquivo:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      key,
      bucketName
    })

    // Upload do arquivo para o Wasabi
    const response = await WasabiStorage.uploadFile(file, key, bucketName)
    
    // Obter URL do arquivo
    const fileUrl = await WasabiStorage.getFileUrl(key, bucketName)

    console.log('✅ Upload concluído com sucesso:', {
      fileId: response.$id,
      fileUrl
    })

    return NextResponse.json({
      success: true,
      fileId: response.$id,
      fileUrl,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type
    })
  } catch (error) {
    console.error('❌ Erro no upload:', error)
    return NextResponse.json({ 
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido no upload'
    }, { status: 500 })
  }
}
