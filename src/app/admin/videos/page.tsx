'use client'

import { useState } from 'react'
import { Plus, Search, Trash2, Eye, DollarSign, Edit, Link as LinkIcon } from 'lucide-react'
import { useVideos } from '@/hooks/useVideos'
import { useWasabiStorage } from '@/hooks/useWasabiStorage'
import { VideoPlayer } from '@/components/VideoPlayer'

export default function VideoManagement() {
  const { videos, loading, error, addVideo, deleteVideo, updateVideo, refreshVideos, incrementViews } = useVideos()
  const { uploadFile, uploadState } = useWasabiStorage()

  const [searchTerm, setSearchTerm] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState<number | ''>('')
  const [file, setFile] = useState<File | null>(null)
  const [productLink, setProductLink] = useState('')
  
  // Estado para edição
  const [editingVideo, setEditingVideo] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDescription, setEditDescription] = useState('')
  const [editPrice, setEditPrice] = useState<number | ''>('')
  const [editStatus, setEditStatus] = useState<'published' | 'draft' | 'processing'>('published')
  const [editProductLink, setEditProductLink] = useState('')

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800'
      case 'draft':
        return 'bg-yellow-100 text-yellow-800'
      case 'processing':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreate = async () => {
    if (!file || !title || price === '' || Number(price) < 0) return
    try {
      const { fileId, fileUrl } = await uploadFile(file)
      await addVideo({
        title,
        description,
        price: Number(price),
        duration: '',
        uploadDate: new Date().toISOString(),
        status: 'published',
        views: 0,
        tags: [],
        videoFileId: fileId,
        videoUrl: fileUrl,
        productLink
      })
      setTitle('')
      setDescription('')
      setPrice('')
      setFile(null)
      setProductLink('')
      await refreshVideos()
    } catch (_e) {
      // erro já tratado no hook
    }
  }

  const handleStartEdit = (video: {
    id: string
    title: string
    description: string
    price: number
    status: 'published' | 'draft' | 'processing'
    productLink?: string
  }) => {
    setEditingVideo(video.id)
    setEditTitle(video.title)
    setEditDescription(video.description)
    setEditPrice(video.price)
    setEditStatus(video.status)
    setEditProductLink(video.productLink || '')
  }

  const handleSaveEdit = async () => {
    if (!editingVideo || !editTitle || editPrice === '') return
    try {
      await updateVideo(editingVideo, {
        title: editTitle,
        description: editDescription,
        price: Number(editPrice),
        status: editStatus,
        productLink: editProductLink
      })
      setEditingVideo(null)
      setEditTitle('')
      setEditDescription('')
      setEditPrice('')
      setEditStatus('published')
      setEditProductLink('')
      await refreshVideos()
    } catch (error) {
      console.error('Erro ao atualizar vídeo:', error)
    }
  }

  const handleCancelEdit = () => {
    setEditingVideo(null)
    setEditTitle('')
    setEditDescription('')
    setEditPrice('')
    setEditStatus('published')
    setEditProductLink('')
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'published':
        return 'Publicado'
      case 'draft':
        return 'Rascunho'
      case 'processing':
        return 'Processando'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <div>
      <div className="mb-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Gestão de Vídeos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie todos os vídeos da plataforma
            </p>
          </div>
          
        </div>
      </div>

      {/* Criar vídeo (upload sem thumbnail) */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="md:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">Arquivo de vídeo</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            {uploadState.isUploading && (
              <div className="mt-2 text-sm text-gray-500">Enviando... {uploadState.progress}%</div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Título do vídeo"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="Descrição (opcional)"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="number"
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="0.00"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Product Link</label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={productLink}
                onChange={(e) => setProductLink(e.target.value)}
                className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                placeholder="Link para o produto (após pagamento)"
              />
            </div>
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={handleCreate}
            disabled={!file || !title || price === '' || Number(price) < 0 || uploadState.isUploading}
            className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center"
          >
            <Plus className="w-5 h-5 mr-2" />
            Adicionar Vídeo
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar vídeos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de vídeos (com prévia sem thumbnail) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading && <div className="text-gray-500">Carregando...</div>}
        {error && <div className="text-red-600">{error}</div>}
        {!loading && !error && filteredVideos.map((video) => (
          <div key={video.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="relative">
              <VideoPlayer 
                src={video.videoUrl} 
                title={video.title}
                videoId={video.id}
                onPlay={() => incrementViews(video.id)}
              />
              {video.duration && (
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                {video.duration}
              </div>
              )}
            </div>
            
            <div className="p-4">
              <div className="flex items-start justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 line-clamp-2">{video.title}</h3>
                <span className={`${getStatusColor(video.status)} px-2 py-1 rounded-full text-xs font-medium`}>
                  {getStatusText(video.status)}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
              
              <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                <span>{video.views || 0} visualizações</span>
                {video.uploadDate && <span>{new Date(video.uploadDate).toLocaleDateString('pt-BR')}</span>}
              </div>
              {typeof video.price === 'number' && (
                <div className="text-sm font-medium text-gray-900 mb-3">Preço: R$ {video.price.toFixed(2)}</div>
              )}
              {video.productLink && (
                <div className="text-sm text-gray-500 mb-3">
                  <LinkIcon className="w-4 h-4 mr-1 inline-block" /> {video.productLink}
                </div>
              )}
              
              <div className="flex gap-2">
                <a
                  href={video.videoUrl}
                  target="_blank"
                  className="flex-1 bg-primary-600 hover:bg-primary-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Abrir
                </a>
                <button
                  onClick={() => handleStartEdit(video)}
                  className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => deleteVideo(video.id)}
                  className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Edição */}
      {editingVideo && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold mb-4">Editar Vídeo</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Preço</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={editPrice || ''}
                    onChange={(e) => setEditPrice(e.target.value ? Number(e.target.value) : '')}
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={editStatus}
                  onChange={(e) => setEditStatus(e.target.value as 'published' | 'draft' | 'processing')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="published">Publicado</option>
                  <option value="draft">Rascunho</option>
                  <option value="processing">Processando</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Product Link</label>
                <div className="relative">
                  <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={editProductLink}
                    onChange={(e) => setEditProductLink(e.target.value)}
                    className="pl-8 w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Link para o produto (após pagamento)"
                  />
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={!editTitle || editPrice === ''}
                className="flex-1 bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Salvar
              </button>
              <button
                onClick={handleCancelEdit}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
