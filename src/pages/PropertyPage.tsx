import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Building2,
  ExternalLink,
  Trash2,
  Pencil,
  X,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { Header } from '../components/layout/Header'
import { StatusBadge } from '../components/property/StatusBadge'
import { ReactionBar } from '../components/collaboration/ReactionBar'
import { CommentSection } from '../components/collaboration/CommentSection'
import { useBoard } from '../hooks/useBoard'
import { useProperties } from '../hooks/useProperties'
import { useComments } from '../hooks/useComments'
import { useReactions } from '../hooks/useReactions'
import { formatCurrency } from '../lib/formatters'
import type { PropertyStatus } from '../types'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const allStatuses: PropertyStatus[] = ['interessado', 'agendar_visita', 'visitado', 'descartado']

export function PropertyPage() {
  const { boardId, propertyId } = useParams<{
    boardId: string
    propertyId: string
  }>()
  const navigate = useNavigate()
  const { board } = useBoard(boardId!)
  const { properties, updateStatus, removeProperty } = useProperties(boardId!)
  const { comments, addComment } = useComments(boardId!, propertyId!)
  const { getCount, hasReacted, toggleReaction } = useReactions(boardId!, propertyId!)
  const [showStatusMenu, setShowStatusMenu] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const property = properties.find((p) => p.id === propertyId)

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header boardName={board?.nome} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </div>
    )
  }

  const custoTotal = property.aluguel + property.condominio + property.iptu

  async function handleDelete() {
    if (confirm('Tem certeza que deseja remover este imóvel?')) {
      await removeProperty(propertyId!)
      navigate(`/b/${boardId}`)
    }
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header boardName={board?.nome} />

      <main className="max-w-3xl mx-auto px-4 py-4 space-y-6">
        <Link
          to={`/b/${boardId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        {/* Fotos */}
        {property.fotos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto rounded-xl">
            {property.fotos.map((url, i) => (
              <img
                key={i}
                src={url}
                alt={`Foto ${i + 1}`}
                className="h-48 sm:h-64 rounded-xl object-cover flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={() => setLightboxIndex(i)}
              />
            ))}
          </div>
        )}

        {/* Lightbox */}
        {lightboxIndex !== null && (
          <div
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
            onClick={() => setLightboxIndex(null)}
          >
            <button
              onClick={() => setLightboxIndex(null)}
              className="absolute top-4 right-4 text-white/70 hover:text-white p-2"
            >
              <X size={28} />
            </button>

            {property.fotos.length > 1 && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex - 1 + property.fotos.length) % property.fotos.length)
                  }}
                  className="absolute left-2 sm:left-4 text-white/70 hover:text-white p-2"
                >
                  <ChevronLeft size={32} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setLightboxIndex((lightboxIndex + 1) % property.fotos.length)
                  }}
                  className="absolute right-2 sm:right-4 text-white/70 hover:text-white p-2"
                >
                  <ChevronRight size={32} />
                </button>
              </>
            )}

            <img
              src={property.fotos[lightboxIndex]}
              alt={`Foto ${lightboxIndex + 1}`}
              className="max-h-[90vh] max-w-[90vw] object-contain"
              onClick={(e) => e.stopPropagation()}
            />

            {property.fotos.length > 1 && (
              <span className="absolute bottom-4 text-white/60 text-sm">
                {lightboxIndex + 1} / {property.fotos.length}
              </span>
            )}
          </div>
        )}

        {/* Header */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-gray-100">
                {property.titulo}
              </h1>
              {property.codigoImovel && (
                <span className="text-sm text-gray-500">Ref: {property.codigoImovel}</span>
              )}
            </div>
            <div className="relative">
              <StatusBadge
                status={property.status}
                onClick={() => setShowStatusMenu(!showStatusMenu)}
              />
              {showStatusMenu && (
                <div className="absolute right-0 top-8 bg-gray-700 border border-gray-600 rounded-lg shadow-lg z-10 py-1">
                  {allStatuses.map((s) => (
                    <button
                      key={s}
                      onClick={() => {
                        updateStatus(property.id, s)
                        setShowStatusMenu(false)
                      }}
                      className="block w-full text-left px-4 py-1.5 text-sm hover:bg-gray-600"
                    >
                      <StatusBadge status={s} />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 text-gray-400">
            <MapPin size={16} />
            <span>{property.bairro}</span>
            {property.endereco && (
              <span className="text-gray-500"> · {property.endereco}</span>
            )}
          </div>

          <div className="flex items-center gap-4 text-gray-400">
            <span className="flex items-center gap-1">
              <BedDouble size={16} /> {property.quartos} quartos
            </span>
            <span className="flex items-center gap-1">
              <Bath size={16} /> {property.banheiros} banheiros
            </span>
            {property.area && (
              <span className="flex items-center gap-1">
                <Ruler size={16} /> {property.area}m²
              </span>
            )}
          </div>

          {property.imobiliaria && (
            <div className="flex items-center gap-1 text-gray-400 text-sm">
              <Building2 size={14} /> {property.imobiliaria}
            </div>
          )}

          {/* Valores */}
          <div className="bg-blue-950/40 rounded-lg p-4 space-y-2">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-gray-400">Aluguel</span>
              <span className="text-xl font-bold text-blue-400">
                {formatCurrency(property.aluguel)}
              </span>
            </div>
            {property.condominio > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400">Condomínio</span>
                <span className="text-sm text-gray-300">
                  {formatCurrency(property.condominio)}
                </span>
              </div>
            )}
            {property.iptu > 0 && (
              <div className="flex items-baseline justify-between">
                <span className="text-sm text-gray-400">IPTU</span>
                <span className="text-sm text-gray-300">
                  {formatCurrency(property.iptu)}
                </span>
              </div>
            )}
            <div className="flex items-baseline justify-between pt-2 border-t border-blue-900/50">
              <span className="font-medium text-gray-300">Custo Total</span>
              <span className="text-lg font-bold text-gray-100">
                {formatCurrency(custoTotal)}
              </span>
            </div>
          </div>

          {property.observacoes && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Observações
              </h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                {property.observacoes}
              </p>
            </div>
          )}

          {property.descricao && (
            <div>
              <h3 className="text-sm font-medium text-gray-300 mb-1">
                Descrição
              </h3>
              <p className="text-sm text-gray-400 whitespace-pre-wrap">
                {property.descricao}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-2">
            <ReactionBar
              getCount={getCount}
              hasReacted={hasReacted}
              onToggle={toggleReaction}
            />

            <div className="flex items-center gap-2">
              {property.linkAnuncio && (
                <a
                  href={property.linkAnuncio}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 text-sm text-blue-400 hover:underline"
                >
                  <ExternalLink size={14} /> Ver anúncio
                </a>
              )}
              <Link
                to={`/b/${boardId}/editar/${propertyId}`}
                className="text-gray-400 hover:text-blue-400 p-1"
                title="Editar imóvel"
              >
                <Pencil size={16} />
              </Link>
              <button
                onClick={handleDelete}
                className="text-red-400 hover:text-red-300 p-1"
                title="Remover imóvel"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500">
            Adicionado por {property.adicionadoPor}
          </p>
        </div>

        {/* Comentários */}
        <div className="bg-gray-800 rounded-xl p-4 sm:p-6 shadow-sm">
          <CommentSection comments={comments} onAddComment={addComment} />
        </div>
      </main>
    </div>
  )
}
