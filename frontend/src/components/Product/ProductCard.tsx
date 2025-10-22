// src/components/Product/ProductCard.tsx
import { Link } from 'react-router';
import { type Product } from '../../services/product.service';

export function ProductCard({ product }: { product: Product }) {
    const mainImage = product.imagenes.find(img => img.esPrincipal)?.url || 'https://via.placeholder.com/300';

    return (
        <Link 
            to={`/product/${product.id}`} 
            className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
        >
        <img src={mainImage} alt={product.nombre} className="w-full h-48 object-cover" />
        <div className="p-4">
            <h3 className="text-lg font-semibold text-gray-800">{product.nombre}</h3>
            <p className="text-xl font-bold text-gray-900 mt-2">${product.precio.toFixed(2)}</p>
        </div>
    </Link>
    );
}