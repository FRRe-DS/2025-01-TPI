// src/components/AdvancedFilters.tsx
import { useState, useEffect } from 'react';
import { getCategories, type Categoria } from '../services/product.service';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  category: string;
  q: string;
}

export default function AdvancedFilters({ onFiltersChange, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
        // Fallback: categorías vacías
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      q: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.category !== 'all' || filters.q !== '';

  return (
    <div className="advanced-filters-container">
      <div className="advanced-filters-header">
        <h3 className="advanced-filters-title">Filtros Avanzados</h3>
        <div className="advanced-filters-actions">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="advanced-filters-clear"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="advanced-filters-toggle"
          >
            <span className="text-sm font-medium">
              {isExpanded ? 'Ocultar' : 'Mostrar'} filtros
            </span>
            <svg 
              className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="advanced-filters-grid">
          {/* Categoría */}
          <div>
            <label className="advanced-filters-label">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="advanced-filters-select"
              disabled={loadingCategories}
            >
              <option value="all">
                {loadingCategories ? 'Cargando categorías...' : 'Todas las categorías'}
              </option>
              {!loadingCategories && categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Búsqueda */}
          <div>
            <label className="advanced-filters-label">
              Buscar productos
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre..."
              value={filters.q}
              onChange={(e) => handleFilterChange('q', e.target.value)}
              className="advanced-filters-input"
            />
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="advanced-filters-active">
          <div className="flex flex-wrap gap-2">
            <span className="advanced-filters-active-text">Filtros activos:</span>
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {categories?.find(c => c.id.toString() === filters.category)?.nombre || 'Categoría'}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.q && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                "{filters.q}"
                <button
                  onClick={() => handleFilterChange('q', '')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
