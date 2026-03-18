import { useNavigate, useParams } from 'react-router-dom'
import { useState } from 'react'
import { Header } from '../components/layout/Header'
import { PropertyForm } from '../components/property/PropertyForm'
import { NicknamePrompt } from '../components/collaboration/NicknamePrompt'
import { useBoard } from '../hooks/useBoard'
import { useProperties } from '../hooks/useProperties'
import { useNickname } from '../hooks/useNickname'
import type { PropertyFormData } from '../lib/schema'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

export function AddPropertyPage() {
  const { boardId } = useParams<{ boardId: string }>()
  const navigate = useNavigate()
  const { board } = useBoard(boardId!)
  const { addProperty } = useProperties(boardId!)
  const { hasNickname } = useNickname()
  const [showNickname, setShowNickname] = useState(!hasNickname)

  async function handleSubmit(data: PropertyFormData) {
    await addProperty(data)
    navigate(`/b/${boardId}`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header boardName={board?.nome} />

      <main className="max-w-5xl mx-auto px-4 py-4">
        <Link
          to={`/b/${boardId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 mb-4"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h2 className="text-xl font-semibold text-gray-100 mb-6">
          Adicionar Imóvel
        </h2>

        <PropertyForm onSubmit={handleSubmit} />
      </main>

      {showNickname && (
        <NicknamePrompt onDone={() => setShowNickname(false)} />
      )}
    </div>
  )
}
