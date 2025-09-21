'use client'
import { useState, useEffect } from 'react'
import { Eye, Clock, Play, MessageCircle, CreditCard, DollarSign, User, Calendar, AlertTriangle, Settings } from 'lucide-react'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { usePaymentProofs } from '@/context/PaymentProofContext'
import { useWasabiConfig } from '@/context/WasabiConfigContext'
import { VideoPlayer } from '@/components/VideoPlayer'
import { useVideos } from '@/hooks/useVideos'
// Removed Appwrite import - now using Wasabi
import ImageModal from '@/components/ImageModal'
import { PaymentOptions } from '@/components/PaymentOptions'
import { PaymentNotification } from '@/components/PaymentNotification'

export default function Home() {
  const { config } = useSiteConfig()
  const { videos, loading: videosLoading, error: videosError, incrementViews } = useVideos()
  const { confirmedProofs } = usePaymentProofs()
  const { isConfigured: isWasabiConfigured, loading: wasabiConfigLoading } = useWasabiConfig()
  
  // Modal state for image amplification
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    imageUrl: string
  }>({
    isOpen: false,
    imageUrl: ''
  })

  // Payment notification state
  const [paymentNotification, setPaymentNotification] = useState<{
    isVisible: boolean
    type: 'success' | 'error' | 'info'
    message: string
  }>({
    isVisible: false,
    type: 'info',
    message: ''
  })

  const openImageModal = (imageUrl: string) => {
    setModalState({
      isOpen: true,
      imageUrl
    })
  }

  const closeImageModal = () => {
    setModalState({
      isOpen: false,
      imageUrl: ''
    })
  }

  const showPaymentNotification = (type: 'success' | 'error' | 'info', message: string) => {
    setPaymentNotification({
      isVisible: true,
      type,
      message
    })
  }

  const hidePaymentNotification = () => {
    setPaymentNotification({
      isVisible: false,
      type: 'info',
      message: ''
    })
  }

  const isConfigured = isWasabiConfigured

  const formatViews = (views: number) => {
    if (views >= 1000000) {
      return `${(views / 1000000).toFixed(1)}M`
    } else if (views >= 1000) {
      return `${(views / 1000).toFixed(1)}K`
    }
    return views.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value)
  }

  const handleTelegramClick = () => {
    window.open(`https://t.me/${config.telegramUsername}`, '_blank')
  }

  

  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Age Warning */}
      <div className="bg-red-600 text-white text-center py-2 text-sm">
        ⚠️ ADULT CONTENT +18 - Site exclusively for adults over 18 years old
      </div>

      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-600">{config.siteName}</h1>
              <span className="ml-2 bg-red-100 text-red-800 px-2 py-1 rounded-full text-xs font-medium">
                +18
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleTelegramClick}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Telegram
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {config.description}
          </h1>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-red-800 font-medium mb-2">🔞 IMPORTANT NOTICE</p>
            <p className="text-red-700 text-sm">
              This site contains adult material intended exclusively for people over 18 years old. 
              By continuing, you confirm that you are over 18 years old.
            </p>
          </div>
          <p className="text-lg text-gray-600 mb-6">
            Exclusive premium content - Contact via Telegram
          </p>
          <button
            onClick={handleTelegramClick}
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact on Telegram
          </button>
        </div>

        {/* Videos Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Videos</h2>
          
          {/* Loading state during configuration check */}
          {wasabiConfigLoading && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando...</p>
            </div>
          )}

          {/* Appwrite não configurado */}
          {!wasabiConfigLoading && !isConfigured && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-yellow-100 p-3 rounded-full">
                  <Settings className="w-8 h-8 text-yellow-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-yellow-800 mb-2">
                Sistema em Configuração
              </h3>
              <p className="text-yellow-700 mb-4">
                O sistema de gerenciamento de conteúdo ainda não foi configurado. 
                Entre em contato via Telegram para saber mais sobre o conteúdo disponível.
              </p>
              <button
                onClick={handleTelegramClick}
                className="bg-yellow-600 hover:bg-yellow-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact on Telegram
              </button>
            </div>
          )}

          {/* Appwrite configurado mas carregando */}
          {!wasabiConfigLoading && isConfigured && videosLoading && (
            <div className="bg-gray-50 rounded-xl p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando vídeos...</p>
            </div>
          )}

          {/* Erro ao carregar vídeos */}
          {!wasabiConfigLoading && isConfigured && videosError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-red-100 p-3 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-red-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-red-800 mb-2">
                Erro ao Carregar Conteúdo
              </h3>
              <p className="text-red-700 mb-4">
                Houve um problema ao carregar os vídeos. Entre em contato via Telegram.
              </p>
              <button
                onClick={handleTelegramClick}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact on Telegram
              </button>
            </div>
          )}

          {/* Nenhum vídeo disponível */}
          {!wasabiConfigLoading && isConfigured && !videosLoading && !videosError && videos.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-blue-100 p-3 rounded-full">
                  <Play className="w-8 h-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-blue-800 mb-2">
                Conteúdo em Breve
              </h3>
              <p className="text-blue-700 mb-4">
                Novos vídeos exclusivos serão adicionados em breve. 
                Entre em contato via Telegram para saber mais.
              </p>
              <button
                onClick={handleTelegramClick}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact on Telegram
              </button>
            </div>
          )}

                    {/* Available Videos */}
          {!wasabiConfigLoading && isConfigured && !videosLoading && !videosError && videos.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {videos.map((video) => (
                <div key={video.id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow overflow-hidden video-card">
                  {/* Video Player */}
                  <div className="relative">
                    {video.videoUrl ? (
                      <VideoPlayer
                        src={video.videoUrl}
                        title={video.title}
                        className="w-full"
                        autoPlay={false}
                        controls={true}
                        videoId={video.id}
                        onPlay={() => incrementViews(video.id)}
                      />
                    ) : (
                      <div className="w-full aspect-video bg-gray-200 flex items-center justify-center">
                        <div className="text-gray-500 text-center">
                          <Play size={48} className="mx-auto mb-2 opacity-50" />
                          <p className="text-sm">Video not available</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Duration Badge */}
                    {video.duration && (
                      <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-sm">
                        {video.duration}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                      {video.title}
                    </h3>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {video.description}
                    </p>

                    {/* Price */}
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-2xl font-bold text-blue-600">
                        {formatCurrency(video.price)}
                      </span>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center">
                          <Eye size={16} className="mr-1" />
                          {formatViews(video.views || 0)}
                        </div>
                        {video.duration && (
                          <div className="flex items-center">
                            <Clock size={16} className="mr-1" />
                            {video.duration}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tags */}
                    {video.tags && video.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {video.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Payment Options */}
                    <PaymentOptions
                  video={video}
                        onSuccess={() => {
                          showPaymentNotification('success', 'Pagamento realizado com sucesso! Redirecionando para o Telegram...')
                        }}
                        onError={(error) => {
                          showPaymentNotification('error', `Erro no pagamento: ${error}`)
                        }}
                      />
                    
                    {video.uploadDate && (
                      <div className="mt-3 text-center text-sm text-gray-500">
                        📅 {formatDate(video.uploadDate)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Payment Proofs Section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Payment Confirmations</h2>
          
          {confirmedProofs.length > 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Recent Payments</h3>
                <p className="text-gray-600">
                  See recent payment confirmations from satisfied customers
                </p>
              </div>
              
              {/* Payment Proofs Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {confirmedProofs.map((proof) => (
                  <div key={proof.$id} className="bg-gray-50 rounded-lg p-6 border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className="bg-green-100 p-2 rounded-full">
                        <CreditCard className="w-5 h-5 text-green-600" />
                      </div>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Confirmed
                      </span>
                    </div>
                    
                    {/* Payment Details */}
                    <div className="mb-4 space-y-2">
                      {proof.amount && (
                        <div className="flex items-center text-sm text-gray-700">
                          <DollarSign className="w-4 h-4 mr-2 text-green-600" />
                          <span className="font-medium">{formatCurrency(proof.amount)}</span>
                        </div>
                      )}
                      
                      {proof.customerName && (
                        <div className="flex items-center text-sm text-gray-700">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          <span>{proof.customerName}</span>
                        </div>
                      )}
                      
                      {proof.paymentDate && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Calendar className="w-4 h-4 mr-2 text-purple-600" />
                          <span>{formatDate(proof.paymentDate)}</span>
                        </div>
                      )}
                    </div>
                    
                    {/* Payment Screenshot */}
                    {proof.imageUrl && (
                      <div className="mt-4">
                        <img
                          src={proof.imageUrl}
                          alt="Payment proof"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
                          onClick={() => openImageModal(proof.imageUrl)}
                          onError={(e) => {
                            // Fallback para quando a imagem não carregar
                            const target = e.target as HTMLImageElement
                            target.style.display = 'none'
                            const fallback = document.createElement('div')
                            fallback.className = 'w-full h-48 bg-gray-200 rounded-lg border border-gray-200 flex items-center justify-center'
                            fallback.innerHTML = '<span class="text-gray-500 text-sm">Payment Screenshot</span>'
                            target.parentNode?.appendChild(fallback)
                          }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-8 text-center">
              <div className="flex justify-center mb-4">
                <div className="bg-gray-100 p-3 rounded-full">
                  <CreditCard className="w-8 h-8 text-gray-400" />
                </div>
            </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                Nenhuma Prova de Pagamento
              </h3>
              <p className="text-gray-600 mb-4">
                As confirmações de pagamento de clientes satisfeitos aparecerão aqui.
                Entre em contato via Telegram para saber mais sobre nossos serviços.
              </p>
              <button
                onClick={handleTelegramClick}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Contact on Telegram
              </button>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Want to access more premium content?
          </h2>
          <p className="text-gray-600 mb-4">
            Contact on Telegram to get access to exclusive and personalized content
          </p>
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-6">
            <p className="text-red-700 text-sm">
              🔞 Only for adults over 18 - Exclusive adult content
            </p>
          </div>
          <button
            onClick={handleTelegramClick}
            className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-lg font-medium transition-colors inline-flex items-center"
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Contact on Telegram: @{config.telegramUsername}
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-6">
              <p className="text-red-800 font-medium mb-2">⚠️ LEGAL NOTICE</p>
              <p className="text-red-700 text-sm">
                This site is intended exclusively for people over 18 years old. 
                All content is for adults and should be accessed responsibly.
              </p>
            </div>
            <div className="text-gray-500">
              <p>&copy; 2024 {config.siteName}. All rights reserved.</p>
              <p className="text-xs mt-2">+18 Content - Access restricted to adults</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Image Modal */}
      <ImageModal
        isOpen={modalState.isOpen}
        onClose={closeImageModal}
        imageUrl={modalState.imageUrl}
        altText="Payment proof"
      />

      {/* Payment Notification */}
      <PaymentNotification
        type={paymentNotification.type}
        message={paymentNotification.message}
        isVisible={paymentNotification.isVisible}
        onClose={hidePaymentNotification}
        autoHide={true}
        autoHideDelay={4000}
      />
    </div>
  )
}