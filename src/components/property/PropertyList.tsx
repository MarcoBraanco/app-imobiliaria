import type { Property } from '../../types'
import { PropertyCard } from './PropertyCard'

interface PropertyListProps {
  properties: Property[]
  boardId: string
}

export function PropertyList({ properties, boardId }: PropertyListProps) {
  if (properties.length === 0) {
    return (
      <div className="text-center py-16 text-gray-500">
        <p className="text-lg">Nenhum imóvel adicionado ainda</p>
        <p className="text-sm mt-1">
          Clique em "Adicionar" para começar
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {properties.map((p) => (
        <PropertyCard key={p.id} property={p} boardId={boardId} />
      ))}
    </div>
  )
}
