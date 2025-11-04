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
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
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
          setSelectedColor(foundProduct.color);
          setSelectedSize('90x40cm'); // Tamaño por defecto
          setSelectedMaterial('Classic'); // Material por defecto
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

  // Manejar cambios en las variantes
  useEffect(() => {
    if (product && product.variantes) {
      const variant = getProductVariant(product.id, selectedColor, selectedSize, selectedMaterial);
      if (variant) {
        setCurrentPrice(variant.precio);
        setCurrentStock(variant.stockDisponible);
      }
    }
  }, [selectedColor, selectedSize, selectedMaterial, product]);

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
    
    const productImages = product.imagenes.length > 0 
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
  const productImages = product.imagenes.length > 0 
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
    addItem(
      product,
      quantity,
      selectedColor || undefined,
      selectedSize || undefined,
      selectedMaterial || undefined
    );
    
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
            {/* Marca */}
            <div className="text-sm text-gray-600 font-medium">
              {product.marca}
            </div>

            {/* Nombre del producto */}
            <h1 className="text-3xl font-bold text-gray-800">
              {product.nombre}
            </h1>

            {/* Precio */}
            <div className="flex items-center gap-4">
              <span className="text-2xl font-bold text-gray-800">
                ${currentPrice.toLocaleString('es-AR')}
              </span>
              {product.precioOriginal && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.precioOriginal.toLocaleString('es-AR')}
                </span>
              )}
            </div>

            {/* Promociones - Estilo Apple */}
            {product.promociones && (
              <div className="space-y-2">
                {product.promociones.transferenciaDescuento && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {product.promociones.transferenciaDescuento}% off con transferencia
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${calculateTransferPrice(currentPrice, product.promociones.transferenciaDescuento).toLocaleString('es-AR')}
                    </span>
                  </div>
                )}
                {product.promociones.cuotasSinInteres && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Hasta {product.promociones.cuotasSinInteres} cuotas sin interés
                    </span>
                    <span className="font-semibold text-gray-900">
                      ${calculateInstallmentPrice(currentPrice, product.promociones.cuotasSinInteres).toLocaleString('es-AR')} c/u
                    </span>
                  </div>
                )}
                {product.promociones.envioGratis && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      Envío gratis desde ${product.promociones.envioGratis.toLocaleString('es-AR')}
                    </span>
                    <span className="font-semibold text-gray-900">Gratis</span>
                  </div>
                )}
              </div>
            )}

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

            {/* Selección de color */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Color
              </label>
              <div className="flex gap-3">
                <div className="relative group">
                  <motion.button
                    onClick={() => setSelectedColor('Negro')}
                    className={`w-8 h-8 rounded border-2 transition-all duration-300 ${
                      selectedColor === 'Negro' 
                        ? 'border-gray-800' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: '#000000' }}
                    whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(0,0,0,0.3)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                    Negro
                  </div>
                </div>
                <div className="relative group">
                  <motion.button
                    onClick={() => setSelectedColor('Blanco')}
                    className={`w-8 h-8 rounded border-2 transition-all duration-300 ${
                      selectedColor === 'Blanco' 
                        ? 'border-gray-800' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: '#FFFFFF' }}
                    whileHover={{ scale: 1.1, boxShadow: "0 4px 12px rgba(0,0,0,0.2)" }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                    Blanco
                  </div>
                </div>
              </div>
            </div>

            {/* Selección de tamaño */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Medida: {selectedSize}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedSize('90x40cm')}
                  disabled={showCartSidebar}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                    selectedSize === '90x40cm'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  90x40cm
                </button>
                <button
                  onClick={() => setSelectedSize('50x40cm')}
                  disabled={showCartSidebar}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                    selectedSize === '50x40cm'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  50x40cm
                </button>
              </div>
            </div>

            {/* Selección de material */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Material: {selectedMaterial}
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => setSelectedMaterial('Classic')}
                  disabled={showCartSidebar}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                    selectedMaterial === 'Classic'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setSelectedMaterial('PRO')}
                  disabled={showCartSidebar}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 disabled:hover:shadow-none ${
                    selectedMaterial === 'PRO'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  PRO
                </button>
              </div>
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

            {/* Información adicional - Estilo Apple */}
            <div className="space-y-3">
              {product.garantia && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Garantía</span>
                  <span className="font-semibold text-gray-900">{product.garantia}</span>
                </div>
              )}
              
              {product.tiempoFabricacion && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Tiempo de fabricación</span>
                  <span className="font-semibold text-gray-900">{product.tiempoFabricacion}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Envío</span>
                <span className="font-semibold text-gray-900">24-48 horas</span>
              </div>

              {product.politicas && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Políticas</span>
                  <span className="font-semibold text-gray-900">
                    {product.politicas.cambio ? 'Cambio ✓' : 'Sin cambio ✗'} • 
                    {product.politicas.devolucion ? 'Devolución ✓' : 'Sin devolución ✗'}
                  </span>
                </div>
              )}

              {/* Métodos de pago - Estilo Apple */}
              <div className="pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span>Métodos de pago:</span>
                  <span className="text-gray-600">Visa • Mastercard • Transferencia • Mercado Pago</span>
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

        {/* Características */}
        <div className="mt-6 bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Características</h2>
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {product.caracteristicas.map((caracteristica, index) => (
              <li key={index} className="flex items-center gap-2 text-gray-600">
                <span className="text-green-600">✓</span>
                <span>{caracteristica}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Detalles del producto */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">DETALLES DEL PRODUCTO</h2>
          <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
            {/* Acordeón 1 - Descripción Serie Classic */}
            <div className="border-b border-gray-200">
              <button 
                onClick={() => setExpandedAccordion(expandedAccordion === 'classic' ? null : 'classic')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">DESCRIPCIÓN SERIE CLASSIC</span>
                <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'classic' ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <AnimatePresence>
                {expandedAccordion === 'classic' && (
                  <motion.div 
                    className="px-6 pb-4 bg-gray-50"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="space-y-3 text-sm text-gray-700"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <p><strong>Tipo:</strong> Híbrido</p>
                      <div>
                        <p><strong>Características específicas:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Velocidad: 50% ⚡</li>
                          <li>• Precisión: 50% 🎯</li>
                          <li>• Estabilidad: Buena</li>
                        </ul>
                      </div>
                      <p><strong>Materiales:</strong> Base antideslizante de goma ultra resistente + superficie de poliéster premium optimizado.</p>
                      <p><strong>Ideal para:</strong> uso diario, gaming y trabajo.</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón 2 - Descripción Serie PRO */}
            <div className="border-b border-gray-200">
              <button 
                onClick={() => setExpandedAccordion(expandedAccordion === 'pro' ? null : 'pro')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">DESCRIPCIÓN SERIE PRO</span>
                <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'pro' ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <AnimatePresence>
                {expandedAccordion === 'pro' && (
                  <motion.div 
                    className="px-6 pb-4 bg-gray-50"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="space-y-3 text-sm text-gray-700"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <p><strong>Tipo:</strong> Control</p>
                      <div>
                        <p><strong>Características específicas:</strong></p>
                        <ul className="ml-4 space-y-1">
                          <li>• Velocidad: 30% ⚡</li>
                          <li>• Precisión: 70% 🎯</li>
                          <li>• Estabilidad: Excelente</li>
                        </ul>
                      </div>
                      <p><strong>Materiales:</strong> Base antideslizante de caucho, 100% natural + superficie de poliéster premium ultralisa.</p>
                      <p><strong>Ideal para:</strong> enfocada al gaming.</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón 3 - Cambio y Devolución */}
            <div className="border-b border-gray-200">
              <button 
                onClick={() => setExpandedAccordion(expandedAccordion === 'cambio' ? null : 'cambio')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">¿TIENEN CAMBIO O DEVOLUCIÓN?</span>
                <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'cambio' ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <AnimatePresence>
                {expandedAccordion === 'cambio' && (
                  <motion.div 
                    className="px-6 pb-4 bg-gray-50"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="space-y-3 text-sm text-gray-700"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      {product.politicas?.personalizado ? (
                        <div>
                          <p className="font-semibold text-red-600">Los productos personalizados NO tienen cambio ni devolución.</p>
                          <p>Por eso, asegurate de tomar bien las medidas antes de comprar y consultanos si tenés dudas sobre la calidad de la imagen que nos envíes.</p>
                          <p className="font-semibold">Importante:</p>
                          <p>El cliente es responsable de la calidad de la imagen enviada. Nosotros imprimimos en máxima calidad y fidelidad; si el archivo es de baja resolución, pixelado o tiene errores, estos se verán reflejados en el producto final.</p>
                        </div>
                      ) : (
                        <div>
                          <p>✅ <strong>Cambio:</strong> {product.politicas?.cambio ? 'Sí' : 'No'}</p>
                          <p>✅ <strong>Devolución:</strong> {product.politicas?.devolucion ? 'Sí' : 'No'}</p>
                          <p>Los productos estándar tienen 30 días para cambio o devolución en perfecto estado.</p>
                        </div>
                      )}
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Acordeón 4 - Tiempo de fabricación */}
            <div>
              <button 
                onClick={() => setExpandedAccordion(expandedAccordion === 'fabricacion' ? null : 'fabricacion')}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-gray-800">¿QUÉ DEMORA TIENEN EN FABRICARSE?</span>
                <svg className={`w-5 h-5 text-gray-600 transition-transform ${expandedAccordion === 'fabricacion' ? 'rotate-45' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
              <AnimatePresence>
                {expandedAccordion === 'fabricacion' && (
                  <motion.div 
                    className="px-6 pb-4 bg-gray-50"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <motion.div 
                      className="space-y-3 text-sm text-gray-700"
                      initial={{ y: -10 }}
                      animate={{ y: 0 }}
                      exit={{ y: -10 }}
                      transition={{ duration: 0.2, delay: 0.1 }}
                    >
                      <p><strong>Tiempo de fabricación:</strong> {product.tiempoFabricacion || '5-7 días hábiles'}</p>
                      <p>Todos nuestros productos se fabrican por encargo. Una vez recibido el pago, tu pedido entra en proceso de producción y demora entre 3 a 7 días hábiles en ser despachado. Recordá que los días hábiles no incluyen fines de semana ni feriados.</p>
                      <p>Apenas lo enviamos, te llega un mail con el código de seguimiento para que puedas ver el estado del envío.</p>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>


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
              {relatedProducts.map((relatedProduct) => {
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
              })}
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
                  {selectedColor} / {selectedSize} / {selectedMaterial}
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
                {items.map((item) => {
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
                          <p className="text-xs text-gray-300 mb-1">{item.product.marca}</p>
                          {(item.selectedColor || item.selectedSize || item.selectedMaterial) && (
                            <p className="text-xs text-gray-400">
                              {item.selectedColor && `Color: ${item.selectedColor}`}
                              {item.selectedSize && ` | Tamaño: ${item.selectedSize}`}
                              {item.selectedMaterial && ` | Material: ${item.selectedMaterial}`}
                            </p>
                          )}
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
                })}
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
