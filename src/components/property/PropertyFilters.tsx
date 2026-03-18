import { useState } from 'react'
import { X, SlidersHorizontal } from 'lucide-react'
import type { Property, PropertyStatus } from '../../types'

export interface Filters {
  status: PropertyStatus[]
  bairro: string
  precoMin: string
  precoMax: string
  quartosMin: string
  ordenar: string
}

const defaultFilters: Filters = {
  status: [],
  bairro: '',
  precoMin: '',
  precoMax: '',
  quartosMin: '',
  ordenar: 'recente',
}

interface PropertyFiltersProps {
  properties: Property[]
  filters: Filters
  onFiltersChange: (f: Filters) => void
  visible: boolean
  onClose: () => void
}

const statusOptions: { value: PropertyStatus; label: string }[] = [
  { value: 'interessado', label: 'Interessado' },
  { value: 'agendar_visita', label: 'Agendar Visita' },
  { value: 'visitado', label: 'Visitado' },
  { value: 'descartado', label: 'Descartado' },
]

const sortOptions = [
  { value: 'recente', label: 'Mais recente' },
  { value: 'preco-asc', label: 'Menor preço' },
  { value: 'preco-desc', label: 'Maior preço' },
]

const inputClass =
  'w-full border border-gray-600 bg-gray-700 text-gray-100 rounded-lg px-3 py-1.5 text-sm placeholder-gray-500'

export function useFilters() {
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [showFilters, setShowFilters] = useState(false)
  return { filters, setFilters, showFilters, setShowFilters }
}

export function applyFilters(properties: Property[], filters: Filters): Property[] {
  let result = [...properties]

  if (filters.status.length > 0) {
    result = result.filter((p) => filters.status.includes(p.status))
  }
  if (filters.bairro) {
    result = result.filter((p) => p.bairro === filters.bairro)
  }
  if (filters.precoMin) {
    const min = parseFloat(filters.precoMin) * 100
    result = result.filter((p) => p.aluguel >= min)
  }
  if (filters.precoMax) {
    const max = parseFloat(filters.precoMax) * 100
    result = result.filter((p) => p.aluguel <= max)
  }
  if (filters.quartosMin) {
    const min = parseInt(filters.quartosMin)
    result = result.filter((p) => p.quartos >= min)
  }

  switch (filters.ordenar) {
    case 'preco-asc':
      result.sort((a, b) => a.aluguel - b.aluguel)
      break
    case 'preco-desc':
      result.sort((a, b) => b.aluguel - a.aluguel)
      break
    case 'recente':
    default:
      break
  }

  return result
}

export function PropertyFilters({
  properties,
  filters,
  onFiltersChange,
  visible,
  onClose,
}: PropertyFiltersProps) {
  const bairros = [...new Set(properties.map((p) => p.bairro))].sort()

  function toggleStatus(s: PropertyStatus) {
    const current = filters.status
    const next = current.includes(s)
      ? current.filter((x) => x !== s)
      : [...current, s]
    onFiltersChange({ ...filters, status: next })
  }

  if (!visible) return null

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-300 flex items-center gap-1">
          <SlidersHorizontal size={16} /> Filtros
        </h3>
        <button onClick={onClose} className="text-gray-500 hover:text-gray-300">
          <X size={18} />
        </button>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Status</label>
        <div className="flex flex-wrap gap-2">
          {statusOptions.map((s) => (
            <button
              key={s.value}
              onClick={() => toggleStatus(s.value)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filters.status.includes(s.value)
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-400 hover:bg-gray-600'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-gray-400 block mb-1">Bairro</label>
        <select
          value={filters.bairro}
          onChange={(e) => onFiltersChange({ ...filters, bairro: e.target.value })}
          className={inputClass}
        >
          <option value="">Todos</option>
          {bairros.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Preço mín (R$)</label>
          <input
            type="number"
            value={filters.precoMin}
            onChange={(e) => onFiltersChange({ ...filters, precoMin: e.target.value })}
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Preço máx (R$)</label>
          <input
            type="number"
            value={filters.precoMax}
            onChange={(e) => onFiltersChange({ ...filters, precoMax: e.target.value })}
            className={inputClass}
            placeholder="10000"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-gray-400 block mb-1">Quartos mín</label>
          <input
            type="number"
            value={filters.quartosMin}
            onChange={(e) =>
              onFiltersChange({ ...filters, quartosMin: e.target.value })
            }
            className={inputClass}
            placeholder="0"
          />
        </div>
        <div>
          <label className="text-xs text-gray-400 block mb-1">Ordenar por</label>
          <select
            value={filters.ordenar}
            onChange={(e) => onFiltersChange({ ...filters, ordenar: e.target.value })}
            className={inputClass}
          >
            {sortOptions.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() =>
          onFiltersChange({ ...defaultFilters })
        }
        className="text-xs text-blue-400 hover:underline"
      >
        Limpar filtros
      </button>
    </div>
  )
}
