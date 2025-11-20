// src/components/Product/ProductCard.tsx
import { Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { type Product, calculateTransferPrice } from '../../services/product.service';

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

    // Renderizar según el modo de vista
    if (viewMode === 'list') {
        return (
            <div 
                onClick={handleProductClick}
                className="product-card-list"
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
                    <h3 className="product-card-title">{product.nombre}</h3>
                    <div className="mt-2 space-y-1">
                        {product.precioOriginal && (
                            <p className="product-card-original-price">${product.precioOriginal.toLocaleString('es-AR')}</p>
                        )}
                        <p className="product-card-price">${product.precio.toLocaleString('es-AR')}</p>
                        {transferPrice && (
                            <p className="product-card-transfer-price">
                                ${transferPrice.toLocaleString('es-AR')} con transferencia
                            </p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    if (viewMode === 'compact') {
    return (
        <div 
            onClick={handleProductClick}
            className="product-card-compact"
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
                    <h3 className="product-card-compact-title">{product.nombre}</h3>
                    <div className="flex items-center justify-between">
                        {product.precioOriginal ? (
                            <div className="flex items-center gap-1">
                                <p className="product-card-compact-original-price">${product.precioOriginal.toLocaleString('es-AR')}</p>
                                <p className="product-card-compact-price">${product.precio.toLocaleString('es-AR')}</p>
                            </div>
                        ) : (
                            <p className="product-card-compact-price">${product.precio.toLocaleString('es-AR')}</p>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    // Vista grid por defecto
    return (
        <div 
            onClick={handleProductClick}
            className="product-card-grid"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onKeyDown={handleKeyDown}
            tabIndex={0}
        >
            <div className="relative overflow-hidden">
                <img 
                    src={images[currentImageIndex]?.url || mainImage} 
                    alt={product.nombre} 
                    className="w-full h-48 object-cover group-hover:scale-105 transition-all duration-500 ease-out" 
                    style={{
                        opacity: 1,
                        transform: 'scale(1)'
                    }}
                />

                {/* Botones de navegación del carrusel */}
                {images.length > 1 && (
                    <>
                        {/* Botón anterior */}
                        <button
                            onClick={prevImage}
                            className={`absolute left-3 top-1/2 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-110 active:scale-95 ${
                                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
                            }`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-50%)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            }}
                            onMouseDown={(e) => {
                                // Efecto ripple sutil
                                const ripple = document.createElement('div');
                                const rect = e.currentTarget.getBoundingClientRect();
                                const size = 20;
                                const x = e.clientX - rect.left - size / 2;
                                const y = e.clientY - rect.top - size / 2;
                                
                                ripple.style.cssText = `
                                    position: absolute;
                                    width: ${size}px;
                                    height: ${size}px;
                                    left: ${x}px;
                                    top: ${y}px;
                                    background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
                                    border-radius: 50%;
                                    transform: scale(0);
                                    animation: ripple 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    pointer-events: none;
                                `;
                                
                                e.currentTarget.appendChild(ripple);
                                
                                setTimeout(() => {
                                    ripple.remove();
                                }, 400);
                            }}
                            aria-label="Imagen anterior"
                        >
                            <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                className="text-gray-700 dark:text-gray-300 transition-colors duration-200"
                            >
                                <path 
                                    d="M15 18L9 12L15 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Botón siguiente */}
                        <button
                            onClick={nextImage}
                            className={`absolute right-3 top-1/2 w-9 h-9 rounded-full backdrop-blur-sm flex items-center justify-center transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-110 active:scale-95 ${
                                isHovered ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-2'
                            }`}
                            style={{
                                background: 'rgba(255, 255, 255, 0.9)',
                                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)',
                                border: '1px solid rgba(255, 255, 255, 0.2)',
                                transform: 'translateY(-50%)'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
                                e.currentTarget.style.boxShadow = '0 6px 25px rgba(0, 0, 0, 0.15), 0 2px 6px rgba(0, 0, 0, 0.1)';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)';
                                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(0, 0, 0, 0.08)';
                                e.currentTarget.style.transform = 'translateY(-50%) scale(1)';
                            }}
                            onMouseDown={(e) => {
                                // Efecto ripple sutil
                                const ripple = document.createElement('div');
                                const rect = e.currentTarget.getBoundingClientRect();
                                const size = 20;
                                const x = e.clientX - rect.left - size / 2;
                                const y = e.clientY - rect.top - size / 2;
                                
                                ripple.style.cssText = `
                                    position: absolute;
                                    width: ${size}px;
                                    height: ${size}px;
                                    left: ${x}px;
                                    top: ${y}px;
                                    background: radial-gradient(circle, rgba(0, 0, 0, 0.1) 0%, transparent 70%);
                                    border-radius: 50%;
                                    transform: scale(0);
                                    animation: ripple 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                                    pointer-events: none;
                                `;
                                
                                e.currentTarget.appendChild(ripple);
                                
                                setTimeout(() => {
                                    ripple.remove();
                                }, 400);
                            }}
                            aria-label="Imagen siguiente"
                        >
                            <svg 
                                width="14" 
                                height="14" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                className="text-gray-700 dark:text-gray-300 transition-colors duration-200"
                            >
                                <path 
                                    d="M9 18L15 12L9 6" 
                                    stroke="currentColor" 
                                    strokeWidth="2.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                            </svg>
                        </button>

                        {/* Indicadores de posición */}
                        <div className={`absolute bottom-3 left-1/2 transform -translate-x-1/2 flex space-x-1.5 transition-all duration-300 ${
                            isHovered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                        }`}>
                            {images.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        e.stopPropagation();
                                        setCurrentImageIndex(index);
                                    }}
                                    className={`w-1.5 h-1.5 rounded-full transition-all duration-300 cubic-bezier(0.4, 0, 0.2, 1) hover:scale-125 ${
                                        index === currentImageIndex 
                                            ? 'bg-white shadow-lg scale-125' 
                                            : 'bg-white/50 hover:bg-white/70'
                                    }`}
                                    style={index === currentImageIndex ? {
                                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
                                    } : {}}
                                    aria-label={`Ir a imagen ${index + 1}`}
                                />
                            ))}
                        </div>
                    </>
                )}

                {/* Badges de promociones y stock */}
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
                <h3 className="product-card-title">{product.nombre}</h3>
                <div className="mt-2 space-y-1">
                    {product.precioOriginal && (
                        <p className="product-card-original-price">${product.precioOriginal.toLocaleString('es-AR')}</p>
                    )}
                    <p className="product-card-price">${product.precio.toLocaleString('es-AR')}</p>
                    {transferPrice && (
                        <p className="product-card-transfer-price">
                            ${transferPrice.toLocaleString('es-AR')} con transferencia
                        </p>
                    )}
                    {product.promociones?.cuotasSinInteres && (
                        <p className="product-card-installments">
                            Hasta {product.promociones.cuotasSinInteres} cuotas sin interés
                        </p>
                    )}
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