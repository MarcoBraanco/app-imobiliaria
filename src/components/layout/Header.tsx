import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Home, Plus, Share2 } from 'lucide-react'

interface HeaderProps {
  boardName?: string
}

export function Header({ boardName }: HeaderProps) {
  const { boardId } = useParams()

  function handleShare() {
    const url = window.location.origin + '/b/' + boardId
    navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }

  return (
    <header className="bg-gray-800 text-gray-100 shadow-md sticky top-0 z-50 border-b border-gray-700">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {boardId && (
            <Link to="/" className="text-gray-400 hover:text-gray-100 transition-colors" title="Tela inicial">
              <ArrowLeft size={20} />
            </Link>
          )}
          <Link to={boardId ? `/b/${boardId}` : '/'} className="flex items-center gap-2 font-bold text-lg">
            <Home size={20} />
            <span className="hidden sm:inline">{boardName || 'Busca Imóveis'}</span>
          </Link>
        </div>

        {boardId && (
          <div className="flex items-center gap-2">
            <Link
              to={`/b/${boardId}/adicionar`}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">Adicionar</span>
            </Link>
            <button
              onClick={handleShare}
              className="flex items-center gap-1 bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              <Share2 size={16} />
              <span className="hidden sm:inline">Compartilhar</span>
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
