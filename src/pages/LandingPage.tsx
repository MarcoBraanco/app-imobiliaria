import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { nanoid } from 'nanoid'
import {
  doc,
  setDoc,
  deleteDoc,
  collection,
  getDocs,
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import { Building2, Plus, ChevronRight, Loader2, Trash2, X } from 'lucide-react'
import { useBoards } from '../hooks/useBoards'
import { formatDate } from '../lib/formatters'

export function LandingPage() {
  const [nome, setNome] = useState('')
  const [creating, setCreating] = useState(false)
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const navigate = useNavigate()
  const { boards, loading, error } = useBoards()

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    if (!nome.trim()) return

    setCreating(true)
    const boardId = nanoid(10)
    await setDoc(doc(db, 'boards', boardId), {
      id: boardId,
      nome: nome.trim(),
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    })
    navigate(`/b/${boardId}`)
  }

  async function handleDelete(boardId: string) {
    setDeleting(true)
    try {
      // Delete subcollections (properties and their comments/reactions)
      const propertiesSnap = await getDocs(
        collection(db, 'boards', boardId, 'properties')
      )
      for (const propDoc of propertiesSnap.docs) {
        // Delete comments
        const commentsSnap = await getDocs(
          collection(db, 'boards', boardId, 'properties', propDoc.id, 'comments')
        )
        const commentBatch = writeBatch(db)
        commentsSnap.docs.forEach((d) => commentBatch.delete(d.ref))
        if (commentsSnap.docs.length > 0) await commentBatch.commit()

        // Delete reactions
        const reactionsSnap = await getDocs(
          collection(db, 'boards', boardId, 'properties', propDoc.id, 'reactions')
        )
        const reactionBatch = writeBatch(db)
        reactionsSnap.docs.forEach((d) => reactionBatch.delete(d.ref))
        if (reactionsSnap.docs.length > 0) await reactionBatch.commit()

        // Delete property
        await deleteDoc(propDoc.ref)
      }
      // Delete board
      await deleteDoc(doc(db, 'boards', boardId))
    } finally {
      setDeleting(false)
      setConfirmDeleteId(null)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-950 flex flex-col">
      <div className="flex-1 flex flex-col items-center px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-100 mb-3">
            Branares - Imóveis
          </h1>
          <p className="text-gray-400 text-lg max-w-md">
            Compare apartamentos para alugar de forma colaborativa
          </p>
        </div>

        <form
          onSubmit={handleCreate}
          className="w-full max-w-sm bg-gray-800 rounded-xl shadow-lg p-6 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Novo quadro
            </label>
            <input
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
              placeholder="Ex: Apartamentos Centro SP"
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={creating || !nome.trim()}
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
          >
            <Plus size={18} />
            {creating ? 'Criando...' : 'Criar Quadro'}
          </button>
        </form>

        <div className="w-full max-w-sm mt-10">
          <h2 className="text-lg font-semibold text-gray-200 mb-4">
            Quadros existentes
          </h2>

          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="animate-spin text-gray-500" size={24} />
            </div>
          ) : error ? (
            <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-sm">
              <p className="text-red-400 font-medium mb-1">Erro ao carregar quadros</p>
              <p className="text-red-300/80 text-xs break-all">{error}</p>
            </div>
          ) : boards.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Nenhum quadro criado ainda.
            </p>
          ) : (
            <div className="space-y-2">
              {boards.map((board) => (
                <div key={board.id} className="relative">
                  <div className="flex items-center bg-gray-800 rounded-lg hover:ring-1 hover:ring-gray-600 transition-all group">
                    <Link
                      to={`/b/${board.id}`}
                      className="flex-1 flex items-center gap-3 min-w-0 px-4 py-3"
                    >
                      <Building2 className="text-blue-400 shrink-0" size={20} />
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-100 font-medium truncate">
                          {board.nome}
                        </p>
                        {board.criadoEm && (
                          <p className="text-xs text-gray-500">
                            Criado em {formatDate(board.criadoEm)}
                          </p>
                        )}
                      </div>
                      <ChevronRight
                        className="text-gray-600 group-hover:text-gray-400 shrink-0 transition-colors"
                        size={18}
                      />
                    </Link>
                    <button
                      onClick={() => setConfirmDeleteId(board.id)}
                      className="px-3 py-3 text-gray-600 hover:text-red-400 transition-colors shrink-0"
                      title="Excluir quadro"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {confirmDeleteId === board.id && (
                    <div className="absolute inset-0 z-10 flex items-center bg-gray-900/95 rounded-lg px-4 py-2 backdrop-blur-sm">
                      <p className="text-sm text-gray-300 flex-1">
                        Excluir <strong>{board.nome}</strong>?
                      </p>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deleting}
                          className="px-3 py-1.5 text-sm text-gray-400 hover:text-gray-200 transition-colors"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(board.id)}
                          disabled={deleting}
                          className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                          {deleting ? 'Excluindo...' : 'Confirmar'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
