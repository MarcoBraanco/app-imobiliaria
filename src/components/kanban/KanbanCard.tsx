import { useRef, useEffect } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { MapPin, BedDouble, Bath, Building2, GripHorizontal, MessageCircle } from 'lucide-react'
import type { Property } from '../../types'
import { formatCurrency } from '../../lib/formatters'
import { useCommentCount } from '../../hooks/useCommentCount'

interface KanbanCardProps {
  property: Property
  boardId: string
  isDragOverlay?: boolean
}

export function KanbanCard({ property, boardId, isDragOverlay }: KanbanCardProps) {
  const navigate = useNavigate()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: property.id,
  })
  const dragEndTime = useRef(0)

  // Track when drag ends to suppress accidental clicks
  useEffect(() => {
    if (!isDragging) {
      dragEndTime.current = Date.now()
    }
  }, [isDragging])

  const commentCount = useCommentCount(boardId, property.id)
  const custoTotal = property.aluguel + property.condominio + property.iptu

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  function handleClick() {
    if (!isDragging && Date.now() - dragEndTime.current > 300) {
      navigate(`/b/${boardId}/imovel/${property.id}`)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleClick}
      className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-gray-600 transition-all duration-200 ${
        isDragging && !isDragOverlay ? 'opacity-0 scale-95' : ''
      } ${isDragOverlay ? 'shadow-2xl shadow-black/50 rotate-1 scale-105' : ''}`}
    >
      <button
        {...listeners}
        aria-label="Arrastar imóvel"
        className="flex items-center justify-center w-full h-7 sm:h-5 cursor-grab active:cursor-grabbing touch-none bg-gray-750 hover:bg-gray-700 border-b border-gray-700 transition-colors"
      >
        <GripHorizontal size={16} className="text-gray-500" />
      </button>

      <div className="p-3 space-y-2">
        {property.fotos.length > 0 && (
          <div className="aspect-[16/10] -mx-3 -mt-3 mb-2 overflow-hidden bg-gray-900">
            <img
              src={property.fotos[0]}
              alt={property.titulo}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <h4 className="font-medium text-gray-100 text-sm line-clamp-1">
            {property.titulo}
          </h4>
          {property.codigoImovel && (
            <span className="text-xs text-gray-500">Ref: {property.codigoImovel}</span>
          )}
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <MapPin size={12} />
          <span className="truncate">{property.bairro}</span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          <span className="flex items-center gap-1">
            <BedDouble size={12} /> {property.quartos}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={12} /> {property.banheiros}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-gray-400">
          {property.imobiliaria && (
            <span className="flex items-center gap-1 truncate">
              <Building2 size={12} />
              {property.imobiliaria}
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-blue-400 ml-auto">
              <MessageCircle size={12} />
              {commentCount}
            </span>
          )}
        </div>

        <div className="pt-1.5 border-t border-gray-700 space-y-1">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-bold text-blue-400">
              {formatCurrency(custoTotal)}
              <span className="text-xs font-normal text-gray-500">/mês</span>
            </span>
            <span className="text-xs text-gray-400">
              {formatCurrency(Math.round(custoTotal / 2))}
              <span className="text-gray-500">/cada</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>Aluguel: {formatCurrency(property.aluguel)}</span>
            {property.condominio > 0 && <span>Condomínio: {formatCurrency(property.condominio)}</span>}
            {property.iptu > 0 && <span>IPTU: {formatCurrency(property.iptu)}</span>}
          </div>
        </div>
      </div>
    </div>
  )
}
