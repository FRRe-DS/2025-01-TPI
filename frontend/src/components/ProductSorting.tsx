// src/components/ProductSorting.tsx
interface ProductSortingProps {
  currentSort: string;
  onSortChange: (sortBy: string) => void;
  totalProducts: number;
}

const sortOptions = [
  { value: 'popularidad_desc', label: 'Más populares' },
  { value: 'precio_asc', label: 'Precio: menor a mayor' },
  { value: 'precio_desc', label: 'Precio: mayor a menor' },
  { value: 'nombre_asc', label: 'Nombre: A-Z' },
  { value: 'nombre_desc', label: 'Nombre: Z-A' },
  { value: 'fecha_desc', label: 'Más recientes' },
];

export default function ProductSorting({ currentSort, onSortChange, totalProducts }: ProductSortingProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-blue-300">
          Mostrando {totalProducts} producto{totalProducts !== 1 ? 's' : ''}
        </span>
      </div>
      
      <div className="flex items-center gap-3">
        <label className="text-sm font-medium text-gray-700 dark:text-white">
          Ordenar por:
        </label>
        <select
          value={currentSort}
          onChange={(e) => onSortChange(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-blue-500 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-blue-700 text-gray-800 dark:text-white min-w-[200px]"
        >
          {sortOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
