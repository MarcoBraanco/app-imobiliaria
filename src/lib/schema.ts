import { z } from 'zod'

export const propertySchema = z.object({
  titulo: z.string().min(1, 'Título é obrigatório'),
  codigoImovel: z.string(),
  bairro: z.string().min(1, 'Bairro é obrigatório'),
  endereco: z.string(),
  aluguel: z.string().min(1, 'Valor do aluguel é obrigatório'),
  condominio: z.string(),
  iptu: z.string(),
  quartos: z.number().min(0, 'Valor inválido'),
  banheiros: z.number().min(0, 'Valor inválido'),
  area: z.string(),
  imobiliaria: z.string(),
  linkAnuncio: z.string(),
  fotos: z.string(),
  descricao: z.string(),
  observacoes: z.string(),
})

export type PropertyFormData = z.infer<typeof propertySchema>

export const boardSchema = z.object({
  nome: z.string().min(1, 'Nome do quadro é obrigatório'),
})

export type BoardFormData = z.infer<typeof boardSchema>
