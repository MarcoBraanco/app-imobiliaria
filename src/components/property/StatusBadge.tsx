import type { PropertyStatus } from '../../types'

const statusConfig: Record<PropertyStatus, { label: string; className: string }> = {
  interessado: { label: 'Interessado', className: 'bg-blue-900/50 text-blue-300' },
  agendar_visita: { label: 'Agendar Visita', className: 'bg-yellow-900/50 text-yellow-300' },
  visitado: { label: 'Visitado', className: 'bg-green-900/50 text-green-300' },
  descartado: { label: 'Descartado', className: 'bg-gray-700 text-gray-400' },
}

interface StatusBadgeProps {
  status: PropertyStatus
  onClick?: () => void
}

export function StatusBadge({ status, onClick }: StatusBadgeProps) {
  const config = statusConfig[status]
  return (
    <span
      onClick={onClick}
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${config.className} ${onClick ? 'cursor-pointer hover:opacity-80' : ''}`}
    >
      {config.label}
    </span>
  )
}
