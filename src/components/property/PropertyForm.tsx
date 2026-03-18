import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { propertySchema, type PropertyFormData } from '../../lib/schema'
import { Link2, Loader2 } from 'lucide-react'

interface PropertyFormProps {
  onSubmit: (data: PropertyFormData) => Promise<void>
  defaultValues?: Partial<PropertyFormData>
  submitLabel?: string
}

const inputClass =
  'w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500'

export function PropertyForm({
  onSubmit,
  defaultValues,
  submitLabel = 'Adicionar Imóvel',
}: PropertyFormProps) {
  const [importUrl, setImportUrl] = useState('')
  const [isImporting, setIsImporting] = useState(false)
  const [importError, setImportError] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(propertySchema),
    defaultValues: {
      titulo: '',
      codigoImovel: '',
      bairro: '',
      endereco: '',
      aluguel: '',
      condominio: '',
      iptu: '',
      quartos: 1,
      banheiros: 1,
      area: '',
      imobiliaria: '',
      linkAnuncio: '',
      fotos: '',
      descricao: '',
      observacoes: '',
      ...defaultValues,
    },
  })

  async function handleImport() {
    if (!importUrl.trim()) return

    setIsImporting(true)
    setImportError('')

    try {
      const res = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: importUrl.trim() }),
      })

      const data = await res.json()

      if (!res.ok) {
        setImportError(data.error || 'Erro ao importar dados')
        return
      }

      const currentTitulo = getValues('titulo')
      const { titulo: _t, ...importData } = data
      reset({ ...importData, titulo: currentTitulo })
    } catch {
      setImportError('Erro de conexão. Tente novamente.')
    } finally {
      setIsImporting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit(data as PropertyFormData))} className="space-y-4 max-w-lg mx-auto">
      <div className="border border-gray-700 rounded-lg p-4 bg-gray-800/50 space-y-3">
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
          <Link2 size={16} />
          Importar da URL
        </label>
        <div className="flex gap-2">
          <input
            type="url"
            value={importUrl}
            onChange={(e) => setImportUrl(e.target.value)}
            className={inputClass}
            placeholder="Cole a URL do anúncio (Lago ou Pirâmide)"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                handleImport()
              }
            }}
          />
          <button
            type="button"
            onClick={handleImport}
            disabled={isImporting || !importUrl.trim()}
            className="shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
          >
            {isImporting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Importando...
              </>
            ) : (
              'Importar'
            )}
          </button>
        </div>
        {importError && (
          <p className="text-red-400 text-xs">{importError}</p>
        )}
        <p className="text-gray-500 text-xs">
          Sites suportados: Lago Imobiliária, Pirâmide Imóveis
        </p>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Título *
        </label>
        <input
          {...register('titulo')}
          className={inputClass}
          placeholder="Ex: Apt 2 quartos Centro"
        />
        {errors.titulo && (
          <p className="text-red-400 text-xs mt-1">{errors.titulo.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Código do imóvel
        </label>
        <input
          {...register('codigoImovel')}
          className={inputClass}
          placeholder="Ref. da imobiliária (ex: AP-12345)"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Bairro *
          </label>
          <input
            {...register('bairro')}
            className={inputClass}
            placeholder="Ex: Centro"
          />
          {errors.bairro && (
            <p className="text-red-400 text-xs mt-1">{errors.bairro.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Endereço
          </label>
          <input
            {...register('endereco')}
            className={inputClass}
            placeholder="Rua, número"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Aluguel (R$) *
          </label>
          <input
            {...register('aluguel')}
            className={inputClass}
            placeholder="1500"
          />
          {errors.aluguel && (
            <p className="text-red-400 text-xs mt-1">{errors.aluguel.message}</p>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Condomínio (R$)
          </label>
          <input
            {...register('condominio')}
            className={inputClass}
            placeholder="500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            IPTU (R$)
          </label>
          <input
            {...register('iptu')}
            className={inputClass}
            placeholder="100"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Quartos
          </label>
          <input
            type="number"
            {...register('quartos', { valueAsNumber: true })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Banheiros
          </label>
          <input
            type="number"
            {...register('banheiros', { valueAsNumber: true })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Área (m²)
          </label>
          <input
            {...register('area')}
            className={inputClass}
            placeholder="65"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Imobiliária
          </label>
          <input
            {...register('imobiliaria')}
            className={inputClass}
            placeholder="Nome da imobiliária"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">
            Link do anúncio
          </label>
          <input
            {...register('linkAnuncio')}
            className={inputClass}
            placeholder="https://..."
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Fotos (URLs, uma por linha)
        </label>
        <textarea
          {...register('fotos')}
          rows={2}
          className={inputClass}
          placeholder="Cole os links das fotos aqui"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Observações
        </label>
        <textarea
          {...register('observacoes')}
          rows={3}
          className={inputClass}
          placeholder="Anotações sobre o imóvel..."
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-1">
          Descrição do anúncio
        </label>
        <textarea
          {...register('descricao')}
          rows={4}
          className={inputClass}
          placeholder="Descrição importada do anúncio"
        />
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
      >
        {isSubmitting ? 'Salvando...' : submitLabel}
      </button>
    </form>
  )
}
