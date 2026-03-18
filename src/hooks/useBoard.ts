import { useState, useEffect } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Board } from '../types'

export function useBoard(boardId: string) {
  const [board, setBoard] = useState<Board | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'boards', boardId), (snap) => {
      if (snap.exists()) {
        setBoard({ id: snap.id, ...snap.data() } as Board)
      } else {
        setBoard(null)
      }
      setLoading(false)
    })
    return unsub
  }, [boardId])

  return { board, loading }
}
