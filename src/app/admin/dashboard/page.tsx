'use client'

import Link from 'next/link'
import { Play, CreditCard, Eye, TrendingUp } from 'lucide-react'
import { useVideos } from '@/hooks/useVideos'
import { usePaymentProofs } from '@/context/PaymentProofContext'

export default function Dashboard() {
  const { videos, loading: videosLoading } = useVideos()
  const { paymentProofs, loading: proofsLoading } = usePaymentProofs()

  const totalVideos = videos.length
  const publishedVideos = videos.filter(v => v.status === 'published').length
  const totalViews = videos.reduce((sum, v) => sum + (v.views || 0), 0)
  
  const pendingProofs = paymentProofs.filter(p => p.status === 'pending').length
  const approvedProofs = paymentProofs.filter(p => p.status === 'approved').length
  // Considerar visíveis todas as provas aprovadas
  const visibleProofs = paymentProofs.filter(p => p.status === 'approved').length

  const stats = [
    {
      name: 'Total de Vídeos',
      value: videosLoading ? '...' : totalVideos.toString(),
      icon: Play,
      subtitle: `${publishedVideos} publicados`
    },
    {
      name: 'Comprovantes Pendentes',
      value: proofsLoading ? '...' : pendingProofs.toString(),
      icon: CreditCard,
      subtitle: `${approvedProofs} aprovados`
    },
    {
      name: 'Total de Visualizações',
      value: videosLoading ? '...' : totalViews.toLocaleString(),
      icon: Eye,
      subtitle: 'Todos os vídeos'
    },
    {
      name: 'Provas Visíveis',
      value: proofsLoading ? '...' : visibleProofs.toString(),
      icon: TrendingUp,
      subtitle: 'Exibidas no site'
    }
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Visão geral do sistema Alex 2.0 - dados do Wasabi
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {stats.map((item) => {
          const Icon = item.icon
          return (
            <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="bg-primary-100 p-3 rounded-lg">
                      <Icon className="h-6 w-6 text-primary-600" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        {item.name}
                      </dt>
                      <dd className="flex items-baseline">
                        <div className="text-2xl font-semibold text-gray-900">
                          {item.value}
                        </div>
                      </dd>
                      <dd className="text-xs text-gray-500 mt-1">
                        {item.subtitle}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Videos */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Vídeos Recentes</h3>
          </div>
          <div className="divide-y divide-gray-200 max-h-64 overflow-y-auto">
            {videosLoading ? (
              <div className="px-6 py-4 text-gray-500">Carregando...</div>
            ) : videos.length === 0 ? (
              <div className="px-6 py-4 text-gray-500">Nenhum vídeo encontrado</div>
            ) : (
              videos.slice(0, 5).map((video) => (
                <div key={video.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="w-2 h-2 rounded-full mr-3 bg-blue-500" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {video.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          {video.views || 0} views • ${video.price?.toFixed(2) || '0.00'}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded ${
                      video.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {video.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Ações Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              <Link href="/admin/videos" className="w-full bg-primary-600 hover:bg-primary-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                <Play className="w-5 h-5 mr-2" />
                Adicionar Novo Vídeo
              </Link>
              <Link href="/admin/payments" className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                <CreditCard className="w-5 h-5 mr-2" />
                Revisar Comprovantes
              </Link>
              <Link href="/admin/settings" className="w-full bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Configurações
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
