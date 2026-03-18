import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Reaction, ReactionType } from '../types'
import { getVisitorId } from '../lib/visitor'

export function useReactions(boardId: string, propertyId: string) {
  const [reactions, setReactions] = useState<Reaction[]>([])

  const colPath = `boards/${boardId}/properties/${propertyId}/reactions`

  useEffect(() => {
    const unsub = onSnapshot(collection(db, colPath), (snap) => {
      setReactions(snap.docs.map((d) => ({ id: d.id, ...d.data() }) as Reaction))
    })
    return unsub
  }, [colPath])

  async function toggleReaction(tipo: ReactionType) {
    const visitorId = getVisitorId()
    const col = collection(db, colPath)
    const q = query(col, where('visitorId', '==', visitorId), where('tipo', '==', tipo))
    const snap = await getDocs(q)

    if (snap.empty) {
      await addDoc(col, { visitorId, tipo, criadoEm: serverTimestamp() })
    } else {
      for (const d of snap.docs) {
        await deleteDoc(d.ref)
      }
    }
  }

  function getCount(tipo: ReactionType): number {
    return reactions.filter((r) => r.tipo === tipo).length
  }

  function hasReacted(tipo: ReactionType): boolean {
    const visitorId = getVisitorId()
    return reactions.some((r) => r.visitorId === visitorId && r.tipo === tipo)
  }

  return { reactions, toggleReaction, getCount, hasReacted }
}
