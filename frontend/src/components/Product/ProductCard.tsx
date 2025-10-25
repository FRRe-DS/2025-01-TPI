// src/components/Product/ProductCard.tsx
import { Link } from 'react-router';
import { type Product, calculateTransferPrice } from '../../services/product.service';

interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list' | 'compact';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
    const mainImage = product.imagenes.find(img => img.esPrincipal)?.url || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    const transferPrice = product.promociones?.transferenciaDescuento 
        ? calculateTransferPrice(product.precio, product.promociones.transferenciaDescuento)
        : null;

    // Renderizar según el modo de vista
    if (viewMode === 'list') {
        return (
            <Link 
                to={`/product/${product.id}`} 
                className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group flex"
            >
                <div className="relative w-32 h-24 flex-shrink-0">
                    <img src={mainImage} alt={product.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    {product.promociones?.transferenciaDescuento && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold px-1 py-0.5 rounded">
                            -{product.promociones.transferenciaDescuento}%
                        </div>
                    )}
                </div>
                <div className="p-4 flex-1">
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
                    </div>
                </div>
            </Link>
        );
    }

    if (viewMode === 'compact') {
        return (
            <Link 
                to={`/product/${product.id}`} 
                className="bg-white border rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300 group"
            >
                <div className="relative">
                    <img src={mainImage} alt={product.nombre} className="w-full h-20 object-cover group-hover:scale-105 transition-transform duration-300" />
                    {product.promociones?.transferenciaDescuento && (
                        <div className="absolute top-1 left-1 bg-green-500 text-white text-xs font-bold px-1 py-0.5 rounded text-[10px]">
                            -{product.promociones.transferenciaDescuento}%
                        </div>
                    )}
                </div>
                <div className="p-1.5">
                    <h3 className="text-xs font-medium text-gray-800 line-clamp-1 leading-tight mb-1">{product.nombre}</h3>
                    <div className="flex items-center justify-between">
                        {product.precioOriginal ? (
                            <div className="flex items-center gap-1">
                                <p className="text-[10px] text-gray-500 line-through">${product.precioOriginal.toLocaleString('es-AR')}</p>
                                <p className="text-xs font-bold text-gray-900">${product.precio.toLocaleString('es-AR')}</p>
                            </div>
                        ) : (
                            <p className="text-xs font-bold text-gray-900">${product.precio.toLocaleString('es-AR')}</p>
                        )}
                    </div>
                </div>
            </Link>
        );
    }

    // Vista grid por defecto
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