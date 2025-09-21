'use client'

import { useEffect, useState } from 'react'
import { useSiteConfig } from '@/context/SiteConfigContext'
import { Save, Settings, MessageCircle, Globe, FileText, CreditCard } from 'lucide-react'
import { detectPayPalEnvironment, getPayPalClientIdDebugInfo } from '@/utils/paypalUtils'

export default function SettingsPage() {
  const { config, updateConfig } = useSiteConfig()
  const [formData, setFormData] = useState({
    telegramUsername: config.telegramUsername,
    siteName: config.siteName,
    description: config.description,
    paypalClientId: config.paypalClientId,
    paypalEnvironment: config.paypalEnvironment
  })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    setFormData({
      telegramUsername: config.telegramUsername,
      siteName: config.siteName,
      description: config.description,
      paypalClientId: config.paypalClientId,
      paypalEnvironment: config.paypalEnvironment
    })
  }, [config])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    updateConfig(formData)
    setSaving(false)
    setSaved(true)
    
    // Limpar mensagem de sucesso após 3 segundos
    setTimeout(() => setSaved(false), 3000)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Configurações do Site</h1>
        <p className="mt-1 text-sm text-gray-500">
          Configure as informações básicas e links do seu site
        </p>
      </div>

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Configurações Gerais
            </h3>
          </div>

          <div className="px-6 py-6 space-y-6">
            {/* Nome do Site */}
            <div>
              <label htmlFor="siteName" className="block text-sm font-medium text-gray-700 mb-2">
                <Globe className="w-4 h-4 inline mr-1" />
                Nome do Site
              </label>
              <input
                type="text"
                id="siteName"
                name="siteName"
                value={formData.siteName}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Alex 2.0"
              />
              <p className="mt-1 text-sm text-gray-500">
                Este nome aparecerá no cabeçalho do site
              </p>
            </div>

            {/* Descrição */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-1" />
                Descrição do Site
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                placeholder="Ex: Plataforma de conteúdo exclusivo"
              />
              <p className="mt-1 text-sm text-gray-500">
                Descrição que aparece na página inicial
              </p>
            </div>

            {/* Username do Telegram */}
            <div>
              <label htmlFor="telegramUsername" className="block text-sm font-medium text-gray-700 mb-2">
                <MessageCircle className="w-4 h-4 inline mr-1" />
                Username do Telegram
              </label>
              <div className="flex">
                <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                  @
                </span>
                <input
                  type="text"
                  id="telegramUsername"
                  name="telegramUsername"
                  value={formData.telegramUsername}
                  onChange={handleInputChange}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="alexchannel"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                Username do seu canal/contato no Telegram (sem o @)
              </p>
              {formData.telegramUsername && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Preview do link:</p>
                  <a 
                    href={`https://t.me/${formData.telegramUsername}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline"
                  >
                    https://t.me/{formData.telegramUsername}
                  </a>
                </div>
              )}
            </div>

            {/* Configurações do PayPal */}
            <div className="border-t border-gray-200 pt-6">
              <h4 className="text-md font-medium text-gray-900 flex items-center mb-4">
                <CreditCard className="w-4 h-4 mr-2" />
                Configurações do PayPal
              </h4>
              
              {/* Client ID do PayPal */}
              <div className="mb-4">
                <label htmlFor="paypalClientId" className="block text-sm font-medium text-gray-700 mb-2">
                  Client ID do PayPal
                </label>
                <input
                  type="text"
                  id="paypalClientId"
                  name="paypalClientId"
                  value={formData.paypalClientId}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Ex: AQK...xyz"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Client ID obtido no PayPal Developer Dashboard
                </p>
              </div>

              {/* Ambiente do PayPal - Detecção Automática */}
              <div>
                <label htmlFor="paypalEnvironment" className="block text-sm font-medium text-gray-700 mb-2">
                  Ambiente do PayPal
                </label>
                <select
                  id="paypalEnvironment"
                  name="paypalEnvironment"
                  value={formData.paypalEnvironment}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="sandbox">Sandbox (Teste)</option>
                  <option value="live">Live (Produção)</option>
                </select>
                <p className="mt-1 text-sm text-gray-500">
                  Use &quot;Sandbox&quot; para testes e &quot;Live&quot; para produção
                </p>
                
                {/* Informações de detecção automática */}
                {formData.paypalClientId && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-1">
                      🔍 Detecção Automática
                    </p>
                    {(() => {
                      const envInfo = detectPayPalEnvironment(formData.paypalClientId)
                      const debugInfo = getPayPalClientIdDebugInfo(formData.paypalClientId)
                      
                      return (
                        <div className="text-xs text-blue-700 space-y-1">
                          <p>Ambiente detectado: <span className="font-medium">{envInfo.environment}</span></p>
                          <p>Confiança: <span className="font-medium">{envInfo.confidence}</span></p>
                          <p>Razão: {envInfo.reason}</p>
                          <p>Client ID válido: <span className="font-medium">{debugInfo.isValid ? '✅ Sim' : '❌ Não'}</span></p>
                        </div>
                      )
                    })()}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex justify-between items-center">
            {saved && (
              <div className="text-green-600 text-sm flex items-center">
                <Save className="w-4 h-4 mr-1" />
                Configurações salvas com sucesso!
              </div>
            )}
            <div className="ml-auto">
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Salvando...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Configurações
                  </>
                )}
              </button>
            </div>
          </div>
        </form>

        {/* Preview Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Preview das Configurações</h3>
          </div>
          <div className="px-6 py-6">
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Nome do site:</p>
                <p className="text-lg font-bold text-primary-600">{formData.siteName}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Descrição:</p>
                <p className="text-gray-900">{formData.description}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Link do Telegram:</p>
                <div className="flex items-center space-x-2">
                  <MessageCircle className="w-4 h-4 text-blue-500" />
                  <span className="text-blue-600">@{formData.telegramUsername}</span>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">PayPal:</p>
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-green-500" />
                  <span className="text-gray-900">
                    {formData.paypalClientId ? `${formData.paypalClientId.substring(0, 10)}...` : 'Não configurado'} 
                    ({formData.paypalEnvironment})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
