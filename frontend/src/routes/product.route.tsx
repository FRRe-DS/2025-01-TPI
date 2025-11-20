import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, getProductById, getProductVariant, getRelatedProducts, calculateTransferPrice, calculateInstallmentPrice } from '../services/product.service';
import { useCart } from '../contexts/CartContext';
import './product.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem, items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();

  // Verificar modo oscuro
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));

  useEffect(() => {
    const checkDarkMode = () => {
      const dark = document.documentElement.classList.contains('dark');
      setIsDarkMode(dark);
      console.log('🛒 ProductPage - Modo oscuro actualizado:', dark);
    };

    // Verificar inicialmente
    checkDarkMode();

    // Observar cambios en la clase del html
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });

    return () => observer.disconnect();
  }, []);

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
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

        const foundProduct = await getProductById(productId);

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
  }, [id]);


  // Detectar scroll para mostrar/ocultar el carrito flotante
  useEffect(() => {
    let ticking = false;
    let timeoutId: NodeJS.Timeout;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollPosition = window.scrollY;
          const windowHeight = window.innerHeight;
          const documentHeight = document.documentElement.scrollHeight;
          
          // Mostrar cuando el usuario haya scrolleado más del 40% de la página
          // Esto significa que ya pasó la imagen, detalles, descripción y características
          const threshold = documentHeight * 0.4;
          const shouldShow = scrollPosition > threshold;
          
          if (shouldShow && !showFloatingCart) {
            setIsCartAnimating(true);
            setShowFloatingCart(true);
            // Resetear el estado de animación después de que termine
            setTimeout(() => setIsCartAnimating(false), 600);
          } else if (!shouldShow && showFloatingCart) {
            setIsCartAnimating(true);
            // Esperar a que termine la animación de salida antes de ocultar
            setTimeout(() => {
              setShowFloatingCart(false);
              setIsCartAnimating(false);
            }, 400);
          }
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [showFloatingCart]);

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
    
    setIsAddingToCart(true);
    
    // Simular proceso de agregar al carrito
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Agregar al carrito usando el contexto
    addItem(product, quantity);
    
    setIsAddingToCart(false);
    setCartAnimating(true);
    setShowCartSidebar(true);
    
    // Reset animation state
    setTimeout(() => setCartAnimating(false), 300);
  };

  const handleBuyNow = () => {
    // Aquí se implementará la lógica para comprar ahora
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
    <div className="min-h-screen bg-white dark:bg-black py-12" data-theme-aware>
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
                <h1 className="text-4xl lg:text-5xl font-semibold text-gray-900 dark:text-white leading-tight tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>
                  {product.nombre}
                </h1>

                {/* Precio - Elegante y destacado */}
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>
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
                <label className="text-sm font-medium text-gray-700" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Cantidad:</label>
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

                <button
                  onClick={handleBuyNow}
                  disabled={showCartSidebar}
                  className="w-full bg-white dark:bg-gray-800 border-2 border-green-600 dark:border-green-500 text-green-600 dark:text-green-400 hover:bg-green-600 dark:hover:bg-green-500 hover:text-white dark:hover:text-white font-semibold py-4 px-8 rounded-2xl transition-all duration-300 hover:shadow-lg hover:shadow-green-500/25 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 text-lg"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Comprar ahora
                </button>
              </div>
            </div>

            {/* Información de envío y pagos - Estilo Apple limpio */}
            <div className="bg-gray-50/50 dark:bg-black rounded-2xl p-8 space-y-6 border border-gray-100/60 dark:border-gray-600/60" style={{ backgroundColor: isDarkMode ? '#000000' : undefined }}>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 font-medium" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Envío</span>
                  <span className="text-gray-900 dark:text-white font-semibold" style={{ color: isDarkMode ? '#ffffff' : undefined }}>24-48 horas</span>
                </div>

                <div className="border-t border-gray-200/60 dark:border-gray-600/60 pt-4">
                  <div className="space-y-2">
                    <span className="text-gray-600 text-sm font-medium" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Métodos de pago</span>
                    <div className="flex items-center gap-3 text-gray-700" style={{ color: isDarkMode ? '#ffffff' : undefined }}>
                      <span className="text-sm">Visa</span>
                      <span className="text-gray-400" style={{ color: isDarkMode ? '#9ca3af' : undefined }}>•</span>
                      <span className="text-sm">Mastercard</span>
                      <span className="text-gray-400" style={{ color: isDarkMode ? '#9ca3af' : undefined }}>•</span>
                      <span className="text-sm">Transferencia</span>
                    </div>
                  </div>
                </div>
              </div>
          </div>
        </div>
        </div>

        {/* Información detallada del producto - Flujo vertical completo */}
        <div className="mt-16">
          <section className="bg-gray-50/30 dark:bg-gray-800/30 rounded-3xl p-12 border border-gray-100/60 dark:border-gray-600/60 shadow-sm dark:shadow-gray-900/50" style={{ backgroundColor: isDarkMode ? '#000000' : undefined }}>
            <div className="max-w-4xl space-y-12">
              {/* Descripción principal */}
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-8 tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Descripción del producto</h2>
                <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
                  <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-lg" style={{ color: isDarkMode ? '#ffffff' : undefined }}>
                    {product.descripcion}
                  </p>
                </div>
              </div>

              {/* Especificaciones técnicas - Integradas */}
              {product.dimensiones && (
                <div className="pt-8 border-t border-gray-200/40 dark:border-gray-600/40">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Especificaciones técnicas</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <span className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Dimensiones</span>
                      <p className="text-gray-900 dark:text-white text-xl font-medium" style={{ color: isDarkMode ? '#ffffff' : undefined }}>
                        {product.dimensiones.largoCm} × {product.dimensiones.anchoCm} × {product.dimensiones.altoCm} cm
                      </p>
                    </div>
                    {product.pesoKg && (
                      <div className="space-y-3">
                        <span className="text-gray-600 dark:text-gray-400 font-medium text-sm uppercase tracking-wider" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Peso neto</span>
                        <p className="text-gray-900 dark:text-white text-xl font-medium" style={{ color: isDarkMode ? '#ffffff' : undefined }}>{product.pesoKg} kg</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Categorías - Chips integrados */}
              {product.categorias && product.categorias.length > 0 && (
                <div className="pt-8 border-t border-gray-200/40 dark:border-gray-600/40">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-6 tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>Categoría</h3>
                  <div className="flex flex-wrap gap-4">
                    {product.categorias.map((categoria) => (
                      <span
                        key={categoria.id}
                        className="px-8 py-4 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-2xl border border-gray-200/60 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:shadow-sm dark:hover:shadow-gray-900/30 transition-all duration-300 hover:-translate-y-0.5 shadow-sm dark:shadow-gray-900/20"
                      >
                        {categoria.nombre}
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
              <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight" style={{ color: isDarkMode ? '#ffffff' : undefined }}>También te puede gustar</h2>
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

      {/* Carrito flotante - Diseño horizontal alargado */}
      {showFloatingCart && product && (
        <div className={`fixed bottom-6 right-6 z-50 ${isCartAnimating ? 'floating-cart-enter' : ''}`}>
          <div className="bg-white dark:bg-gray-800 border border-gray-100/60 dark:border-gray-600 rounded-2xl p-4 shadow-2xl dark:shadow-gray-900/50 max-w-lg">
            <div className="flex items-center gap-4">
              {/* Imagen del producto */}
              <div className="flex-shrink-0">
                <img
                  src={mainImage}
                  alt={product.nombre}
                  className="w-16 h-16 object-cover rounded-lg shadow-sm"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>

              {/* Información del producto */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm leading-tight mb-1 line-clamp-2">
                  {product.nombre}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400 mb-2">
                  <span>{product.marca}</span>
                  {currentStock > 0 && currentStock <= 5 && (
                    <span className="text-orange-600">• Solo {currentStock} disponibles</span>
                  )}
                </div>
                <div className="text-lg font-bold text-gray-900 dark:text-white">
                  ${currentPrice.toLocaleString('es-AR')}
                </div>
              </div>

              {/* Botón de acción */}
              <div className="flex-shrink-0">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || currentStock === 0 || showCartSidebar}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/25 hover:-translate-y-0.5 disabled:hover:translate-y-0 flex items-center gap-2"
                  whileHover={!isAddingToCart && currentStock > 0 ? {
                    scale: 1.02,
                    boxShadow: "0 10px 25px -5px rgba(59, 130, 246, 0.4), 0 8px 10px -5px rgba(59, 130, 246, 0.1)"
                  } : {}}
                  whileTap={!isAddingToCart && currentStock > 0 ? { scale: 0.98 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                      Agregar
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}

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
            className="fixed top-16 right-4 h-[calc(100vh-5rem)] w-96 bg-gray-800 dark:bg-gray-900 z-50 shadow-2xl flex flex-col rounded-lg"
            initial={{ 
              scale: 0.1, 
              opacity: 0, 
              x: 400, 
              y: 120,
              borderRadius: "50%"
            }}
            animate={{ 
              scale: 1, 
              opacity: 1, 
              x: 0, 
              y: 0,
              borderRadius: "0.5rem"
            }}
            exit={{ 
              scale: 0.1, 
              opacity: 0, 
              x: -380, 
              y: 40,
              borderRadius: "50%"
            }}
            transition={{
              type: "spring",
              stiffness: 400,
              damping: 25,
              duration: 0.25
            }}
          >
            {/* Header del carrito */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700 dark:border-gray-600">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Carrito</h2>
                {getTotalItems() > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{getTotalItems()}</span>
                )}
              </div>
              <button
                onClick={() => setShowCartSidebar(false)}
                className="text-gray-400 dark:text-gray-500 hover:text-white dark:hover:text-gray-200 transition-colors p-2 hover:bg-gray-700 dark:hover:bg-gray-600 rounded-full"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Contenido del carrito */}
            <div className="flex-1 overflow-y-auto p-4 min-h-0">
              {/* Mensaje de envío gratis */}
              <div className="bg-green-600 text-white p-3 rounded-lg mb-4">
                <p className="text-sm font-medium">¡Te faltan solo $56.875,00 para conseguir envío gratis!</p>
                <div className="w-full bg-green-800 rounded-full h-2 mt-2">
                  <div className="bg-white h-2 rounded-full" style={{width: '30%'}}></div>
                </div>
              </div>

              {/* Productos agregados */}
              <div className="space-y-3 mb-4">
                {items && items.length > 0 ? items.map((item) => {
                  const itemMainImage = item.product.imagenes && item.product.imagenes.length > 0
                    ? item.product.imagenes[0].url
                    : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                  
                  return (
                    <div key={item.id} className="bg-gray-700 rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <img 
                          src={itemMainImage} 
                          alt={item.product.nombre}
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="flex-1">
                          <h3 className="font-medium text-white text-sm">{item.product.nombre}</h3>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-white font-bold">${item.price.toLocaleString('es-AR')}</span>
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
                                className="w-6 h-6 bg-gray-600 text-white rounded flex items-center justify-center text-sm hover:bg-gray-500 transition-colors"
                              >
                                -
                              </button>
                              <span className="text-white text-sm w-6 text-center">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  const currentItem = items.find(i => i.id === item.id);
                                  if (currentItem) {
                                    updateQuantity(item.id, currentItem.quantity + 1);
                                  }
                                }}
                                className="w-6 h-6 bg-gray-600 text-white rounded flex items-center justify-center text-sm hover:bg-gray-500 transition-colors"
                              >
                                +
                              </button>
                            </div>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-red-400 text-xs mt-2 hover:text-red-300 transition-colors"
                          >
                            Quitar
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }) : (
                  <div className="text-center py-4 text-gray-400 dark:text-gray-500">
                    <p>No hay productos en el carrito</p>
                  </div>
                )}
              </div>

              {/* Información de envío */}
              <div className="space-y-4">
                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">Gastos de envío</h4>
                  <p className="text-gray-300 dark:text-gray-400 text-sm">Enviamos con Andreani: $6000 a sucursal o $9000 a domicilio</p>
                </div>

                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">Notas para entrega</h4>
                  <p className="text-gray-300 dark:text-gray-400 text-sm">Indicaciones para la entrega del pedido</p>
                </div>
              </div>
            </div>

            {/* Footer del carrito */}
            <div className="border-t border-gray-700 dark:border-gray-600 p-4 flex-shrink-0">
              <div className="flex justify-between items-center mb-4">
                <span className="text-white font-medium">Subtotal</span>
                <span className="text-white font-bold text-lg">${getTotalPrice().toLocaleString('es-AR')} ARS</span>
              </div>
              
              <div className="space-y-3">
                <Link
                  to="/shopcart/checkout"
                  onClick={() => setShowCartSidebar(false)}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Finalizar pedido
                </Link>
                
                <button
                  onClick={() => setShowCartSidebar(false)}
                  className="w-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Seguir comprando
                </button>
                
                <Link
                  to="/shopcart"
                  onClick={() => setShowCartSidebar(false)}
                  className="w-full bg-gray-600 dark:bg-gray-700 hover:bg-gray-500 dark:hover:bg-gray-600 text-white dark:text-gray-200 font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                >
                  Ver carrito completo
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
