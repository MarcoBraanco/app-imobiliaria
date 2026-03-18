import { ThumbsUp, ThumbsDown, Star } from 'lucide-react'
import type { ReactionType } from '../../types'

interface ReactionBarProps {
  getCount: (tipo: ReactionType) => number
  hasReacted: (tipo: ReactionType) => boolean
  onToggle: (tipo: ReactionType) => void
}

const reactions: { tipo: ReactionType; Icon: typeof ThumbsUp; label: string }[] = [
  { tipo: 'like', Icon: ThumbsUp, label: 'Curtir' },
  { tipo: 'dislike', Icon: ThumbsDown, label: 'Não curtir' },
  { tipo: 'star', Icon: Star, label: 'Favoritar' },
]

export function ReactionBar({ getCount, hasReacted, onToggle }: ReactionBarProps) {
  return (
    <div className="flex items-center gap-2">
      {reactions.map(({ tipo, Icon, label }) => {
        const active = hasReacted(tipo)
        const count = getCount(tipo)
        return (
          <button
            key={tipo}
            onClick={() => onToggle(tipo)}
            title={label}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-sm transition-colors ${
              active
                ? 'bg-blue-900/50 text-blue-400'
                : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
            }`}
          >
            <Icon size={14} fill={active ? 'currentColor' : 'none'} />
            {count > 0 && <span>{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
