import type { Timestamp } from 'firebase/firestore'

export interface Board {
  id: string
  nome: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export type PropertyStatus = 'interessado' | 'agendar_visita' | 'visitado' | 'descartado'

export const KANBAN_COLUMNS: { status: PropertyStatus; label: string; color: string }[] = [
  { status: 'interessado', label: 'Interessados', color: 'blue' },
  { status: 'agendar_visita', label: 'Agendar Visita', color: 'yellow' },
  { status: 'visitado', label: 'Visitados', color: 'green' },
  { status: 'descartado', label: 'Descartados', color: 'gray' },
]

export interface Property {
  id: string
  titulo: string
  codigoImovel: string
  bairro: string
  endereco: string
  aluguel: number // centavos
  condominio: number // centavos
  iptu: number // centavos
  quartos: number
  banheiros: number
  area: number | null
  imobiliaria: string
  linkAnuncio: string
  fotos: string[]
  descricao: string
  observacoes: string
  status: PropertyStatus
  adicionadoPor: string
  criadoEm: Timestamp
  atualizadoEm: Timestamp
}

export interface Comment {
  id: string
  texto: string
  autor: string
  criadoEm: Timestamp
}

export type ReactionType = 'like' | 'dislike' | 'star'

export interface Reaction {
  id: string
  visitorId: string
  tipo: ReactionType
  criadoEm: Timestamp
}
