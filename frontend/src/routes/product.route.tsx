import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, getProductById, getProductVariant, getRelatedProducts, calculateTransferPrice, calculateInstallmentPrice } from '../services/product.service';
import { useCart } from '../contexts/CartContext';
import './product.css';

export default function ProductPage() {
  const { id } = useParams();
  const { addItem, items, updateQuantity, removeItem, getTotalPrice, getTotalItems } = useCart();
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

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productId = parseInt(id || '0');
        
        const foundProduct = await getProductById(productId);
        
        setProduct(foundProduct);
        if (foundProduct) {
          setCurrentPrice(foundProduct.precio);
          setCurrentStock(foundProduct.stockDisponible);
          
          // Cargar productos relacionados
          const related = await getRelatedProducts(productId, 4);
          setRelatedProducts(related);
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
        <div className="text-gray-600">Cargando producto...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8F7F2] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Producto no encontrado</h1>
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

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Carrusel de imágenes - Estilo Apple */}
            <div className="sticky top-8">
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
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300"
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
                          ? 'bg-gray-800 w-8' 
                          : 'bg-gray-300 hover:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Detalles del producto */}
            <div className="space-y-8">
            {/* Nombre del producto */}
            <h1 className="text-3xl font-bold text-gray-800">
              {product.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">
                ${currentPrice.toLocaleString('es-AR')}
              </span>
            </div>

            {/* Stock disponible - Estilo Apple */}
            <div className="flex items-center gap-2 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                currentStock > 10 ? 'bg-green-500' : currentStock > 0 ? 'bg-orange-500' : 'bg-red-500'
              }`}></div>
              <span className={`${
                currentStock > 10 ? 'text-green-600' : currentStock > 0 ? 'text-orange-600' : 'text-red-600'
              }`}>
                {currentStock > 10 ? 'En stock' : currentStock > 0 ? `Solo quedan ${currentStock} unidades` : 'Sin stock'}
              </span>
            </div>


            {/* Selector de cantidad y botones */}
            <div className="flex items-center gap-4">
              <div className="flex items-center border border-gray-300 rounded-lg bg-white min-w-[120px]">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  disabled={showCartSidebar}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &lt;
                </button>
                <span className="px-4 py-2 text-gray-800 font-medium min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  disabled={showCartSidebar}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  &gt;
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || currentStock === 0 || showCartSidebar}
                className="liquid-button flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
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
                  'Agregar al carrito'
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              disabled={showCartSidebar}
              className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-500 hover:scale-105 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none"
            >
              Comprar ahora
            </button>

            {/* Información de envío */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold text-gray-900">24-48 horas</span>
              </div>

              {/* Métodos de pago */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Métodos de pago:</span>
                  <span className="text-gray-600">Visa • Mastercard • Transferencia</span>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>

        {/* Descripción del producto */}
        <div className="mt-12 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Descripción</h2>
          <p className="text-gray-600 leading-relaxed">
            {product.descripcion}
          </p>
        </div>

        {/* Información adicional del producto */}
        {product.dimensiones && (
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Especificaciones</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-semibold text-gray-600">Dimensiones:</span>
                <p className="text-gray-800">{product.dimensiones.largoCm} x {product.dimensiones.anchoCm} x {product.dimensiones.altoCm} cm</p>
              </div>
              {product.pesoKg && (
                <div>
                  <span className="font-semibold text-gray-600">Peso:</span>
                  <p className="text-gray-800">{product.pesoKg} kg</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Categorías */}
        {product.categorias && product.categorias.length > 0 && (
          <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-800 mb-4">Categorías</h2>
            <div className="flex flex-wrap gap-2">
              {product.categorias.map((categoria) => (
                <span key={categoria.id} className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {categoria.nombre}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* También te puede gustar */}
        {relatedProducts.length > 0 && (
          <div className="mt-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-800">También te puede gustar</h2>
              <div className="flex gap-2">
                <button className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors">
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center hover:bg-green-700 transition-colors">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts && relatedProducts.length > 0 ? relatedProducts.map((relatedProduct) => {
                const mainImage = relatedProduct.imagenes.find(img => img.esPrincipal)?.url || 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                const transferPrice = relatedProduct.promociones?.transferenciaDescuento 
                  ? calculateTransferPrice(relatedProduct.precio, relatedProduct.promociones.transferenciaDescuento)
                  : null;
                
                return (
                  <Link 
                    key={relatedProduct.id}
                    to={`/product/${relatedProduct.id}`}
                    className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow group"
                  >
                    <div className="h-48 relative overflow-hidden">
                      <img 
                        src={mainImage} 
                        alt={relatedProduct.nombre}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300"></div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-800 text-sm mb-2 line-clamp-2">
                        {relatedProduct.nombre}
                      </h3>
                      <div className="space-y-1">
                        {relatedProduct.precioOriginal && (
                          <div className="text-xs text-gray-500 line-through">
                            ${relatedProduct.precioOriginal.toLocaleString('es-AR')}
                          </div>
                        )}
                        <div className="text-sm font-bold text-gray-800">
                          ${relatedProduct.precio.toLocaleString('es-AR')}
                        </div>
                        {transferPrice && (
                          <div className="text-xs text-green-600">
                            ${transferPrice.toLocaleString('es-AR')} con transferencia
                          </div>
                        )}
                        {relatedProduct.promociones?.cuotasSinInteres && (
                          <div className="text-xs text-blue-600">
                            Hasta {relatedProduct.promociones.cuotasSinInteres} cuotas sin interés
                          </div>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              }) : (
                <div className="col-span-full text-center py-8 text-gray-500">
                  <p>No hay productos relacionados disponibles</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Carrito flotante */}
      {showFloatingCart && product && (
        <div className={`fixed bottom-6 right-6 z-50 ${isCartAnimating ? 'floating-cart-enter' : ''}`}>
          <div className="bg-[#F8F7F2] border border-gray-300 rounded-2xl p-4 shadow-2xl max-w-sm">
            <div className="flex items-center gap-4">
              {/* Imagen del producto */}
              <div className="flex-shrink-0">
                <img 
                  src={mainImage} 
                  alt={product.nombre}
                  className="w-16 h-16 object-cover rounded-lg shadow-md"
                  onError={handleImageError}
                  onLoad={handleImageLoad}
                />
              </div>
              
              {/* Detalles del producto */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-800 text-sm truncate">
                    {product.nombre}
                  </h3>
                  <span className="text-gray-600 text-xs">| {product.marca}</span>
                </div>
                <div className="text-xs text-gray-600 mb-1">
    {product.nombre}
                </div>
                <div className="text-sm font-semibold text-gray-800">
                  ${currentPrice.toLocaleString('es-AR')}
                </div>
              </div>
              
              {/* Botón de agregar al carrito */}
              <div className="flex-shrink-0">
                <motion.button
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || currentStock === 0 || showCartSidebar}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium px-4 py-2 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                  whileHover={!isAddingToCart && currentStock > 0 ? { 
                    scale: 1.05, 
                    boxShadow: "0 20px 25px -5px rgba(59, 130, 246, 0.3), 0 10px 10px -5px rgba(59, 130, 246, 0.1)" 
                  } : {}}
                  whileTap={!isAddingToCart && currentStock > 0 ? { scale: 0.95 } : {}}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  {isAddingToCart ? (
                    <>
                      <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Agregando...
                    </>
                  ) : (
                    'Agregar al carrito'
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
              className="absolute -top-12 right-0 text-white hover:text-gray-300 transition-colors"
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
            className="fixed top-16 right-4 h-[calc(100vh-5rem)] w-96 bg-gray-800 z-50 shadow-2xl flex flex-col rounded-lg"
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
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">Carrito</h2>
                {getTotalItems() > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{getTotalItems()}</span>
                )}
              </div>
              <button
                onClick={() => setShowCartSidebar(false)}
                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-700 rounded-full"
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
                  <div className="text-center py-4 text-gray-400">
                    <p>No hay productos en el carrito</p>
                  </div>
                )}
              </div>

              {/* Información de envío */}
              <div className="space-y-4">
                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">Gastos de envío</h4>
                  <p className="text-gray-300 text-sm">Enviamos con Andreani: $6000 a sucursal o $9000 a domicilio</p>
                </div>

                <div className="border-b border-gray-600 pb-4">
                  <h4 className="text-white font-medium mb-2">Notas para entrega</h4>
                  <p className="text-gray-300 text-sm">Indicaciones para la entrega del pedido</p>
                </div>
              </div>
            </div>

            {/* Footer del carrito */}
            <div className="border-t border-gray-700 p-4 flex-shrink-0">
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
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Seguir comprando
                </button>
                
                <Link
                  to="/shopcart"
                  onClick={() => setShowCartSidebar(false)}
                  className="w-full bg-gray-600 hover:bg-gray-500 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
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
