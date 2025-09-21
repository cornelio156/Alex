'use client'

import { useState } from 'react'
import { Eye, Check, X, Calendar, Loader, Upload, Plus } from 'lucide-react'
import { usePaymentProofs } from '@/context/PaymentProofContext'
import { PaymentProofService } from '@/services/paymentProofService'
import ImageModal from '@/components/ImageModal'

export default function PaymentProofs() {
  const { 
    paymentProofs, 
    loading, 
    error, 
    approvePaymentProof, 
    rejectPaymentProof, 
    refreshPaymentProofs 
  } = usePaymentProofs()
  
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set())
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [uploadingFile, setUploadingFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [amount, setAmount] = useState<number>(0)
  const [customerName, setCustomerName] = useState('')
  
  // Modal state for image amplification
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    imageUrl: string
  }>({
    isOpen: false,
    imageUrl: ''
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

  const filteredProofs = paymentProofs

  const handleApprove = async (documentId: string) => {
    if (!documentId) return
    setProcessingIds(prev => new Set(prev).add(documentId))
    try {
      await approvePaymentProof(documentId)
    } catch (error) {
      console.error('Erro ao aprovar comprovante:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    }
  }

  const handleReject = async (documentId: string) => {
    if (!documentId) return
    setProcessingIds(prev => new Set(prev).add(documentId))
    try {
      await rejectPaymentProof(documentId)
    } catch (error) {
      console.error('Erro ao rejeitar comprovante:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    }
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      setUploadingFile(file)
    }
  }

  const handleUpload = async () => {
    if (!uploadingFile || amount <= 0) return
    
    setUploading(true)
    try {
      await PaymentProofService.createPaymentProof(uploadingFile, amount, customerName || undefined)
      setShowUploadModal(false)
      setUploadingFile(null)
      setAmount(0)
      setCustomerName('')
      await refreshPaymentProofs()
    } catch (error) {
      console.error('Erro ao fazer upload:', error)
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (!documentId) return
    if (!confirm('Tem certeza que deseja apagar este comprovante?')) return
    
    setProcessingIds(prev => new Set(prev).add(documentId))
    try {
      await PaymentProofService.deletePaymentProof(documentId)
      await refreshPaymentProofs()
    } catch (error) {
      console.error('Erro ao apagar comprovante:', error)
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev)
        newSet.delete(documentId)
        return newSet
      })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'approved':
        return 'Confirmado'
      case 'rejected':
        return 'Rejeitado'
      case 'pending':
        return 'Pendente'
      default:
        return 'Desconhecido'
    }
  }

  


  const pendingCount = paymentProofs.filter(p => p.status === 'pending').length
  const confirmedCount = paymentProofs.filter(p => p.status === 'approved').length
  const rejectedCount = paymentProofs.filter(p => p.status === 'rejected').length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center space-x-2">
          <Loader className="w-6 h-6 animate-spin text-primary-600" />
          <span className="text-gray-600">Carregando comprovantes...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <X className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-red-700">{error}</span>
        </div>
        <button 
          onClick={refreshPaymentProofs}
          className="mt-2 text-red-600 hover:text-red-800 text-sm underline"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Comprovantes de Pagamento</h1>
          <p className="mt-1 text-sm text-gray-500">
            Faça upload e gerencie comprovantes para incentivar vendas
          </p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span>Adicionar Comprovante</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendentes</p>
              <p className="text-2xl font-semibold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-lg">
              <Check className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Confirmados</p>
              <p className="text-2xl font-semibold text-gray-900">{confirmedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-lg">
              <X className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Rejeitados</p>
              <p className="text-2xl font-semibold text-gray-900">{rejectedCount}</p>
            </div>
          </div>
        </div>
      </div>



      {/* Proofs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Comprovante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProofs.map((proof) => {
                const isProcessing = processingIds.has(proof.$id || '')
                return (
                                     <tr key={proof.$id} className="hover:bg-gray-50">
                     <td className="px-6 py-4 whitespace-nowrap">
                       <div className="flex items-center">
                         {proof.imageUrl ? (
                           <img 
                             src={proof.imageUrl} 
                             alt="Payment proof" 
                             className="w-16 h-16 object-cover rounded-lg border border-gray-200 cursor-pointer hover:opacity-80 transition-opacity"
                             onClick={() => openImageModal(proof.imageUrl)}
                           />
                         ) : (
                           <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                             <Eye className="w-6 h-6 text-gray-400" />
                           </div>
                         )}
                         <div className="ml-4">
                           <div className="text-sm font-medium text-gray-900">
                             Payment Proof
                           </div>
                           <div className="text-sm text-gray-500">
                             ID: {proof.$id}
                           </div>
                         </div>
                       </div>
                     </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(proof.status)}`}>
                          {getStatusText(proof.status)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Ver comprovante */}
                        <button className="text-primary-600 hover:text-primary-900 flex items-center">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </button>

                        {/* Ações para comprovantes pendentes */}
                        {proof.status === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleApprove(proof.$id!)}
                              disabled={isProcessing}
                              className="text-green-600 hover:text-green-900 flex items-center disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <Check className="w-4 h-4 mr-1" />
                              )}
                              Aprovar
                            </button>
                            <button 
                              onClick={() => handleReject(proof.$id!)}
                              disabled={isProcessing}
                              className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                            >
                              {isProcessing ? (
                                <Loader className="w-4 h-4 mr-1 animate-spin" />
                              ) : (
                                <X className="w-4 h-4 mr-1" />
                              )}
                              Rejeitar
                            </button>
                          </>
                        )}
                        {/* Botão de apagar */}
                        <button 
                          onClick={() => handleDelete(proof.$id!)}
                          disabled={isProcessing}
                          className="text-red-600 hover:text-red-900 flex items-center disabled:opacity-50"
                        >
                          {isProcessing ? (
                            <Loader className="w-4 h-4 mr-1 animate-spin" />
                          ) : (
                            <X className="w-4 h-4 mr-1" />
                          )}
                          Apagar
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Adicionar Comprovante</h3>
              <button
                onClick={() => {
                  setShowUploadModal(false)
                  setUploadingFile(null)
                  setAmount(0)
                  setCustomerName('')
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Selecione a imagem do comprovante
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-primary-500 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploadingFile ? (
                      <div className="space-y-2">
                        <img 
                          src={URL.createObjectURL(uploadingFile)} 
                          alt="Preview" 
                          className="w-32 h-32 object-cover rounded-lg mx-auto"
                        />
                        <p className="text-sm text-gray-600">{uploadingFile.name}</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                        <p className="text-sm text-gray-600">
                          Clique para selecionar uma imagem
                        </p>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF até 10MB
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor do Pagamento
                </label>
                                 <input
                   type="number"
                   value={amount || ''}
                   onChange={(e) => setAmount(e.target.value ? parseFloat(e.target.value) : 0)}
                   className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                   placeholder="R$ 0,00"
                   min="0"
                   step="0.01"
                 />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Nome do Cliente"
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowUploadModal(false)
                    setUploadingFile(null)
                    setAmount(0)
                    setCustomerName('')
                  }}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!uploadingFile || amount <= 0 || uploading}
                  className="bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2"
                >
                  {uploading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      <span>Enviar</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      <ImageModal
        isOpen={modalState.isOpen}
        onClose={closeImageModal}
        imageUrl={modalState.imageUrl}
        altText="Payment proof"
      />
    </div>
  )
}
