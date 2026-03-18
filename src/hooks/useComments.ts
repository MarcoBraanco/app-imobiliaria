import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Comment } from '../types'
import { getNickname } from '../lib/visitor'

export function useComments(boardId: string, propertyId: string) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'boards', boardId, 'properties', propertyId, 'comments'),
      orderBy('criadoEm', 'asc')
    )
    const unsub = onSnapshot(q, (snap) => {
      setComments(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment))
      setLoading(false)
    })
    return unsub
  }, [boardId, propertyId])

  async function addComment(texto: string) {
    const col = collection(
      db,
      'boards',
      boardId,
      'properties',
      propertyId,
      'comments'
    )
    await addDoc(col, {
      texto,
      autor: getNickname() || 'Anônimo',
      criadoEm: serverTimestamp(),
    })
  }

  return { comments, loading, addComment }
}
