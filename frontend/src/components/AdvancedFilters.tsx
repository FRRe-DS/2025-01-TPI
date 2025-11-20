// src/components/AdvancedFilters.tsx
import { useState, useEffect, useRef } from 'react';
import { getCategories, getBrands, getColors, getPriceRange, type Categoria } from '../services/product.service';

// Apple-style Floating Dropdown Component - Flota sobre todo el layout
function AppleDropdown({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string; }>;
  placeholder: string;
  disabled?: boolean;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState(placeholder);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const selectedOption = options.find(opt => opt.value === value);
    setSelectedLabel(selectedOption?.label || placeholder);
  }, [value, options, placeholder]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      {/* Trigger button */}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200/60 rounded-xl transition-all duration-120 ease-out hover:bg-gray-50/80 hover:border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <span className={`truncate ${value === 'all' || !value ? 'text-gray-500' : 'text-gray-900'}`}>
          {selectedLabel}
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-120 ease-out ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Floating dropdown - Flota sobre TODO el layout sin cortarse */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999] pointer-events-none">
          <div
            className="absolute bg-white border border-gray-200/60 rounded-xl shadow-lg overflow-hidden pointer-events-auto animate-in fade-in slide-in-from-top-1 duration-120 ease-out"
            style={{
              boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
              willChange: 'transform, opacity',
              top: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().bottom + 4 : '100px',
              left: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().left : '50%',
              width: dropdownRef.current ? dropdownRef.current.getBoundingClientRect().width : '200px',
              maxWidth: '320px'
            }}
          >
            <div className="max-h-48 overflow-y-auto scrollbar-hide">
              {options.map((option, index) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleSelect(option.value)}
                  className={`w-full text-left px-4 py-3 text-sm font-medium transition-all duration-120 ease-out hover:bg-gray-50/60 focus:outline-none focus:bg-gray-50/60 ${
                    value === option.value
                      ? 'bg-blue-50/80 text-blue-700 border-r-2 border-blue-500'
                      : 'text-gray-700 hover:text-gray-900'
                  }`}
                  style={{
                    animationDelay: `${index * 20}ms`,
                    animation: 'fadeInUp 120ms ease-out forwards'
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Apple-style Price Input Component
function ApplePriceInput({
  value,
  onChange,
  placeholder,
  className = ''
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  className?: string;
}) {
  return (
    <input
      type="number"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200/60 rounded-xl transition-all duration-120 ease-out hover:bg-gray-50/80 hover:border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 placeholder:text-gray-400 ${className}`}
    />
  );
}

interface AdvancedFiltersProps {
  onFiltersChange: (filters: FilterState) => void;
  initialFilters: FilterState;
}

export interface FilterState {
  category: string;
  q: string;
  marca?: string;
  color?: string;
  precioMin?: number;
  precioMax?: number;
  orden?: string;
}

// Apple-style Filter Bar Component - Barra superior minimalista
export function FilterBar({ onFiltersChange, initialFilters, onToggleAdvanced }: AdvancedFiltersProps & { onToggleAdvanced: () => void }) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const categoriesData = await getCategories();
        setCategories(categoriesData || []);
      } catch (error) {
        console.error('Error loading categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearBasicFilters = () => {
    const clearedFilters = {
      ...filters,
      category: 'all',
      q: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const categoryOptions = [
    { value: 'all', label: loading ? 'Cargando...' : 'Todas las categorías' },
    ...(!loading ? categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.nombre
    })) : [])
  ];

  const hasActiveBasicFilters = filters.category !== 'all' || filters.q !== '';

  return (
    <div className="bg-white rounded-2xl border border-gray-200/40 shadow-sm" style={{ boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)' }}>
      <div className="px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          {/* Title */}
          <h2 className="text-lg font-medium text-gray-900 tracking-tight">
            Filtros
          </h2>

          {/* Filter controls */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1 lg:justify-end">
            {/* Category selector */}
            <div className="flex items-center gap-3 min-w-0 flex-1 sm:flex-initial">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Categoría:
              </span>
              <div className="flex-1 sm:w-48">
                <AppleDropdown
                  value={filters.category}
                  onChange={(value) => handleFilterChange('category', value)}
                  options={categoryOptions}
                  placeholder="Seleccionar categoría"
                />
              </div>
            </div>

            {/* Search input */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <span className="text-sm font-medium text-gray-600 whitespace-nowrap">
                Buscar:
              </span>
              <div className="flex-1 sm:w-64">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={filters.q}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="w-full px-4 py-3 text-sm font-medium text-gray-900 bg-white border border-gray-200/60 rounded-xl transition-all duration-120 ease-out hover:bg-gray-50/80 hover:border-gray-300/60 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/40 placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3">
              {hasActiveBasicFilters && (
                <button
                  onClick={clearBasicFilters}
                  className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50/80 hover:bg-gray-100/90 rounded-lg border border-gray-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-gray-200/20"
                >
                  Limpiar
                </button>
              )}

              <button
                onClick={onToggleAdvanced}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-50/80 rounded-lg border border-gray-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-gray-200/20"
              >
                Filtros avanzados
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Apple Store-style Advanced Filters Panel
export default function AdvancedFilters({ onFiltersChange, initialFilters }: AdvancedFiltersProps) {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [categories, setCategories] = useState<Categoria[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [colors, setColors] = useState<any[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categoriesData, brandsData, colorsData, priceRangeData] = await Promise.all([
          getCategories(),
          getBrands(),
          getColors(),
          getPriceRange()
        ]);
        setCategories(categoriesData || []);
        setBrands(brandsData || []);
        setColors(colorsData || []);
        setPriceRange(priceRangeData || { min: 0, max: 1000 });
      } catch (error) {
        console.error('Error loading filter data:', error);
        setCategories([]);
        setBrands([]);
        setColors([]);
        setPriceRange({ min: 0, max: 1000 });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterChange = (key: keyof FilterState, value: string | number | null) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      category: 'all',
      q: '',
      marca: undefined,
      color: undefined,
      precioMin: undefined,
      precioMax: undefined,
      orden: 'popularidad_desc'
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  // Prepare options for dropdowns
  const categoryOptions = [
    { value: 'all', label: loading ? 'Cargando categorías...' : 'Todas las categorías' },
    ...(!loading ? categories.map(cat => ({
      value: cat.id.toString(),
      label: cat.nombre
    })) : [])
  ];

  const brandOptions = [
    { value: 'all', label: loading ? 'Cargando marcas...' : 'Todas las marcas' },
    ...(!loading ? brands.map(brand => ({
      value: brand.nombre,
      label: brand.nombre
    })) : [])
  ];

  const colorOptions = [
    { value: 'all', label: loading ? 'Cargando colores...' : 'Todos los colores' },
    ...(!loading ? colors.map(color => ({
      value: color.nombre,
      label: color.nombre
    })) : [])
  ];

  const sortOptions = [
    { value: 'popularidad_desc', label: 'Más populares' },
    { value: 'precio_asc', label: 'Precio: menor a mayor' },
    { value: 'precio_desc', label: 'Precio: mayor a menor' },
    { value: 'nombre_asc', label: 'Nombre A-Z' },
    { value: 'nombre_desc', label: 'Nombre Z-A' },
    { value: 'fecha_desc', label: 'Más recientes' },
  ];

  return (
    <>
      {/* Apple-style animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(4px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-2px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .scrollbar-hide {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }

          .scrollbar-hide::-webkit-scrollbar {
            display: none;
          }

          .animate-in {
            animation: fadeInUp 120ms ease-out forwards;
          }

          .fade-in {
            animation: fadeInUp 120ms ease-out forwards;
          }

          .slide-in-from-top-1 {
            animation: slideDown 120ms ease-out forwards;
          }
        `
      }} />

      {/* Apple Store-style Filters Panel */}
      <div className="bg-white rounded-2xl border border-gray-200/60 shadow-lg overflow-hidden"
           style={{ boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)' }}>

        {/* Panel Content with Apple spacing */}
        <div className="p-8">
          {/* Row 1: Marca, Color, Rango de precio */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Marca */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Marca
              </label>
              <AppleDropdown
                value={filters.marca || 'all'}
                onChange={(value) => handleFilterChange('marca', value === 'all' ? undefined : value)}
                options={brandOptions}
                placeholder="Seleccionar marca"
              />
            </div>

            {/* Color */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Color
              </label>
              <AppleDropdown
                value={filters.color || 'all'}
                onChange={(value) => handleFilterChange('color', value === 'all' ? undefined : value)}
                options={colorOptions}
                placeholder="Seleccionar color"
              />
            </div>

            {/* Rango de precio */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Rango de precio
              </label>
              <div className="grid grid-cols-2 gap-3">
                <ApplePriceInput
                  value={filters.precioMin?.toString() || ''}
                  onChange={(value) => handleFilterChange('precioMin', value ? Number(value) : undefined)}
                  placeholder={`$${priceRange.min}`}
                />
                <ApplePriceInput
                  value={filters.precioMax?.toString() || ''}
                  onChange={(value) => handleFilterChange('precioMax', value ? Number(value) : undefined)}
                  placeholder={`$${priceRange.max}`}
                />
              </div>
            </div>
          </div>

          {/* Row 2: Ordenar por, Precios comunes, Limpiar filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-end">
            {/* Ordenar por */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Ordenar por
              </label>
              <AppleDropdown
                value={filters.orden || 'popularidad_desc'}
                onChange={(value) => handleFilterChange('orden', value)}
                options={sortOptions}
                placeholder="Seleccionar orden"
              />
            </div>

            {/* Precios comunes */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Precios comunes
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => {
                    handleFilterChange('precioMin', undefined);
                    handleFilterChange('precioMax', 50);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50/80 hover:bg-gray-100/90 rounded-lg border border-gray-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-gray-200/30"
                >
                  ≤ $50
                </button>
                <button
                  onClick={() => {
                    handleFilterChange('precioMin', 50);
                    handleFilterChange('precioMax', 200);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50/80 hover:bg-gray-100/90 rounded-lg border border-gray-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-gray-200/30"
                >
                  $50 - $200
                </button>
                <button
                  onClick={() => {
                    handleFilterChange('precioMin', 200);
                    handleFilterChange('precioMax', undefined);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50/80 hover:bg-gray-100/90 rounded-lg border border-gray-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-gray-200/30"
                >
                  ≥ $200
                </button>
              </div>
            </div>

            {/* Limpiar filtros - Apple ghost button style */}
            <div className="flex justify-end">
              <button
                onClick={clearAllFilters}
                className="px-6 py-3 text-sm font-medium text-red-600 bg-white hover:bg-red-50/80 rounded-xl border border-red-200/60 transition-all duration-120 ease-out hover:shadow-sm hover:shadow-red-500/20 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                Limpiar todos los filtros
              </button>
            </div>
          </div>

          {/* Active Filters Section */}
          {(filters.marca || filters.color || filters.precioMin !== undefined || filters.precioMax !== undefined || filters.orden !== 'popularidad_desc') && (
            <div className="mt-6 pt-6 border-t border-gray-200/60">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-medium text-gray-600">
                  Filtros activos:
                </span>

                {/* Marca filter badge */}
                {filters.marca && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-50/90 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 text-sm font-medium rounded-lg border border-purple-200/50 dark:border-purple-800/50 transition-all duration-200 ease-out hover:bg-purple-100/95 dark:hover:bg-purple-800/50 hover:shadow-sm hover:shadow-purple-500/10 backdrop-blur-sm">
                    <span>Marca: {filters.marca}</span>
                    <button
                      onClick={() => handleFilterChange('marca', undefined)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-purple-200/60 dark:bg-purple-700/60 hover:bg-purple-300/80 dark:hover:bg-purple-600/80 transition-all duration-150 ease-out hover:scale-110"
                    >
                      <svg className="w-3 h-3 text-purple-600 dark:text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {/* Color filter badge */}
                {filters.color && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-50/90 dark:bg-rose-900/40 text-rose-700 dark:text-rose-300 text-sm font-medium rounded-lg border border-rose-200/50 dark:border-rose-800/50 transition-all duration-200 ease-out hover:bg-rose-100/95 dark:hover:bg-rose-800/50 hover:shadow-sm hover:shadow-rose-500/10 backdrop-blur-sm">
                    <span>Color: {filters.color}</span>
                    <button
                      onClick={() => handleFilterChange('color', undefined)}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-rose-200/60 dark:bg-rose-700/60 hover:bg-rose-300/80 dark:hover:bg-rose-600/80 transition-all duration-150 ease-out hover:scale-110"
                    >
                      <svg className="w-3 h-3 text-rose-600 dark:text-rose-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {/* Price range filter badge */}
                {(filters.precioMin !== undefined || filters.precioMax !== undefined) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-50/90 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 text-sm font-medium rounded-lg border border-amber-200/50 dark:border-amber-800/50 transition-all duration-200 ease-out hover:bg-amber-100/95 dark:hover:bg-amber-800/50 hover:shadow-sm hover:shadow-amber-500/10 backdrop-blur-sm">
                    <span>
                      {filters.precioMin !== undefined && filters.precioMax !== undefined
                        ? `$${filters.precioMin} - $${filters.precioMax}`
                        : filters.precioMin !== undefined
                        ? `Desde $${filters.precioMin}`
                        : `Hasta $${filters.precioMax}`
                      }
                    </span>
                    <button
                      onClick={() => {
                        handleFilterChange('precioMin', undefined);
                        handleFilterChange('precioMax', undefined);
                      }}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-amber-200/60 dark:bg-amber-700/60 hover:bg-amber-300/80 dark:hover:bg-amber-600/80 transition-all duration-150 ease-out hover:scale-110"
                    >
                      <svg className="w-3 h-3 text-amber-600 dark:text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}

                {/* Sort order filter badge */}
                {filters.orden && filters.orden !== 'popularidad_desc' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50/90 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-sm font-medium rounded-lg border border-indigo-200/50 dark:border-indigo-800/50 transition-all duration-200 ease-out hover:bg-indigo-100/95 dark:hover:bg-indigo-800/50 hover:shadow-sm hover:shadow-indigo-500/10 backdrop-blur-sm">
                    <span>
                      {filters.orden === 'precio_asc' ? 'Precio ↑' :
                       filters.orden === 'precio_desc' ? 'Precio ↓' :
                       filters.orden === 'nombre_asc' ? 'A-Z' :
                       filters.orden === 'nombre_desc' ? 'Z-A' :
                       filters.orden === 'fecha_desc' ? 'Más recientes' : 'Orden'}
                    </span>
                    <button
                      onClick={() => handleFilterChange('orden', 'popularidad_desc')}
                      className="w-4 h-4 flex items-center justify-center rounded-full bg-indigo-200/60 dark:bg-indigo-700/60 hover:bg-indigo-300/80 dark:hover:bg-indigo-600/80 transition-all duration-150 ease-out hover:scale-110"
                    >
                      <svg className="w-3 h-3 text-indigo-600 dark:text-indigo-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
