import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Home, Plus, Share2 } from 'lucide-react'
import { useUser } from '../../contexts/UserContext'
import { USERS } from '../../lib/users'
import { UserSelector } from '../collaboration/UserSelector'

interface HeaderProps {
  boardName?: string
}

export function Header({ boardName }: HeaderProps) {
  const { boardId } = useParams()
  const { nickname } = useUser()
  const [showSelector, setShowSelector] = useState(false)

  const currentUser = USERS.find((u) => u.label === nickname)

  function handleShare() {
    const url = window.location.origin + '/b/' + boardId
    navigator.clipboard.writeText(url)
    alert('Link copiado!')
  }

  return (
    <>
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
              <span className="hidden sm:inline">{boardName || 'Branares - Imóveis'}</span>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {boardId && (
              <>
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
              </>
            )}

            <button
              onClick={() => setShowSelector(true)}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 px-2 py-1.5 rounded-lg text-sm transition-colors ml-1"
              title="Trocar usuário"
            >
              <div className="w-7 h-7 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-xs shrink-0">
                {currentUser?.avatar ?? nickname.charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:inline text-gray-200">{nickname}</span>
            </button>
          </div>
        </div>
      </header>

      {showSelector && <UserSelector onDone={() => setShowSelector(false)} />}
    </>
  )
}
