import { Link } from 'react-router-dom'
import { MapPin, BedDouble, Bath, Ruler, Building2, MessageCircle } from 'lucide-react'
import type { Property } from '../../types'
import { formatCurrency } from '../../lib/formatters'
import { StatusBadge } from './StatusBadge'
import { useCommentCount } from '../../hooks/useCommentCount'

interface PropertyCardProps {
  property: Property
  boardId: string
}

export function PropertyCard({ property, boardId }: PropertyCardProps) {
  const commentCount = useCommentCount(boardId, property.id)
  const custoTotal = property.aluguel + property.condominio + property.iptu

  return (
    <Link
      to={`/b/${boardId}/imovel/${property.id}`}
      className="block bg-gray-800 rounded-xl shadow-sm border border-gray-700 hover:shadow-md hover:border-gray-600 transition-all overflow-hidden"
    >
      {property.fotos.length > 0 && (
        <div className="h-40 bg-gray-700 overflow-hidden">
          <img
            src={property.fotos[0]}
            alt={property.titulo}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="font-semibold text-gray-100 line-clamp-1">
              {property.titulo}
            </h3>
            {property.codigoImovel && (
              <span className="text-xs text-gray-500">Ref: {property.codigoImovel}</span>
            )}
          </div>
          <StatusBadge status={property.status} />
        </div>

        <div className="flex items-center gap-1 text-gray-400 text-sm">
          <MapPin size={14} />
          <span>{property.bairro}</span>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <BedDouble size={14} /> {property.quartos}
          </span>
          <span className="flex items-center gap-1">
            <Bath size={14} /> {property.banheiros}
          </span>
          {property.area && (
            <span className="flex items-center gap-1">
              <Ruler size={14} /> {property.area}m²
            </span>
          )}
          {property.imobiliaria && (
            <span className="flex items-center gap-1">
              <Building2 size={14} />
              <span className="truncate max-w-[80px]">{property.imobiliaria}</span>
            </span>
          )}
          {commentCount > 0 && (
            <span className="flex items-center gap-1 text-blue-400">
              <MessageCircle size={14} />
              {commentCount}
            </span>
          )}
        </div>

        <div className="pt-2 border-t border-gray-700">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-lg font-bold text-blue-400">
                {formatCurrency(property.aluguel)}
              </span>
              <span className="text-xs text-gray-500">/mês</span>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500">Total: </span>
              <span className="text-sm font-medium text-gray-300">
                {formatCurrency(custoTotal)}
              </span>
            </div>
          </div>
          {(property.condominio > 0 || property.iptu > 0) && (
            <div className="text-xs text-gray-500 mt-0.5">
              {property.condominio > 0 && `Cond: ${formatCurrency(property.condominio)}`}
              {property.condominio > 0 && property.iptu > 0 && ' · '}
              {property.iptu > 0 && `IPTU: ${formatCurrency(property.iptu)}`}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
