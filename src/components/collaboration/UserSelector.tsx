import { USERS } from '../../lib/users'
import { useUser } from '../../contexts/UserContext'

interface UserSelectorProps {
  onDone: () => void
}

export function UserSelector({ onDone }: UserSelectorProps) {
  const { nickname, setUser } = useUser()

  function handleSelect(label: string) {
    setUser(label)
    onDone()
  }

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl p-6 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-semibold text-gray-100">Quem é você?</h2>
        <p className="text-sm text-gray-400">
          Escolha seu nome para identificar seus comentários e imóveis.
        </p>
        <div className="flex flex-col gap-3">
          {USERS.map((user) => {
            const isActive = user.label === nickname
            return (
              <button
                key={user.id}
                onClick={() => handleSelect(user.label)}
                className={`flex items-center gap-3 w-full p-3 rounded-lg transition-colors text-left ${
                  isActive
                    ? 'bg-blue-600/20 ring-2 ring-blue-500'
                    : 'bg-gray-700 hover:bg-gray-600'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm shrink-0">
                  {user.avatar}
                </div>
                <span className="text-gray-100 font-medium">{user.label}</span>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
