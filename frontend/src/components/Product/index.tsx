// src/components/Product/index.tsx
import { ProductCard } from './ProductCard';
import { type Product } from '../../services/product.service';

interface ProductListProps {
  products: Product[];
  viewMode?: 'grid' | 'list' | 'compact';
  autoView?: boolean;
}

export default function ProductList({ products, viewMode = 'grid', autoView = false }: ProductListProps) {
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600">No se encontraron productos</h2>
        <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
      </div>
    );
  }

  // Lógica para determinar la vista automáticamente
  const getEffectiveViewMode = () => {
    if (!autoView) return viewMode;
    
    // Siempre usar vista grid por defecto, independientemente de la cantidad de productos
    return 'grid';
  };

  const effectiveViewMode = getEffectiveViewMode();

  // Configuración de clases CSS para cada vista
  const getGridClasses = () => {
    switch (effectiveViewMode) {
      case 'compact':
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3';
      case 'list':
        return 'grid grid-cols-1 gap-4';
      case 'grid':
      default:
        return 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6';
    }
  };

  return (
    <div className={getGridClasses()}>
      {products.map(product => (
        <ProductCard 
          key={product.id} 
          product={product} 
          viewMode={effectiveViewMode}
        />
      ))}
    </div>
  );
}