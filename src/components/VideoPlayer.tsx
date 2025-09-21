'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw } from 'lucide-react'

// Extended HTMLVideoElement interface for webkit methods
interface ExtendedHTMLVideoElement extends HTMLVideoElement {
  webkitEnterFullscreen?: () => void
  webkitExitFullscreen?: () => void
  webkitRequestFullscreen?: () => void
  webkitDisplayingFullscreen?: boolean
  mozRequestFullScreen?: () => void
  msRequestFullscreen?: () => void
}

// Extended Document interface for webkit methods
interface ExtendedDocument extends Document {
  webkitFullscreenElement?: Element
  webkitExitFullscreen?: () => void
  mozFullScreenElement?: Element
  mozCancelFullScreen?: () => void
  msFullscreenElement?: Element
  msExitFullscreen?: () => void
}

interface VideoPlayerProps {
  src?: string
  title: string
  className?: string
  autoPlay?: boolean
  controls?: boolean
  poster?: string
  videoId?: string
  onPlay?: () => void
}

export const VideoPlayer = ({ 
  src, 
  title, 
  className = '',
  autoPlay = false,
  controls = true,
  poster,
  videoId: _videoId,
  onPlay
}: VideoPlayerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [generatedPoster, setGeneratedPoster] = useState<string | null>(null)
  const [showFirstFrame, setShowFirstFrame] = useState(false)
  const [pausedFrame, setPausedFrame] = useState<string | null>(null)
  const [hasCountedView, setHasCountedView] = useState(false)

  // Auto-hide controls (only when playing)
  useEffect(() => {
    let timeout: NodeJS.Timeout
    
    if (showControls && isPlaying) {
      timeout = setTimeout(() => {
        setShowControls(false)
      }, 3000)
    }

    return () => {
      if (timeout) clearTimeout(timeout)
    }
  }, [showControls, isPlaying])

  // Reset view counter when video source changes
  useEffect(() => {
    setHasCountedView(false)
  }, [src])

  // Generate poster from first frame
  const generatePoster = () => {
    if (!videoRef.current || !canvasRef.current || poster || generatedPoster) return
    
    const video = videoRef.current
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    
    if (!ctx) return
    
    try {
      // Set canvas size to match video
      canvas.width = video.videoWidth || 640
      canvas.height = video.videoHeight || 360
      
      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
      
      // Convert to data URL
        const dataURL = canvas.toDataURL('image/jpeg', 0.8)
        setGeneratedPoster(dataURL)
    } catch (error) {
      console.warn('Não foi possível gerar poster do vídeo (CORS):', error)
      // Fallback: usar o próprio vídeo como poster via object-fit
      setGeneratedPoster('fallback')
    }
  }

  // Video event handlers
  const handleLoadedData = () => {
    setIsLoading(false)
    if (videoRef.current) {
      setDuration(videoRef.current.duration)
    }
  }

  const handleLoadedMetadata = () => {
    // Force load first frame for preview (0.3s in to avoid black frames)
    if (videoRef.current && !autoPlay) {
      const video = videoRef.current
      // Always seek to exactly 0.3 seconds to avoid black frames
      const seekTime = Math.min(0.3, video.duration - 0.1) // 0.3s or near end if video is very short
      video.currentTime = seekTime
      setShowFirstFrame(true)
      console.log('Seeking to:', seekTime, 'seconds')
    }
  }

  const handleSeeked = () => {
    // Generate poster after seeking to the desired frame
    if (!isPlaying && !generatedPoster && !poster && showFirstFrame) {
      generatePoster()
    }
  }

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime)
    }
  }

  const handleError = () => {
    setError('Erro ao carregar o vídeo')
    setIsLoading(false)
  }

  // Control functions
  const togglePlayPause = () => {
    if (!videoRef.current) return

    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
      // Force frame to stay visible when paused
      setTimeout(() => {
        if (videoRef.current && !isPlaying) {
          videoRef.current.currentTime = videoRef.current.currentTime
        }
      }, 50)
    } else {
      videoRef.current.play()
      setIsPlaying(true)
    }
  }

  const toggleMute = () => {
    if (!videoRef.current) return

    videoRef.current.muted = !isMuted
    setIsMuted(!isMuted)
  }

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return

    const newTime = parseFloat(e.target.value)
    videoRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!videoRef.current) return

    const newVolume = parseFloat(e.target.value)
    videoRef.current.volume = newVolume
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  // Detect iOS device
  const isIOS = () => {
    return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
           (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  }

  // Detect if fullscreen is supported
  const isFullscreenSupported = () => {
    const video = videoRef.current as ExtendedHTMLVideoElement | null
    if (!video) return false
    
    return !!(
      video.requestFullscreen ||
      video.webkitEnterFullscreen ||
      video.webkitRequestFullscreen ||
      video.mozRequestFullScreen ||
      video.msRequestFullscreen
    )
  }

  const toggleFullscreen = () => {
    if (!videoRef.current) return
    
    const video = videoRef.current as ExtendedHTMLVideoElement
    const extDocument = document as ExtendedDocument

    try {
      // For iOS devices, use webkitEnterFullscreen
      if (isIOS() && video.webkitEnterFullscreen) {
        if (!isFullscreen) {
          video.webkitEnterFullscreen()
          setIsFullscreen(true)
        }
        // iOS handles exit automatically when user taps done
        return
      }

      // For other browsers, use standard fullscreen API
      if (!document.fullscreenElement && 
          !extDocument.webkitFullscreenElement && 
          !extDocument.mozFullScreenElement && 
          !extDocument.msFullscreenElement) {
        
        // Try different fullscreen methods
        if (video.requestFullscreen) {
          video.requestFullscreen()
        } else if (video.webkitRequestFullscreen) {
          video.webkitRequestFullscreen()
        } else if (video.mozRequestFullScreen) {
          video.mozRequestFullScreen()
        } else if (video.msRequestFullscreen) {
          video.msRequestFullscreen()
        }
        setIsFullscreen(true)
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
        } else if (extDocument.webkitExitFullscreen) {
          extDocument.webkitExitFullscreen()
        } else if (extDocument.mozCancelFullScreen) {
          extDocument.mozCancelFullScreen()
        } else if (extDocument.msExitFullscreen) {
          extDocument.msExitFullscreen()
        }
        setIsFullscreen(false)
      }
    } catch (error) {
      console.warn('Fullscreen not supported or failed:', error)
    }
  }

  const restart = () => {
    if (!videoRef.current) return

    // Restart from 0.3s to avoid black frames
    const startTime = Math.min(0.3, videoRef.current.duration - 0.1)
    videoRef.current.currentTime = startTime
    setCurrentTime(startTime)
  }

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600)
    const minutes = Math.floor((time % 3600) / 60)
    const seconds = Math.floor(time % 60)

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  // Effect to handle fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      const extDocument = document as ExtendedDocument
      const isCurrentlyFullscreen = !!(
        document.fullscreenElement ||
        extDocument.webkitFullscreenElement ||
        extDocument.mozFullScreenElement ||
        extDocument.msFullscreenElement
      )
      setIsFullscreen(isCurrentlyFullscreen)
    }

    const handleWebkitBeginFullscreen = () => setIsFullscreen(true)
    const handleWebkitEndFullscreen = () => setIsFullscreen(false)

    // Add event listeners for fullscreen changes
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
    document.addEventListener('mozfullscreenchange', handleFullscreenChange)
    document.addEventListener('msfullscreenchange', handleFullscreenChange)

    // iOS specific events - capture current video ref to avoid stale closure
    const currentVideo = videoRef.current
    if (currentVideo) {
      currentVideo.addEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen)
      currentVideo.addEventListener('webkitendfullscreen', handleWebkitEndFullscreen)
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange)
      document.removeEventListener('msfullscreenchange', handleFullscreenChange)
      
      if (currentVideo) {
        currentVideo.removeEventListener('webkitbeginfullscreen', handleWebkitBeginFullscreen)
        currentVideo.removeEventListener('webkitendfullscreen', handleWebkitEndFullscreen)
      }
    }
  }, [])

  // Effect to ensure first frame is shown
  useEffect(() => {
    if (videoRef.current && src && !autoPlay) {
      const video = videoRef.current
      
      const handleCanPlay = () => {
        // Pause immediately if not autoplay to show first frame at 0.3s
        if (!autoPlay && video.currentTime < 0.2) {
          const seekTime = Math.min(0.3, video.duration - 0.1)
          video.currentTime = seekTime
          video.pause()
          console.log('CanPlay: Seeking to:', seekTime, 'seconds')
        }
      }
      
      video.addEventListener('canplay', handleCanPlay)
      return () => video.removeEventListener('canplay', handleCanPlay)
    }
  }, [src, autoPlay])

  // Se não há src, mostrar placeholder
  if (!src) {
    return (
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        <div className="aspect-video flex items-center justify-center">
          <div className="text-center text-white">
            <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-semibold mb-2">{title}</p>
            <p className="text-sm opacity-75">Vídeo será carregado em breve</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`relative bg-black rounded-lg overflow-hidden group ${className}`}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => {
        // Only hide controls when playing, keep visible when paused
        if (isPlaying) {
          setShowControls(false)
        } else {
          setShowControls(true)
        }
      }}
    >
      {/* Hidden canvas for poster generation */}
      <canvas
        ref={canvasRef}
        style={{ display: 'none' }}
      />
      
      {/* Video Element */}
      <video
        ref={videoRef}
        className="w-full aspect-video object-cover"
        autoPlay={autoPlay}
        muted={true}
        poster={poster || (generatedPoster && generatedPoster !== 'fallback' ? generatedPoster : undefined)}
        preload="metadata"
        playsInline={true}
        webkit-playsinline="true"
        x5-video-player-type="h5"
        x5-video-player-fullscreen="true"
        x5-playsinline="true"
        controls={false}
        disablePictureInPicture={false}
        style={{ backgroundColor: 'transparent' }}
        onLoadedData={handleLoadedData}
        onLoadedMetadata={handleLoadedMetadata}
        onSeeked={handleSeeked}
        onTimeUpdate={handleTimeUpdate}
        onError={handleError}
        onPlay={() => {
          setIsPlaying(true)
          setPausedFrame(null) // Clear paused frame when playing
          
          // Count view only once per video session
          if (!hasCountedView && onPlay) {
            setHasCountedView(true)
            onPlay()
          }
        }}
        onPause={() => {
          setIsPlaying(false)
          setShowControls(true) // Always show controls when paused
          // Capture current frame when paused to prevent black screen
          // Add a small delay to ensure frame is rendered
          setTimeout(() => {
            if (videoRef.current && canvasRef.current) {
              try {
                const video = videoRef.current
                const canvas = canvasRef.current
                const ctx = canvas.getContext('2d')
                
                if (ctx && video.videoWidth > 0 && video.readyState >= 2) {
                  canvas.width = video.videoWidth
                  canvas.height = video.videoHeight
                  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
                  const frameData = canvas.toDataURL('image/jpeg', 0.9)
                  setPausedFrame(frameData)
                }
              } catch (e) {
                console.warn('Could not capture paused frame:', e)
              }
            }
          }, 50)
        }}
        onClick={togglePlayPause}
      >
        <source src={src} type="video/mp4; codecs=avc1.42E01E,mp4a.40.2" />
        <source src={src} type="video/mp4" />
        Seu navegador não suporta reprodução de vídeo.
      </video>

      {/* Paused Frame Overlay */}
      {!isPlaying && pausedFrame && (
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${pausedFrame})`,
            zIndex: 1
          }}
        />
      )}

      {/* Loading Spinner */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75">
          <div className="text-center text-white">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Play Button Overlay */}
      {!isPlaying && !isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30" style={{ zIndex: 10 }}>
          <button
            onClick={togglePlayPause}
            className="bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full p-4 transition-all duration-200 backdrop-blur-sm"
          >
            <Play className="w-12 h-12 text-white ml-1" />
          </button>
        </div>
      )}

      {/* Custom Controls */}
      {controls && (showControls || !isPlaying) && !isLoading && !error && (
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/50 to-transparent p-4" style={{ zIndex: 20 }}>
          {/* Progress Bar */}
          <div className="mb-3">
            <input
              type="range"
              min="0"
              max={duration || 0}
              value={currentTime}
              onChange={handleSeek}
              className="w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>

          {/* Controls Row */}
          <div className="flex items-center justify-between text-white">
            {/* Left Controls */}
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlayPause}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5" />
                ) : (
                  <Play className="w-5 h-5" />
                )}
              </button>

              <button
                onClick={restart}
                className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-4 h-4" />
                  ) : (
                    <Volume2 className="w-4 h-4" />
                  )}
                </button>
                
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={isMuted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer slider"
                />
              </div>

              <div className="text-sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
            </div>

            {/* Right Controls */}
            <div className="flex items-center space-x-2">
              {isFullscreenSupported() && (
                <button
                  onClick={toggleFullscreen}
                  className="hover:bg-white hover:bg-opacity-20 p-2 rounded-full transition-colors"
                  title={isFullscreen ? "Sair da tela cheia" : "Tela cheia"}
                >
                  <Maximize className={`w-4 h-4 ${isFullscreen ? 'text-blue-400' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Title Overlay */}
      <div className="absolute top-4 left-4 right-4">
        <h3 className="text-white font-semibold text-lg drop-shadow-lg">
          {title}
        </h3>
      </div>
    </div>
  )
}
