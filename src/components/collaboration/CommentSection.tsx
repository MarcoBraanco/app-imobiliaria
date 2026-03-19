import { useState, useRef } from 'react'
import { Send } from 'lucide-react'
import type { Comment } from '../../types'
import { formatDate } from '../../lib/formatters'
import { useUser } from '../../contexts/UserContext'
import { UserSelector } from './UserSelector'

interface CommentSectionProps {
  comments: Comment[]
  onAddComment: (texto: string) => Promise<void>
}

export function CommentSection({ comments, onAddComment }: CommentSectionProps) {
  const [texto, setTexto] = useState('')
  const [sending, setSending] = useState(false)
  const { hasUser } = useUser()
  const [showSelector, setShowSelector] = useState(false)
  const pendingSubmit = useRef(false)

  async function submitComment() {
    if (!texto.trim()) return
    setSending(true)
    await onAddComment(texto.trim())
    setTexto('')
    setSending(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!texto.trim()) return

    if (!hasUser) {
      pendingSubmit.current = true
      setShowSelector(true)
      return
    }

    await submitComment()
  }

  function handleUserSelected() {
    setShowSelector(false)
    if (pendingSubmit.current) {
      pendingSubmit.current = false
      submitComment()
    }
  }

  return (
    <div className="space-y-4">
      <h3 className="font-medium text-gray-300">
        Comentários ({comments.length})
      </h3>

      {comments.length === 0 && (
        <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
      )}

      <div className="space-y-3 max-h-80 overflow-y-auto">
        {comments.map((c) => (
          <div key={c.id} className="bg-gray-700/50 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-gray-300">{c.autor}</span>
              {c.criadoEm && (
                <span className="text-xs text-gray-500">{formatDate(c.criadoEm)}</span>
              )}
            </div>
            <p className="text-sm text-gray-400">{c.texto}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          className="flex-1 border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="Escreva um comentário..."
        />
        <button
          type="submit"
          disabled={sending || !texto.trim()}
          className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
        >
          <Send size={16} />
        </button>
      </form>

      {showSelector && (
        <UserSelector onDone={handleUserSelected} />
      )}
    </div>
  )
}
