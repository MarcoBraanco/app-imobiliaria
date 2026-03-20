import { useNavigate, useParams, Link } from 'react-router-dom'
import { Header } from '../components/layout/Header'
import { PropertyForm } from '../components/property/PropertyForm'
import { useBoard } from '../hooks/useBoard'
import { useProperties } from '../hooks/useProperties'
import type { PropertyFormData } from '../lib/schema'
import { ArrowLeft } from 'lucide-react'

function centavosToString(centavos: number): string {
  return (centavos / 100).toFixed(2).replace('.', ',')
}

export function EditPropertyPage() {
  const { boardId, propertyId } = useParams<{
    boardId: string
    propertyId: string
  }>()
  const navigate = useNavigate()
  const { board } = useBoard(boardId!)
  const { properties, updateProperty } = useProperties(boardId!)

  const property = properties.find((p) => p.id === propertyId)

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header boardName={board?.nome} />
        <div className="flex items-center justify-center h-64">
          <div className="animate-pulse text-gray-500">Carregando...</div>
        </div>
      </div>
    )
  }

  const defaultValues: Partial<PropertyFormData> = {
    titulo: property.titulo,
    codigoImovel: property.codigoImovel || '',
    bairro: property.bairro,
    endereco: property.endereco,
    aluguel: centavosToString(property.aluguel),
    condominio: centavosToString(property.condominio),
    iptu: centavosToString(property.iptu),
    quartos: property.quartos,
    banheiros: property.banheiros,
    area: property.area ? String(property.area) : '',
    imobiliaria: property.imobiliaria,
    linkAnuncio: property.linkAnuncio,
    fotos: property.fotos.join('\n'),
    descricao: property.descricao || '',
    observacoes: property.observacoes,
  }

  async function handleSubmit(data: PropertyFormData) {
    await updateProperty(propertyId!, data)
    navigate(`/b/${boardId}/imovel/${propertyId}`)
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Header boardName={board?.nome} />

      <main className="max-w-5xl mx-auto px-4 py-4">
        <Link
          to={`/b/${boardId}/imovel/${propertyId}`}
          className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-blue-400 mb-4"
        >
          <ArrowLeft size={16} /> Voltar
        </Link>

        <h2 className="text-xl font-semibold text-gray-100 mb-6">
          Editar Imóvel
        </h2>

        <PropertyForm
          onSubmit={handleSubmit}
          defaultValues={defaultValues}
          submitLabel="Salvar Alterações"
          boardId={boardId}
        />
      </main>
    </div>
  )
}
