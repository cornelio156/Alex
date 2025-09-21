'use client'

import { useEffect } from 'react'
import { X, ZoomIn, ZoomOut, RotateCw } from 'lucide-react'
import { useState } from 'react'

interface ImageModalProps {
  isOpen: boolean
  onClose: () => void
  imageUrl: string
  altText?: string
}

export default function ImageModal({ isOpen, onClose, imageUrl, altText = "Payment proof" }: ImageModalProps) {
  const [scale, setScale] = useState(1)
  const [rotation, setRotation] = useState(0)

  // Reset scale and rotation when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setScale(1)
      setRotation(0)
    }
  }, [isOpen])

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.25, 3))
  }

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.25, 0.5))
  }

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360)
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={handleBackdropClick}
    >
      {/* Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-2 z-60">
        <button
          onClick={handleZoomOut}
          className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
          title="Diminuir zoom"
        >
          <ZoomOut className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleZoomIn}
          className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
          title="Aumentar zoom"
        >
          <ZoomIn className="w-5 h-5" />
        </button>
        
        <button
          onClick={handleRotate}
          className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
          title="Girar imagem"
        >
          <RotateCw className="w-5 h-5" />
        </button>
        
        <button
          onClick={onClose}
          className="bg-white bg-opacity-20 text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
          title="Fechar"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Zoom indicator */}
      <div className="absolute top-4 left-4 bg-white bg-opacity-20 text-white px-3 py-1 rounded-lg text-sm">
        {Math.round(scale * 100)}%
      </div>

      {/* Image container */}
      <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
        <img
          src={imageUrl}
          alt={altText}
          className="max-w-none transition-transform duration-200 cursor-move"
          style={{
            transform: `scale(${scale}) rotate(${rotation}deg)`,
            maxHeight: scale <= 1 ? '90vh' : 'none',
            maxWidth: scale <= 1 ? '90vw' : 'none',
          }}
          draggable={false}
          onError={(e) => {
            console.error('Erro ao carregar imagem:', e)
            // Opcional: mostrar uma mensagem de erro
          }}
        />
      </div>

      {/* Instructions */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-20 text-white px-4 py-2 rounded-lg text-sm text-center">
        <p>Clique fora da imagem ou pressione ESC para fechar</p>
      </div>
    </div>
  )
}
