import { useState, useEffect } from 'react'
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  query,
  orderBy,
} from 'firebase/firestore'
import { db } from '../lib/firebase'
import type { Property, PropertyStatus } from '../types'
import type { PropertyFormData } from '../lib/schema'
import { parseCurrency } from '../lib/formatters'
import { getNickname } from '../lib/visitor'

function normalizeStatus(status: string): PropertyStatus {
  switch (status) {
    case 'novo':
    case 'favorito':
      return 'interessado'
    case 'interessado':
      return 'interessado'
    case 'agendar_visita':
      return 'agendar_visita'
    case 'visitado':
      return 'visitado'
    case 'descartado':
      return 'descartado'
    default:
      return 'interessado'
  }
}

export function useProperties(boardId: string) {
  const [properties, setProperties] = useState<Property[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const q = query(
      collection(db, 'boards', boardId, 'properties'),
      orderBy('criadoEm', 'desc')
    )
    const unsub = onSnapshot(q, (snap) => {
      const items = snap.docs.map((d) => {
        const data = d.data()
        return { id: d.id, ...data, status: normalizeStatus(data.status) } as Property
      })
      setProperties(items)
      setLoading(false)
    })
    return unsub
  }, [boardId])

  async function addProperty(data: PropertyFormData) {
    const col = collection(db, 'boards', boardId, 'properties')
    await addDoc(col, {
      titulo: data.titulo,
      codigoImovel: data.codigoImovel || '',
      bairro: data.bairro,
      endereco: data.endereco || '',
      aluguel: parseCurrency(data.aluguel),
      condominio: parseCurrency(data.condominio || '0'),
      iptu: parseCurrency(data.iptu || '0'),
      quartos: data.quartos,
      banheiros: data.banheiros,
      area: data.area ? parseFloat(data.area) : null,
      imobiliaria: data.imobiliaria || '',
      linkAnuncio: data.linkAnuncio || '',
      fotos: data.fotos
        ? data.fotos
            .split('\n')
            .map((u) => u.trim())
            .filter(Boolean)
        : [],
      descricao: data.descricao || '',
      observacoes: data.observacoes || '',
      status: 'interessado',
      adicionadoPor: getNickname() || 'Anônimo',
      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
    })
  }

  async function updateProperty(
    propertyId: string,
    data: Partial<PropertyFormData> & Record<string, unknown>
  ) {
    const ref = doc(db, 'boards', boardId, 'properties', propertyId)
    const updateData: Record<string, unknown> = {
      ...data,
      atualizadoEm: serverTimestamp(),
    }
    if (data.aluguel) updateData.aluguel = parseCurrency(data.aluguel)
    if (data.condominio)
      updateData.condominio = parseCurrency(data.condominio)
    if (data.iptu) updateData.iptu = parseCurrency(data.iptu)
    if (data.area) updateData.area = parseFloat(data.area)
    if (data.fotos)
      updateData.fotos = data.fotos
        .split('\n')
        .map((u) => u.trim())
        .filter(Boolean)
    await updateDoc(ref, updateData)
  }

  async function removeProperty(propertyId: string) {
    await deleteDoc(doc(db, 'boards', boardId, 'properties', propertyId))
  }

  async function updateStatus(propertyId: string, status: string) {
    const ref = doc(db, 'boards', boardId, 'properties', propertyId)
    await updateDoc(ref, { status, atualizadoEm: serverTimestamp() })
  }

  return { properties, loading, addProperty, updateProperty, removeProperty, updateStatus }
}
