import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from 'react-oidc-context';
import { type Product, getProductById, getProductByIdFromStock, getProductVariant, getRelatedProducts, calculateTransferPrice, calculateInstallmentPrice } from '../services/product.service';
import { getAccessToken } from '../services/auth/getAccessToken';
import { useCart } from '../contexts/CartContext';
import { notificationManager } from '../utils/notifications';
import './product.css';

export default function ProductPage() {
  const { id } = useParams();
  const auth = useAuth();
  const { addItem, items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
  const { isDark } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showCartSidebar, setShowCartSidebar] = useState(false);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [cartAnimating, setCartAnimating] = useState(false);
  const [relatedProductsPage, setRelatedProductsPage] = useState(0);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = parseInt(id || '0');
        let foundProduct: Product | null = null;

        // Intentar obtener del backend de stock si el usuario está autenticado
        if (auth.isAuthenticated && auth.user) {
          const token = getAccessToken(auth.user);
          if (token) {
            try {
              foundProduct = await getProductByIdFromStock(productId, token);
            } catch (error) {
              // Fallback silencioso
            }
          }
        }

        // Fallback a la API regular si no se pudo obtener del stock
        if (!foundProduct) {
          foundProduct = await getProductById(productId);
        }

        setProduct(foundProduct);
        if (foundProduct) {
          setCurrentPrice(foundProduct.precio);
          setCurrentStock(foundProduct.stockDisponible);

          // Cargar productos relacionados y resetear página
          const related = await getRelatedProducts(productId, 12); // Cargar más productos para paginación
          setRelatedProducts(related);
          setRelatedProductsPage(0); // Resetear a primera página
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [id, auth.isAuthenticated, auth.user]);

  // Auto-cambio de imágenes cada 5 segundos
  useEffect(() => {
    if (!product) return;
    
    const productImages = product.imagenes && product.imagenes.length > 0
      ? product.imagenes.map(img => img.url)
      : ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'];
    
    
    if (productImages.length <= 1) {
      return;
    }
    
    
    const interval = setInterval(() => {
      setCurrentImageIndex(prev => {
        const nextIndex = prev === productImages.length - 1 ? 0 : prev + 1;
        return nextIndex;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [product?.id, product?.imagenes?.length]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-400">Cargando producto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">Producto no encontrado</h1>
          <Link to="/" className="text-green-600 hover:text-green-700">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Obtener todas las imágenes del producto
  const productImages = product.imagenes && product.imagenes.length > 0
    ? product.imagenes.map(img => img.url)
    : ['https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80'];
  
  const mainImage = productImages[currentImageIndex];

  // Funciones simples para manejo de imágenes
  const handleImageError = () => {
  };

  const handleImageLoad = () => {
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    if (!auth.isAuthenticated) {
      // Redirigir al login si no está autenticado
      auth.signinRedirect();
      return;
    }
    
    setIsAddingToCart(true);
    
    try {
      // Agregar al carrito usando el contexto (ahora usa el backend)
      await addItem(product, quantity);
      
      setCartAnimating(true);
      setShowCartSidebar(true);
      
      // Reset animation state
      setTimeout(() => setCartAnimating(false), 300);
    } catch (error: any) {
      console.error('Error adding to cart:', error);
      notificationManager.error(
        'Error al agregar producto',
        error.message || 'Por favor, intenta nuevamente.'
      );
    } finally {
      setIsAddingToCart(false);
    }
  };

  // Navegación de productos relacionados
  const PRODUCTS_PER_PAGE = 4;
  const totalPages = Math.ceil(relatedProducts.length / PRODUCTS_PER_PAGE);


  const nextRelatedProducts = () => {
    setRelatedProductsPage((prev) => (prev + 1) % totalPages);
  };

  const prevRelatedProducts = () => {
    setRelatedProductsPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Obtener productos de la página actual
  const getCurrentPageProducts = () => {
    const start = relatedProductsPage * PRODUCTS_PER_PAGE;
    const end = start + PRODUCTS_PER_PAGE;
    return relatedProducts.slice(start, end);
  };

  return (
    <div className={`min-h-screen py-12 ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-white'}`} data-theme-aware>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            {/* Carrusel de imágenes - Mantener intacto */}
            <div className="relative">
              <div className="relative group">
                <img 
                  src={mainImage} 
                  alt={product.nombre}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-sm transition-all duration-500"
                />
                
                {/* Navegación con flechas */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? productImages.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black dark:bg-gray-800 bg-opacity-50 hover:bg-opacity-70 dark:hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black dark:bg-gray-800 bg-opacity-50 hover:bg-opacity-70 dark:hover:bg-gray-700 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </>
                )}
              </div>
              
              {/* Indicadores (puntitos) */}
              {productImages.length > 1 && (
                <div className="flex justify-center mt-4 space-x-2">
                  {productImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentImageIndex
                          ? 'bg-blue-900 dark:bg-blue-700 w-8'
                          : 'bg-gray-300 dark:bg-gray-500 hover:bg-gray-500 dark:hover:bg-gray-400'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del producto - Estilo Apple premium */}
            <div className="space-y-10">
              {/* Nombre del producto - SF Pro Display */}
              <div className="space-y-4">
                <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight tracking-tight" style={{ color: isDark ? '#ffffff' : undefined }}>
                  {product.nombre}
                </h1>

                {/* Precio - Elegante y destacado */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ color: isDark ? '#ffffff' : undefined }}>
                    ${currentPrice.toLocaleString('es-AR')}
                  </span>
                </div>

                {/* Disponibilidad - Sutil Apple style */}
                {currentStock > 0 && currentStock <= 5 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                    <span className="text-orange-600 dark:text-orange-400 font-medium">
                      Solo quedan {currentStock} unidades
                    </span>
                  </div>
                )}
                {currentStock === 0 && (
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 rounded-full bg-red-500"></div>
                    <span className="text-red-600 dark:text-red-400 font-medium">
                      Sin stock
                    </span>
                  </div>
                )}
              </div>


            {/* Selector de cantidad y acciones - Apple premium */}
            <div className="space-y-6">
              {/* Selector de cantidad - Limpio y minimalista */}
              <div className="flex items-center gap-4">
                <label className="text-sm font-medium text-gray-700" style={{ color: isDark ? '#ffffff' : undefined }}>Cantidad:</label>
                <div className="flex items-center bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200/60 dark:border-gray-600">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={showCartSidebar}
                    className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-l-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                    </svg>
                  </button>
                  <span className="px-6 py-3 text-gray-900 dark:text-white font-medium min-w-[60px] text-center bg-white dark:bg-gray-800">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={showCartSidebar}
                    className="px-4 py-3 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100/80 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 rounded-r-xl"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Botones de acción - Premium Apple style */}
              <div className="space-y-3">
                <button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || currentStock === 0 || showCartSidebar}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 text-lg"
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Agregar al carrito
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Información de envío y pagos - Estilo Apple limpio */}
            <div className="rounded-2xl p-8 space-y-6 border border-gray-100/60 dark:border-gray-600/60 bg-gray-50/50 dark:bg-white/5">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium" style={{ color: isDark ? '#ffffff' : undefined }}>Envío</span>
                  <span className="text-gray-900 dark:text-white font-semibold" style={{ color: isDark ? '#ffffff' : undefined }}>24-48 horas</span>
                </div>

                <div className="border-t border-gray-200/60 dark:border-gray-600/60 pt-4">
                  <div className="space-y-2">
                    <span className="text-gray-600 text-sm font-medium" style={{ color: isDark ? '#ffffff' : undefined }}>Métodos de pago</span>
                    <div className="flex items-center gap-3 text-gray-700" style={{ color: isDark ? '#ffffff' : undefined }}>
                      <span className="text-sm">Visa</span>
                      <span className="text-gray-400" style={{ color: isDark ? '#9ca3af' : undefined }}>•</span>
                      <span className="text-sm">Mastercard</span>
                      <span className="text-gray-400" style={{ color: isDark ? '#9ca3af' : undefined }}>•</span>
                      <span className="text-sm">Transferencia</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
        </div>

        {/* Información detallada del producto - Flujo vertical completo */}
        <div className="mt-12">
          <section className={`relative rounded-2xl p-5 md:p-6 border transition-all duration-300 ${
            isDark 
              ? 'border-gray-600/60 bg-white/5' 
              : 'border-gray-100/60 bg-gray-50/50'
          }`}>
            
            <div className="relative max-w-4xl mx-auto space-y-6">
              {/* Descripción principal - Mejorada */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-1 h-6 rounded-full ${
                    isDark ? 'bg-gradient-to-b from-blue-500 to-purple-500' : 'bg-gradient-to-b from-blue-600 to-indigo-600'
                  }`}></div>
                  <h2 className={`text-lg md:text-xl font-bold tracking-tight ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Descripción del producto
                  </h2>
                </div>
                <div className={`relative pl-4 border-l-2 ${
                  isDark ? 'border-slate-700' : 'border-gray-200'
                }`}>
                  <p className={`text-sm md:text-base leading-relaxed ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    {product.descripcion}
                  </p>
                </div>
              </div>

              {/* Especificaciones técnicas - Mejoradas */}
              {product.dimensiones && (
                <div className={`pt-5 border-t ${
                  isDark ? 'border-slate-700/50' : 'border-gray-200/60'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${
                      isDark ? 'bg-slate-700/50' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        isDark ? 'text-blue-400' : 'text-blue-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <h3 className={`text-base font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Especificaciones técnicas
                    </h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className={`p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                      isDark 
                        ? 'bg-slate-800/50 border border-slate-700/50 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10' 
                        : 'bg-white border border-gray-200/60 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-100'
                    }`}>
                      <div className="flex items-center gap-2 mb-1">
                        <svg className={`w-4 h-4 ${
                          isDark ? 'text-blue-400' : 'text-blue-600'
                        }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                        </svg>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${
                          isDark ? 'text-gray-400' : 'text-gray-500'
                        }`}>
                          Dimensiones
                        </span>
                      </div>
                      <p className={`text-base font-bold ${
                        isDark ? 'text-white' : 'text-gray-900'
                      }`}>
                        {product.dimensiones.largoCm} × {product.dimensiones.anchoCm} × {product.dimensiones.altoCm} cm
                      </p>
                    </div>
                    {product.pesoKg && (
                      <div className={`p-3 rounded-lg transition-all duration-300 hover:scale-[1.02] ${
                        isDark 
                          ? 'bg-slate-800/50 border border-slate-700/50 hover:border-purple-500/50 hover:shadow-lg hover:shadow-purple-500/10' 
                          : 'bg-white border border-gray-200/60 hover:border-purple-300 hover:shadow-lg hover:shadow-purple-100'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <svg className={`w-4 h-4 ${
                            isDark ? 'text-purple-400' : 'text-purple-600'
                          }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                          </svg>
                          <span className={`text-xs font-semibold uppercase tracking-wider ${
                            isDark ? 'text-gray-400' : 'text-gray-500'
                          }`}>
                            Peso neto
                          </span>
                        </div>
                        <p className={`text-base font-bold ${
                          isDark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {product.pesoKg} kg
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categorías - Chips mejorados */}
              {product.categorias && product.categorias.length > 0 && (
                <div className={`pt-5 border-t ${
                  isDark ? 'border-slate-700/50' : 'border-gray-200/60'
                }`}>
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`p-1.5 rounded-lg ${
                      isDark ? 'bg-slate-700/50' : 'bg-gray-100'
                    }`}>
                      <svg className={`w-4 h-4 ${
                        isDark ? 'text-indigo-400' : 'text-indigo-600'
                      }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <h3 className={`text-base font-bold tracking-tight ${
                      isDark ? 'text-white' : 'text-gray-900'
                    }`}>
                      Categorías
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.categorias.map((categoria) => (
                      <span
                        key={categoria.id}
                        className={`group relative px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-300 hover:scale-105 hover:-translate-y-1 ${
                          isDark
                            ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 hover:shadow-lg hover:shadow-indigo-500/20'
                            : 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 border border-indigo-200/60 hover:border-indigo-300 hover:shadow-lg hover:shadow-indigo-200/50'
                        }`}
                      >
                        <span className="relative z-10">{categoria.nombre}</span>
                        <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                          isDark 
                            ? 'bg-gradient-to-r from-indigo-500/10 to-purple-500/10' 
                            : 'bg-gradient-to-r from-indigo-100/50 to-purple-100/50'
                        }`}></div>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* También te puede gustar - Apple premium */}
        {relatedProducts.length > 0 && (
          <div className="mt-20 pb-32">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight" style={{ color: isDark ? '#ffffff' : undefined }}>También te puede gustar</h2>
              <div className="flex items-center gap-4">
                {/* Indicadores de página */}
                {totalPages > 1 && relatedProducts.length > PRODUCTS_PER_PAGE && (
                  <div className="flex items-center gap-2 mr-2">
                    {Array.from({ length: totalPages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setRelatedProductsPage(i)}
                        className={`w-2 h-2 rounded-full transition-all duration-200 ${
                          i === relatedProductsPage
                            ? 'bg-blue-900 dark:bg-blue-700 w-6'
                            : 'bg-gray-300 dark:bg-gray-500 hover:bg-gray-400 dark:hover:bg-gray-400'
                        }`}
                        aria-label={`Ir a página ${i + 1} de productos relacionados`}
                      />
                    ))}
                  </div>
                )}

                {/* Botones de navegación */}
                <div className="flex gap-3">
                  <button
                    onClick={prevRelatedProducts}
                    disabled={totalPages <= 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 ${
                      totalPages <= 1
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-blue-900 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-700 shadow-sm dark:shadow-gray-900/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-white dark:text-white disabled:text-white/50 dark:disabled:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <button
                    onClick={nextRelatedProducts}
                    disabled={totalPages <= 1}
                    className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 hover:shadow-md hover:scale-105 ${
                      totalPages <= 1
                        ? 'bg-gray-300 dark:bg-gray-600 cursor-not-allowed opacity-50'
                        : 'bg-blue-900 dark:bg-blue-800 hover:bg-blue-800 dark:hover:bg-blue-700 shadow-sm dark:shadow-gray-900/30'
                    }`}
                  >
                    <svg className="w-5 h-5 text-white dark:text-white disabled:text-white/50 dark:disabled:text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 auto-rows-fr">
              {getCurrentPageProducts().length > 0 ? getCurrentPageProducts().map((relatedProduct) => {
                const mainImage = relatedProduct.imagenes?.find(img => img.esPrincipal)?.url ||
                  relatedProduct.imagenes?.[0]?.url ||
                  'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                const transferPrice = relatedProduct.promociones?.transferenciaDescuento
                  ? calculateTransferPrice(relatedProduct.precio, relatedProduct.promociones.transferenciaDescuento)
                  : null;

                return (
                  <Link
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="group bg-white rounded-2xl shadow-sm border border-gray-100/50 overflow-hidden hover:shadow-lg hover:shadow-gray-200/30 hover:-translate-y-1 transition-all duration-300 will-change-transform h-full flex flex-col"
                  >
                    <div className="relative overflow-hidden rounded-t-2xl flex-shrink-0 h-48">
                      <img
                        src={mainImage}
                        alt={relatedProduct.nombre}
                        className="w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-500 ease-out"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
                    </div>
                    <div className="p-6 flex flex-col flex-1">
                      {/* Título - ocupa espacio disponible */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 leading-tight min-h-[3rem]">
                          {relatedProduct.nombre}
                        </h3>
                      </div>

                      {/* Precios - siempre al final para alineación */}
                      <div className="mt-auto">
                        <div className="space-y-1">
                          {relatedProduct.precioOriginal && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-through">
                              ${relatedProduct.precioOriginal.toLocaleString('es-AR')}
                            </p>
                          )}
                          <p className="text-xl font-bold text-gray-900 dark:text-white">
                            ${relatedProduct.precio.toLocaleString('es-AR')}
                          </p>
                          {transferPrice && (
                            <p className="text-sm text-green-600 font-medium">
                              ${transferPrice.toLocaleString('es-AR')} con transferencia
                            </p>
                          )}
                          {relatedProduct.promociones?.cuotasSinInteres && (
                            <p className="text-sm text-blue-600 font-medium">
                              Hasta {relatedProduct.promociones.cuotasSinInteres} cuotas sin interés
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                  <p className="text-lg">No hay productos relacionados disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modal de zoom de imagen */}
      {showImageModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-4xl max-h-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 text-white dark:text-gray-300 hover:text-gray-300 dark:hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <img 
              src={mainImage} 
              alt={product.nombre}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
              onError={handleImageError}
              onLoad={handleImageLoad}
            />
          </div>
        </div>
      )}

      {/* Carrito Lateral con Framer Motion */}
      <AnimatePresence>
        {showCartSidebar && (
          <motion.div 
            className={`fixed top-16 right-4 h-[calc(100vh-5rem)] w-96 z-50 shadow-2xl flex flex-col rounded-2xl border ${
              isDark 
                ? 'bg-slate-800/95 border-gray-700/60' 
                : 'bg-gray-100 border-gray-200/60'
            }`}
            initial={{ 
              scale: 0.95, 
              opacity: 0, 
              x: 400
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              x: 0
            }}
            exit={{ 
              scale: 0.95, 
              opacity: 0, 
              x: 400
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.25
            }}
          >
            {/* Header del carrito */}
            <div className={`flex items-center justify-between p-5 border-b ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex items-center gap-3">
                <h2 className={`text-xl font-bold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Carrito
                </h2>
                {getTotalItems() > 0 && (
                  <span className="text-xs px-2.5 py-1 rounded-full font-semibold text-white" style={{ backgroundColor: '#2563eb' }}>
                    {getTotalItems()}
                  </span>
                )}
              </div>
              <button
                onClick={() => setShowCartSidebar(false)}
                className={`p-2 rounded-lg transition-colors ${
                  isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-gray-700/50' 
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200/60'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto p-5 min-h-0">
              {/* Productos agregados */}
              <div className="space-y-3">
                {items && items.length > 0 ? items.map((item) => {
                  const itemMainImage = item.product.imagenes && item.product.imagenes.length > 0
                    ? item.product.imagenes[0].url
                    : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  
                  return (
                    <div 
                      key={item.id} 
                      className={`rounded-xl p-4 border transition-all duration-200 ${
                        isDark 
                          ? 'bg-slate-700/80 border-gray-600/60 hover:border-gray-500/80' 
                          : 'bg-gray-50 border-gray-200/80 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <img 
                          src={itemMainImage} 
                          alt={item.product.nombre}
                          className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <h3 className={`font-medium text-sm mb-2 line-clamp-2 ${
                            isDark ? 'text-white' : 'text-gray-900'
                          }`}>
                            {item.product.nombre}
                          </h3>
                          <div className="flex items-center justify-between mb-2">
                            <span className={`font-bold ${
                              isDark ? 'text-white' : 'text-gray-900'
                            }`}>
                              ${item.price.toLocaleString('es-AR')}
                            </span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => {
                                  const currentItem = items.find(i => i.id === item.id);
                                  if (currentItem && currentItem.quantity > 1) {
                                    updateQuantity(item.id, currentItem.quantity - 1);
                                  } else {
                                    removeItem(item.id);
                                  }
                                }}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                                  isDark 
                                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                -
                              </button>
                              <span className={`text-sm w-6 text-center font-medium ${
                                isDark ? 'text-white' : 'text-gray-900'
                              }`}>
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => {
                                  const currentItem = items.find(i => i.id === item.id);
                                  if (currentItem) {
                                    updateQuantity(item.id, currentItem.quantity + 1);
                                  }
                                }}
                                className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-colors ${
                                  isDark 
                                    ? 'bg-gray-600 text-white hover:bg-gray-500' 
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className={`text-xs mt-1 transition-colors ${
                              isDark 
                                ? 'text-red-400 hover:text-red-300' 
                                : 'text-red-600 hover:text-red-700'
                            }`}
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className={`text-center py-8 ${
                    isDark ? 'text-gray-400' : 'text-gray-500'
                  }`}>
                    <p>No hay productos en el carrito</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer del carrito */}
            <div className={`border-t p-5 flex-shrink-0 ${
              isDark ? 'border-gray-700' : 'border-gray-200'
            }`}>
              <div className="flex justify-between items-center mb-5">
                <span className={`font-semibold ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  Subtotal
                </span>
                <span className={`font-bold text-xl ${
                  isDark ? 'text-white' : 'text-gray-900'
                }`}>
                  ${getTotalPrice().toLocaleString('es-AR')}
                </span>
              </div>
              
              <div className="space-y-3">
                <button
                  onClick={() => setShowCartSidebar(false)}
                  className={`w-full font-medium py-3 px-4 rounded-xl transition-colors ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Seguir comprando
                </button>
                
                <Link
                  to="/shopcart"
                  onClick={() => setShowCartSidebar(false)}
                  className={`w-full font-medium py-3 px-4 rounded-xl transition-colors text-center block ${
                    isDark 
                      ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                      : 'bg-gray-200 hover:bg-gray-300 text-gray-800'
                  }`}
                >
                  Ver carrito completo
                </Link>
                
                <Link
                  to="/shopcart"
                  onClick={() => setShowCartSidebar(false)}
                  className="w-full text-white font-semibold py-3 px-4 rounded-xl transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 flex items-center justify-center gap-2"
                  style={{ backgroundColor: '#2563eb' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#1d4ed8'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#2563eb'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Finalizar pedido
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
