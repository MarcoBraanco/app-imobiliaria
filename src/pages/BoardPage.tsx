import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { BottomNav } from '../components/layout/BottomNav'
import { PropertyList } from '../components/property/PropertyList'
import { KanbanBoard } from '../components/kanban/KanbanBoard'
import {
  PropertyFilters,
  applyFilters,
  useFilters,
} from '../components/property/PropertyFilters'
import { useBoard } from '../hooks/useBoard'
import { useProperties } from '../hooks/useProperties'
import { SlidersHorizontal, Columns3, List } from 'lucide-react'

type ViewMode = 'kanban' | 'list'

export function BoardPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const { board, loading: boardLoading } = useBoard(boardId!)
  const { properties, loading: propsLoading, updateStatus } = useProperties(boardId!)
  const { filters, setFilters, showFilters, setShowFilters } = useFilters()
  const [viewMode, setViewMode] = useState<ViewMode>(
    () => (localStorage.getItem('viewMode') as ViewMode) || 'kanban'
  )

  function handleViewChange(mode: ViewMode) {
    setViewMode(mode)
    localStorage.setItem('viewMode', mode)
  }

  if (boardLoading || propsLoading) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </>
    )
  }

  if (!board) {
    return (
      <>
        <Header />
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-400">Quadro não encontrado</p>
        </div>
      </>
    )
  }

  const filtered = applyFilters(properties, filters)

  return (
    <div className="min-h-screen bg-gray-950 pb-20 sm:pb-4">
      <Header boardName={board.nome} />

      <main className={`mx-auto px-4 py-4 space-y-4 ${viewMode === 'kanban' ? 'max-w-7xl' : 'max-w-5xl'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">{board.nome}</h2>
            <p className="text-sm text-gray-500">
              {filtered.length} imóve{filtered.length !== 1 ? 'is' : 'l'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center bg-gray-800 rounded-lg p-0.5">
              <button
                onClick={() => handleViewChange('kanban')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'kanban'
                    ? 'bg-gray-700 text-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Kanban"
              >
                <Columns3 size={16} />
              </button>
              <button
                onClick={() => handleViewChange('list')}
                className={`p-1.5 rounded-md transition-colors ${
                  viewMode === 'list'
                    ? 'bg-gray-700 text-blue-400'
                    : 'text-gray-400 hover:text-gray-300'
                }`}
                title="Lista"
              >
                <List size={16} />
              </button>
            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="hidden sm:flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 transition-colors"
            >
              <SlidersHorizontal size={16} />
              Filtros
            </button>
          </div>
        </div>

        <PropertyFilters
          properties={properties}
          filters={filters}
          onFiltersChange={setFilters}
          visible={showFilters}
          onClose={() => setShowFilters(false)}
        />

        {viewMode === 'kanban' ? (
          <KanbanBoard properties={filtered} boardId={boardId!} updateStatus={updateStatus} />
        ) : (
          <PropertyList properties={filtered} boardId={boardId!} />
        )}
      </main>

      <BottomNav onToggleFilters={() => setShowFilters(!showFilters)} />
    </div>
  )
}
