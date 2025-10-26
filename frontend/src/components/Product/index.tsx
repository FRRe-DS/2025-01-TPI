import { ProductCard } from './ProductCard';
import { type Product } from '../../services/product.service';
import { useState, useEffect } from 'react';

interface ProductListProps {
  products: Product[];
  viewMode?: 'grid' | 'list' | 'compact';
}

export default function ProductList({ products, viewMode = 'grid' }: ProductListProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Efecto para manejar la transición cuando cambia el modo de vista
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, [viewMode]);
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-blue-300">No se encontraron productos</h2>
        <p className="text-gray-500 dark:text-blue-400 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
      </div>
    );
  }

  // Configuración de clases CSS para cada vista
  const getGridClasses = () => {
    const baseClasses = 'products-grid-transition';
    const transitionClass = isTransitioning ? 'view-transition' : '';
    
    switch (viewMode) {
      case 'compact':
        return `${baseClasses} ${transitionClass} grid grid-cols-10 gap-1`;
      case 'list':
        return `${baseClasses} ${transitionClass} grid grid-cols-1 gap-4`;
      case 'grid':
      default:
        return `${baseClasses} ${transitionClass} grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`;
    }
  };

  // Clase de animación específica para cada modo de vista
  const getAnimationClass = () => {
    switch (viewMode) {
      case 'compact':
        return 'product-card-animate-compact';
      case 'list':
        return 'product-card-animate-list';
      case 'grid':
      default:
        return 'product-card-animate';
    }
  };

  return (
    <div className={getGridClasses()}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className={getAnimationClass()}
          style={{
            animationDelay: `${index * 30}ms`,
            animationFillMode: 'both'
          }}
        >
          <ProductCard 
            product={product} 
            viewMode={viewMode}
          />
        </div>
      ))}
    </div>
  );
}