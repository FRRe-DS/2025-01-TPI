import { ProductCard } from './ProductCard';
import { type Product } from '../../services/product.service';
import { useState, useEffect } from 'react';

interface ProductListProps {
  products: Product[];
}

export default function ProductList({ products }: ProductListProps) {
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Efecto para manejar la transición (simplificado)
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600 dark:text-gray-300">No se encontraron productos</h2>
        <p className="text-gray-500 dark:text-gray-400 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
      </div>
    );
  }

  // Apple Store grid layout - Vista cómoda fija
  const getGridClasses = () => {
    return 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 lg:gap-10 xl:gap-12';
  };

  // Apple-style staggered animation
  const getAnimationClass = () => 'apple-product-animate';

  return (
    <div className={getGridClasses()}>
      {products.map((product, index) => (
        <div
          key={product.id}
          className={getAnimationClass()}
          style={{
            animationDelay: `${index * 50}ms`,
            animationFillMode: 'both'
          }}
        >
          <ProductCard
            product={product}
            viewMode="grid"
          />
        </div>
      ))}
    </div>
  );
}