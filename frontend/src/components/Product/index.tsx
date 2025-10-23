// src/components/Product/index.tsx
import { ProductCard } from './ProductCard';
import { type Product } from '../../services/product.service';

export default function ProductList({ products }: { products: Product[] }) {
  
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-600">No se encontraron productos</h2>
        <p className="text-gray-500 mt-2">Intenta ajustar tus filtros de búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}