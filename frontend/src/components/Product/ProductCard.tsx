// src/components/Product/ProductCard.tsx
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { type Product, calculateTransferPrice } from '../../services/product.service';

// Apple Store-style Product Card Component
interface ProductCardProps {
  product: Product;
  viewMode?: 'grid' | 'list' | 'compact';
}

export function ProductCard({ product, viewMode = 'grid' }: ProductCardProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const navigate = useNavigate();
    const images = product.imagenes || [];
    const mainImage = images.find(img => img.esPrincipal)?.url || images[0]?.url || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    const transferPrice = product.promociones?.transferenciaDescuento
        ? calculateTransferPrice(product.precio, product.promociones.transferenciaDescuento)
        : null;

    // Resetear índice cuando cambia el producto
    useEffect(() => {
        setCurrentImageIndex(0);
    }, [product.id]);

    const nextImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const nextIndex = (currentImageIndex + 1) % images.length;
        setCurrentImageIndex(nextIndex);
    };

    const prevImage = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const prevIndex = (currentImageIndex - 1 + images.length) % images.length;
        setCurrentImageIndex(prevIndex);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'ArrowLeft') {
            e.preventDefault();
            prevImage(e as any);
        } else if (e.key === 'ArrowRight') {
            e.preventDefault();
            nextImage(e as any);
        }
    };

    const handleProductClick = () => {
        navigate(`/product/${product.id}`);
    };

    // Apple Store-style Product Card - Altura fija para consistencia
    return (
        <div
            onClick={handleProductClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
            className="group relative bg-white rounded-2xl cursor-pointer transition-all duration-300 ease-out hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1 will-change-transform h-full flex flex-col"
            style={{
                boxShadow: '0 4px 18px rgba(0, 0, 0, 0.08)',
            }}
        >
            {/* Imagen principal - Altura consistente */}
            <div className="relative overflow-hidden rounded-t-2xl flex-shrink-0">
                <div className="aspect-[4/3] overflow-hidden">
                    <img
                        src={images[currentImageIndex]?.url || mainImage}
                        alt={product.nombre}
                        className="w-full h-full object-cover transition-all duration-500 ease-out group-hover:scale-[1.02]"
                        style={{
                            borderTopLeftRadius: '16px',
                            borderTopRightRadius: '16px'
                        }}
                    />
                </div>

                {/* Overlay sutil en hover */}
                <div className={`absolute inset-0 bg-black/0 transition-all duration-300 ease-out ${isHovered ? 'bg-black/5' : ''}`} />

                {/* Badges minimalistas */}
                {product.promociones?.transferenciaDescuento && (
                    <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-semibold px-3 py-1.5 rounded-full border border-white/50">
                        -{product.promociones.transferenciaDescuento}%
                    </div>
                )}

                {product.stockDisponible <= 5 && product.stockDisponible > 0 && (
                    <div className="absolute top-4 right-4 bg-orange-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full">
                        Solo {product.stockDisponible}
                    </div>
                )}

                {product.stockDisponible === 0 && (
                    <div className="absolute top-4 right-4 bg-red-500/90 backdrop-blur-sm text-white text-sm font-medium px-3 py-1.5 rounded-full">
                        Sin stock
                    </div>
                )}

                {/* Navegación de imágenes - Minimalista */}
                {images.length > 1 && isHovered && (
                    <>
                        <button
                            onClick={prevImage}
                            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 shadow-lg"
                            aria-label="Imagen anterior"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                                <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        <button
                            onClick={nextImage}
                            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 backdrop-blur-sm hover:bg-white/90 rounded-full flex items-center justify-center transition-all duration-200 ease-out hover:scale-105 shadow-lg"
                            aria-label="Imagen siguiente"
                        >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-gray-700">
                                <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                        </button>

                        {/* Indicadores minimalistas */}
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1.5">
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ease-out ${
                                        index === currentImageIndex
                                            ? 'bg-white shadow-sm scale-125'
                                            : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                    aria-label={`Ir a imagen ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Contenido de texto - Altura flexible para consistencia */}
            <div className="px-6 py-6 flex flex-col flex-1">
                {/* Nombre del producto - Altura consistente */}
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 leading-tight line-clamp-2 min-h-[3.5rem]">
                        {product.nombre}
                    </h3>
                </div>

                {/* Precios - Siempre al final para alineación */}
                <div className="mt-auto">
                    <div className="space-y-1">
                        {product.precioOriginal && (
                            <p className="text-sm text-gray-500 line-through">
                                ${product.precioOriginal.toLocaleString('es-AR')}
                            </p>
                        )}
                        <p className="text-2xl font-bold text-gray-900">
                            ${product.precio.toLocaleString('es-AR')}
                        </p>

                        {/* Información adicional sutil */}
                        <div className="space-y-0.5 mt-3">
                            {transferPrice && (
                                <p className="text-sm text-green-600 font-medium">
                                    ${transferPrice.toLocaleString('es-AR')} con transferencia
                                </p>
                            )}
                            {product.promociones?.cuotasSinInteres && (
                                <p className="text-sm text-blue-600 font-medium">
                                    Hasta {product.promociones.cuotasSinInteres} cuotas sin interés
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Estilos CSS para las animaciones
const styles = `
    @keyframes ripple {
        0% {
            transform: scale(0);
            opacity: 1;
        }
        100% {
            transform: scale(2);
            opacity: 0;
        }
    }
`;

// Inyectar estilos en el documento
if (typeof document !== 'undefined') {
    const styleSheet = document.createElement('style');
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
}