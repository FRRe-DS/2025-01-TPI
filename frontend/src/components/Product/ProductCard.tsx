// src/components/Product/ProductCard.tsx
import { Link } from 'react-router';
import { type Product, calculateTransferPrice } from '../../services/product.service';

export function ProductCard({ product }: { product: Product }) {
    const mainImage = product.imagenes.find(img => img.esPrincipal)?.url || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    const transferPrice = product.promociones?.transferenciaDescuento 
        ? calculateTransferPrice(product.precio, product.promociones.transferenciaDescuento)
        : null;

    return (
        <Link 
            to={`/product/${product.id}`} 
            className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
        >
            <div className="relative">
                <img src={mainImage} alt={product.nombre} className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300" />
                {product.promociones?.transferenciaDescuento && (
                    <div className="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.promociones.transferenciaDescuento}%
                    </div>
                )}
                {product.stockDisponible <= 5 && product.stockDisponible > 0 && (
                    <div className="absolute top-2 right-2 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Solo {product.stockDisponible}
                    </div>
                )}
                {product.stockDisponible === 0 && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
                        Sin stock
                    </div>
                )}
            </div>
            <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-800 line-clamp-2">{product.nombre}</h3>
                <div className="mt-2 space-y-1">
                    {product.precioOriginal && (
                        <p className="text-sm text-gray-500 line-through">${product.precioOriginal.toLocaleString('es-AR')}</p>
                    )}
                    <p className="text-xl font-bold text-gray-900">${product.precio.toLocaleString('es-AR')}</p>
                    {transferPrice && (
                        <p className="text-sm text-green-600 font-medium">
                            ${transferPrice.toLocaleString('es-AR')} con transferencia
                        </p>
                    )}
                    {product.promociones?.cuotasSinInteres && (
                        <p className="text-xs text-blue-600">
                            Hasta {product.promociones.cuotasSinInteres} cuotas sin interés
                        </p>
                    )}
                </div>
            </div>
        </Link>
    );
}