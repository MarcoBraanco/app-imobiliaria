import { nanoid } from 'nanoid'

const VISITOR_KEY = 'busca-imoveis-visitor-id'
const NICKNAME_KEY = 'busca-imoveis-nickname'

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY)
  if (!id) {
    id = nanoid(12)
    localStorage.setItem(VISITOR_KEY, id)
  }
  return id
}

export function getNickname(): string {
  return localStorage.getItem(NICKNAME_KEY) || ''
}

export function setNickname(name: string): void {
  localStorage.setItem(NICKNAME_KEY, name)
}
