import { useState } from 'react'
import { WasabiStorage } from '@/lib/wasabi'

interface UploadProgress {
  progress: number
  isUploading: boolean
  error?: string
  fileId?: string
  fileUrl?: string
}

export const useWasabiStorage = () => {
  const [uploadState, setUploadState] = useState<UploadProgress>({
    progress: 0,
    isUploading: false
  })

  const uploadFile = async (file: File, key?: string, bucketName?: string) => {
    setUploadState({
      progress: 0,
      isUploading: true,
      error: undefined
    })

    try {
      // Simular progresso de upload
      const progressInterval = setInterval(() => {
        setUploadState(prev => ({
          ...prev,
          progress: Math.min(prev.progress + 10, 90)
        }))
      }, 100)

      // Gerar chave única se não fornecida
      const fileKey = key || `uploads/${Date.now()}_${file.name}`
      
      // Usar API route para upload no servidor
      const formData = new FormData()
      formData.append('file', file)
      formData.append('key', fileKey)
      if (bucketName) {
        formData.append('bucketName', bucketName)
      }
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Erro no upload')
      }
      
      const result = await response.json()
      
      clearInterval(progressInterval)
      
      setUploadState({
        progress: 100,
        isUploading: false,
        fileId: result.fileId,
        fileUrl: result.fileUrl
      })

      return {
        fileId: result.fileId,
        fileUrl: result.fileUrl,
        response: result
      }
    } catch (error) {
      setUploadState({
        progress: 0,
        isUploading: false,
        error: error instanceof Error ? error.message : 'Erro no upload'
      })
      throw error
    }
  }

  const deleteFile = async (fileKey: string, bucketName?: string) => {
    try {
      await WasabiStorage.deleteFile(fileKey, bucketName)
      return true
    } catch (error) {
      console.error('Erro ao deletar arquivo:', error)
      throw error
    }
  }

  const getFileUrl = async (fileKey: string, bucketName?: string) => {
    return await WasabiStorage.getFileUrl(fileKey, bucketName)
  }

  const getPublicUrl = (fileKey: string, bucketName?: string) => {
    return WasabiStorage.getPublicUrl(fileKey, bucketName)
  }

  const resetUploadState = () => {
    setUploadState({
      progress: 0,
      isUploading: false
    })
  }

  return {
    uploadFile,
    deleteFile,
    getFileUrl,
    getPublicUrl,
    resetUploadState,
    uploadState
  }
}


