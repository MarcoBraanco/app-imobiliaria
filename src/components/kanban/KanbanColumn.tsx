import { useDroppable } from '@dnd-kit/core'
import type { Property } from '../../types'
import { KanbanCard } from './KanbanCard'

const colorClasses: Record<string, { dot: string; header: string }> = {
  blue: { dot: 'bg-blue-400', header: 'text-blue-300' },
  yellow: { dot: 'bg-yellow-400', header: 'text-yellow-300' },
  green: { dot: 'bg-green-400', header: 'text-green-300' },
  gray: { dot: 'bg-gray-400', header: 'text-gray-400' },
}

interface KanbanColumnProps {
  status: string
  label: string
  color: string
  properties: Property[]
  boardId: string
}

export function KanbanColumn({ status, label, color, properties, boardId }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })
  const colors = colorClasses[color] || colorClasses.gray

  return (
    <div
      ref={setNodeRef}
      className={`flex flex-col bg-gray-900/50 rounded-xl min-w-[80vw] sm:min-w-[260px] sm:flex-1 snap-center transition-all duration-200 ${
        isOver ? 'ring-2 ring-blue-500/40 bg-gray-900/70' : ''
      }`}
    >
      <div className="p-3 border-b border-gray-700/50 flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot}`} />
        <h3 className={`text-sm font-semibold ${colors.header}`}>{label}</h3>
        <span className="text-xs text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded-full ml-auto">
          {properties.length}
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-2 max-h-[calc(100vh-220px)]">
        {properties.length === 0 ? (
          <div className="border-2 border-dashed border-gray-700 rounded-lg p-4 text-center">
            <p className="text-xs text-gray-500">Arraste imóveis para cá</p>
          </div>
        ) : (
          properties.map((property) => (
            <KanbanCard key={property.id} property={property} boardId={boardId} />
          ))
        )}
      </div>
    </div>
  )
}
