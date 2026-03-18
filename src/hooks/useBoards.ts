import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Board } from '../types'

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const q = query(collection(db, 'boards'), orderBy('criadoEm', 'desc'))
    const unsub = onSnapshot(
      q,
      (snap) => {
        setBoards(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Board))
        setLoading(false)
      },
      (err) => {
        console.error('Firestore useBoards error:', err)
        setError(err.message)
        setLoading(false)
      }
    )
    return unsub
  }, [])

  return { boards, loading, error }
}
