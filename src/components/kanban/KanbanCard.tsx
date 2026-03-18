import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { useNavigate } from 'react-router-dom'
import { MapPin, BedDouble, Bath, Building2, GripVertical } from 'lucide-react'
import type { Property } from '../../types'
import { formatCurrency } from '../../lib/formatters'

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

  const custoTotal = property.aluguel + property.condominio + property.iptu

  const style = transform
    ? {
        transform: CSS.Translate.toString(transform),
      }
    : undefined

  function handleClick() {
    if (!isDragging) {
      navigate(`/b/${boardId}/imovel/${property.id}`)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      onClick={handleClick}
      className={`relative bg-gray-800 rounded-lg border border-gray-700 p-3 space-y-2 hover:border-gray-600 transition-all duration-200 ${
        isDragging && !isDragOverlay ? 'opacity-0 scale-95' : ''
      } ${isDragOverlay ? 'shadow-2xl shadow-black/50 rotate-1 scale-105' : ''}`}
    >
      <button
        {...listeners}
        aria-label="Arrastar imóvel"
        className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-gray-700/80 text-gray-400 hover:text-gray-200 hover:bg-gray-600 cursor-grab active:cursor-grabbing touch-none transition-colors"
      >
        <GripVertical size={16} />
      </button>
      {property.fotos.length > 0 && (
        <div className="aspect-[16/10] -mx-3 -mt-3 mb-2 overflow-hidden rounded-t-lg bg-gray-900">
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

      {property.imobiliaria && (
        <div className="flex items-center gap-1 text-gray-400 text-xs">
          <Building2 size={12} />
          <span className="truncate">{property.imobiliaria}</span>
        </div>
      )}

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
  )
}
