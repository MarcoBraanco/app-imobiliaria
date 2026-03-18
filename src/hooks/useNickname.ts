import { useState, useCallback } from 'react'
import { getNickname, setNickname as saveNickname } from '../lib/visitor'

export function useNickname() {
  const [nickname, setNicknameState] = useState(getNickname)

  const updateNickname = useCallback((name: string) => {
    saveNickname(name)
    setNicknameState(name)
  }, [])

  return { nickname, updateNickname, hasNickname: nickname.length > 0 }
}
