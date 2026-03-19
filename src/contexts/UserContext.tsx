import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { getNickname, setNickname } from '../lib/visitor'

interface UserContextValue {
  nickname: string
  hasUser: boolean
  setUser: (label: string) => void
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: ReactNode }) {
  const [nickname, setNicknameState] = useState(getNickname)

  const setUser = useCallback((label: string) => {
    setNickname(label)
    setNicknameState(label)
  }, [])

  return (
    <UserContext.Provider value={{ nickname, hasUser: nickname.length > 0, setUser }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUser() {
  const ctx = useContext(UserContext)
  if (!ctx) throw new Error('useUser must be used within UserProvider')
  return ctx
}
