import { useState, useEffect } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../lib/firebase'

export function useCommentCount(boardId: string, propertyId: string): number {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const col = collection(db, 'boards', boardId, 'properties', propertyId, 'comments')
    const unsub = onSnapshot(col, (snap) => {
      setCount(snap.size)
    })
    return unsub
  }, [boardId, propertyId])

  return count
}
