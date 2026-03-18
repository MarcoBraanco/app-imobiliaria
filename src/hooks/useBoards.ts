import { useState, useEffect } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Board } from '../types'

export function useBoards() {
  const [boards, setBoards] = useState<Board[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(collection(db, 'boards'), orderBy('criadoEm', 'desc'))
    const unsub = onSnapshot(q, (snap) => {
      setBoards(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Board))
      setLoading(false)
    })
    return unsub
  }, [])

  return { boards, loading }
}
