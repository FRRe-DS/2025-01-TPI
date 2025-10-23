// src/components/AdvancedFilters.tsx
import { useState } from 'react';
import { getCategories, getBrands, getColors, getPriceRange } from '../services/product.service';

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  category: string;
  marca: string;
  color: string;
  precioMin: number | null;
  precioMax: number | null;
}

const categories = getCategories();
const brands = getBrands();
const colors = getColors();
const priceRange = getPriceRange();

export default function AdvancedFilters({ onFiltersChange, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const clearedFilters = {
      category: 'all',
      marca: 'all',
      color: 'all',
      precioMin: null,
      precioMax: null
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = filters.category !== 'all' || 
                          filters.marca !== 'all' || 
                          filters.color !== 'all' || 
                          filters.precioMin !== null || 
                          filters.precioMax !== null;

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 mb-8">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800">Filtros Avanzados</h3>
        <div className="flex items-center gap-3">
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-blue-600 hover:text-blue-800 font-medium"
            >
              Limpiar filtros
            </button>
          )}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Categoría */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todas las categorías</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id.toString()}>
                  {cat.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Marca */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Marca
            </label>
            <select
              value={filters.marca}
              onChange={(e) => handleFilterChange('marca', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todas las marcas</option>
              {brands.map(brand => (
                <option key={brand.id} value={brand.nombre}>
                  {brand.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Color
            </label>
            <select
              value={filters.color}
              onChange={(e) => handleFilterChange('color', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            >
              <option value="all">Todos los colores</option>
              {colors.map(color => (
                <option key={color.id} value={color.nombre}>
                  {color.nombre}
                </option>
              ))}
            </select>
          </div>

          {/* Rango de Precio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rango de Precio
            </label>
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Mínimo</label>
                <input
                  type="number"
                  placeholder={`$${priceRange.min}`}
                  value={filters.precioMin || ''}
                  onChange={(e) => handleFilterChange('precioMin', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Máximo</label>
                <input
                  type="number"
                  placeholder={`$${priceRange.max}`}
                  value={filters.precioMax || ''}
                  onChange={(e) => handleFilterChange('precioMax', e.target.value ? parseInt(e.target.value) : null)}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm"
                  min={priceRange.min}
                  max={priceRange.max}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filtros activos */}
      {hasActiveFilters && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-600">Filtros activos:</span>
            {filters.category !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {categories.find(c => c.id.toString() === filters.category)?.nombre}
                <button
                  onClick={() => handleFilterChange('category', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.marca !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.marca}
                <button
                  onClick={() => handleFilterChange('marca', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {filters.color !== 'all' && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                {filters.color}
                <button
                  onClick={() => handleFilterChange('color', 'all')}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            )}
            {(filters.precioMin !== null || filters.precioMax !== null) && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                ${filters.precioMin || priceRange.min} - ${filters.precioMax || priceRange.max}
                <button
                  onClick={() => {
                    handleFilterChange('precioMin', null);
                    handleFilterChange('precioMax', null);
                  }}
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
