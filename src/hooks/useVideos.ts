import { useState, useEffect } from 'react'
import { MetadataService, VideoMetadata } from '@/lib/metadata'
import { Video } from '@/types/video'
import { useWasabiConfig } from '@/context/WasabiConfigContext'

interface UseVideosReturn {
  videos: Video[]
  loading: boolean
  error: string | null
  addVideo: (video: Omit<Video, 'id'>) => Promise<void>
  updateVideo: (id: string, updates: Partial<Video>) => Promise<void>
  deleteVideo: (id: string) => Promise<void>
  refreshVideos: () => Promise<void>
  incrementViews: (id: string) => Promise<void>
}

export const useVideos = (): UseVideosReturn => {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { isConfigured: isWasabiConfigured, loading: wasabiConfigLoading } = useWasabiConfig()

  // Load videos from Wasabi via API
  const loadVideos = async () => {
    try {
      setLoading(true)
      setError(null)

      console.log('🎬 Loading videos from Wasabi via API...')

      const response = await fetch('/api/videos')
      
      if (!response.ok) {
        throw new Error('Erro ao carregar vídeos')
      }
      
      const data = await response.json()
      
      if (!data.success) {
        throw new Error(data.error || 'Erro ao carregar vídeos')
      }

      console.log('📋 Videos loaded from API:', data.videos.length)

      // Filtrar apenas vídeos publicados e ordenar por data de upload
      const publishedVideos = data.videos
        .filter((metadata: any) => metadata.status === 'published')
        .sort((a: any, b: any) => new Date(b.uploadDate || '').getTime() - new Date(a.uploadDate || '').getTime())

      const loaded: Video[] = publishedVideos.map((metadata: any) => ({
        id: metadata.id,
        title: metadata.title,
        description: metadata.description,
        price: metadata.price,
        duration: metadata.duration,
        uploadDate: metadata.uploadDate,
        status: metadata.status,
        views: metadata.views || 0,
        tags: metadata.tags || [],
        videoFileId: metadata.videoFileKey,
        videoUrl: metadata.videoUrl,
        fileSize: metadata.fileSize,
        mimeType: metadata.mimeType,
        productLink: metadata.productLink
      }))

      setVideos(loaded)
    } catch (e) {
      console.error('❌ Error in loadVideos:', e)
      setError(e instanceof Error ? e.message : 'Failed to load videos')
    } finally {
      setLoading(false)
    }
  }

  // Add new video
  const addVideo = async (videoData: Omit<Video, 'id'>) => {
    try {
      const id = `video_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`

      const metadata: VideoMetadata = {
        id,
        title: videoData.title,
        description: videoData.description,
        price: videoData.price,
        duration: videoData.duration,
        uploadDate: videoData.uploadDate || new Date().toISOString(),
        status: videoData.status,
        views: videoData.views || 0,
        tags: videoData.tags || [],
        videoFileKey: videoData.videoFileId,
        videoUrl: videoData.videoUrl,
        fileSize: videoData.fileSize,
        mimeType: videoData.mimeType,
        productLink: videoData.productLink
      }

      // Salvar via API no servidor
      const response = await fetch('/api/videos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(metadata)
      })

      if (!response.ok) {
        throw new Error('Erro ao salvar vídeo')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao salvar vídeo')
      }

      const newVideo: Video = {
        id,
        ...videoData
      }

      setVideos(prev => [newVideo, ...prev])
    } catch (err) {
      console.error('Error adding video:', err)
      throw err
    }
  }

  // Update video
  const updateVideo = async (id: string, updates: Partial<Video>) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      })

      if (!response.ok) {
        throw new Error('Erro ao atualizar vídeo')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar vídeo')
      }

      setVideos(prev => prev.map(video => 
        video.id === id ? { ...video, ...updates } : video
      ))
    } catch (err) {
      console.error('Error updating video:', err)
      throw err
    }
  }

  // Delete video
  const deleteVideo = async (id: string) => {
    try {
      const response = await fetch(`/api/videos/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        throw new Error('Erro ao deletar vídeo')
      }

      const result = await response.json()
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao deletar vídeo')
      }

      setVideos(prev => prev.filter(v => v.id !== id))
    } catch (err) {
      console.error('Error deleting video:', err)
      throw err
    }
  }

  const incrementViews = async (id: string) => {
    try {
      await updateVideo(id, { views: (videos.find(v => v.id === id)?.views || 0) + 1 })
    } catch (_e) {}
  }

  useEffect(() => {
    // Só carregar vídeos se o Wasabi estiver configurado
    if (!wasabiConfigLoading && isWasabiConfigured) {
      loadVideos()
    } else if (!wasabiConfigLoading && !isWasabiConfigured) {
      // Se o Wasabi não estiver configurado, definir loading como false
      setLoading(false)
    }
  }, [wasabiConfigLoading, isWasabiConfigured])

  const refreshVideos = loadVideos

  return {
    videos,
    loading,
    error,
    addVideo,
    updateVideo,
    deleteVideo,
    refreshVideos,
    incrementViews
  }
}
