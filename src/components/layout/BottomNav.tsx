import { Link, useParams, useLocation } from 'react-router-dom'
import { List, Plus, Filter } from 'lucide-react'

interface BottomNavProps {
  onToggleFilters?: () => void
}

export function BottomNav({ onToggleFilters }: BottomNavProps) {
  const { boardId } = useParams()
  const location = useLocation()

  if (!boardId) return null

  const isBoard = location.pathname === `/b/${boardId}`

  return (
    <nav className="sm:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 z-50">
      <div className="flex items-center justify-around h-14">
        <Link
          to={`/b/${boardId}`}
          className={`flex flex-col items-center gap-0.5 text-xs ${isBoard ? 'text-blue-400' : 'text-gray-400'}`}
        >
          <List size={20} />
          <span>Imóveis</span>
        </Link>
        <Link
          to={`/b/${boardId}/adicionar`}
          className="flex flex-col items-center gap-0.5 text-xs text-gray-400"
        >
          <div className="bg-blue-600 text-white rounded-full p-2 -mt-4 shadow-lg">
            <Plus size={20} />
          </div>
        </Link>
        <button
          onClick={onToggleFilters}
          className="flex flex-col items-center gap-0.5 text-xs text-gray-400"
        >
          <Filter size={20} />
          <span>Filtros</span>
        </button>
      </div>
    </nav>
  )
}
