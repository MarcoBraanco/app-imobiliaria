import { useState } from 'react'
import { useNickname } from '../../hooks/useNickname'

interface NicknamePromptProps {
  onDone: () => void
}

export function NicknamePrompt({ onDone }: NicknamePromptProps) {
  const { updateNickname } = useNickname()
  const [name, setName] = useState('')

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = name.trim()
    if (trimmed) {
      updateNickname(trimmed)
      onDone()
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4"
      >
        <h2 className="text-lg font-semibold text-gray-100">Como podemos te chamar?</h2>
        <p className="text-sm text-gray-400">
          Seu nome aparecerá nos comentários e imóveis que você adicionar.
        </p>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500"
          placeholder="Seu nome ou apelido"
          autoFocus
        />
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => {
              updateNickname('Anônimo')
              onDone()
            }}
            className="flex-1 py-2 rounded-lg text-sm text-gray-400 hover:bg-gray-700 transition-colors"
          >
            Pular
          </button>
          <button
            type="submit"
            disabled={!name.trim()}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            Confirmar
          </button>
        </div>
      </form>
    </div>
  )
}
