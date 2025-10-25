import { useParams, Link, useNavigate } from 'react-router';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { type Product, getProductById, getProductVariant, getRelatedProducts, calculateTransferPrice, calculateInstallmentPrice } from '../services/product.service';
import { useCart } from '../contexts/CartContext';
import CartAnimation from '../components/CartAnimation';
import './product.css';

export default function ProductPage() {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [showImageModal, setShowImageModal] = useState(false);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [expandedAccordion, setExpandedAccordion] = useState<string | null>(null);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [currentStock, setCurrentStock] = useState(0);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isExiting, setIsExiting] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  
  const { addToCart } = useCart();
  const navigate = useNavigate();

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
    
    // Agregar al carrito real
    const mainImage = product.imagenes.length > 0 
      ? product.imagenes[0].url
      : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
    
    addToCart({
      id: product.id,
      name: product.nombre,
      price: currentPrice,
      image: mainImage,
      color: selectedColor,
      size: selectedSize,
      material: selectedMaterial
    }, quantity);
    
    // Iniciar animación
    setIsAnimating(true);
    setIsAddingToCart(false);
  };

  const handleAnimationComplete = () => {
    setIsAnimating(false);
  };

  const handleBuyNow = () => {
    // Aquí se implementará la lógica para comprar ahora
  };

  const handleGoBack = () => {
    setIsExiting(true);
    // Después de que se complete la transición del texto, iniciar fade out y mostrar página destino
    setTimeout(() => {
      setIsFadingOut(true);
    }, 1000);
    // Navegar después del fade out, manteniendo el contexto de la categoría
    setTimeout(() => {
      // Obtener la categoría del producto actual
      const categoryId = product?.categorias?.[0]?.id;
      if (categoryId) {
        navigate('/', { 
          state: { 
            scrollToProducts: true, 
            selectedCategory: categoryId.toString() 
          } 
        });
      } else {
        navigate('/');
      }
    }, 1400);
  };

  return (
    <>
      {/* Overlay de transición con colores de Shipper */}
      <AnimatePresence>
        {isExiting && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: isFadingOut ? 0 : 1 
            }}
            exit={{ opacity: 0 }}
            transition={{ 
              duration: isFadingOut ? 0.4 : 0.3, 
              ease: "easeInOut" 
            }}
            style={{
              background: 'linear-gradient(135deg, #032d70 0%, #02244f 100%)'
            }}
          >
            <motion.div
              className="text-white text-center"
              initial={{ x: '100%', opacity: 0 }}
              animate={{ 
                x: 0, 
                opacity: 1,
                transition: {
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }
              }}
              exit={{ 
                x: '-100%', 
                opacity: 0,
                transition: {
                  duration: 0.6,
                  ease: [0.25, 0.46, 0.45, 0.94],
                  delay: 0.2
                }
              }}
            >
              <motion.div
                className="text-7xl font-bold"
                animate={{ 
                  scale: [1, 1.02, 1],
                }}
                transition={{ 
                  duration: 2, 
                  repeat: Infinity, 
                  ease: "easeInOut" 
                }}
              >
                Shipper
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div 
        className="min-h-screen bg-[#F8F7F2] py-8"
        initial={{ opacity: 0, x: 50 }}
        animate={{ 
          opacity: isExiting ? (isFadingOut ? 1 : 0) : 1, 
          x: isExiting ? (isFadingOut ? 0 : -50) : 0 
        }}
        transition={{ 
          duration: 0.4, 
          ease: "easeInOut" 
        }}
      >
      <div className="max-w-6xl mx-auto px-4">
        {/* Botón Volver Atrás */}
        <div className="mb-6">
          <button 
            onClick={handleGoBack}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors duration-200 group"
          >
            <div className="p-2 rounded-full bg-white shadow-sm border border-gray-200 group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                className="text-gray-600 group-hover:text-gray-800 transition-colors duration-200"
              >
                <path 
                  d="M19 12H5M12 19l-7-7 7-7" 
                  stroke="currentColor" 
                  strokeWidth="2" 
                  strokeLinecap="round" 
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="text-sm font-medium">Volver a productos</span>
          </button>
        </div>
        
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
            {/* Carrusel de imágenes - Estilo Apple */}
            <div className="sticky top-8">
              <div className="relative group">
                <img 
                  src={mainImage} 
                  alt={product.nombre}
                  className="w-full h-[500px] object-cover rounded-2xl shadow-sm transition-all duration-500 ease-out"
                />
                
                {/* Navegación con flechas */}
                {productImages.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === 0 ? productImages.length - 1 : prev - 1
                      )}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => setCurrentImageIndex(prev => 
                        prev === productImages.length - 1 ? 0 : prev + 1
                      )}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-70 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95"
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
                      className={`w-2 h-2 rounded-full transition-all duration-300 hover:scale-125 ${
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
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    selectedSize === '90x40cm'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  90x40cm
                </button>
                <button
                  onClick={() => setSelectedSize('50x40cm')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
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
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
                    selectedMaterial === 'Classic'
                      ? 'border-gray-800 text-gray-800 bg-white'
                      : 'border-gray-300 text-gray-600 bg-gray-100 hover:border-gray-500 hover:bg-gray-50'
                  }`}
                >
                  Classic
                </button>
                <button
                  onClick={() => setSelectedMaterial('PRO')}
                  className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-md ${
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
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  &lt;
                </button>
                <span className="px-4 py-2 text-gray-800 font-medium min-w-[40px] text-center">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-3 py-2 text-gray-600 hover:text-gray-800"
                >
                  &gt;
                </button>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={isAddingToCart || currentStock === 0}
                className="liquid-button flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <div className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Agregando</span>
                    <motion.div
                      className="flex items-center"
                      animate={{
                        x: [0, 100],
                        opacity: [1, 0]
                      }}
                      transition={{
                        duration: 0.5,
                        ease: "easeIn"
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
                      </svg>
                    </motion.div>
                  </div>
                ) : (
                  'Agregar al carrito'
                )}
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-500 hover:scale-105 hover:shadow-lg"
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

      {/* Animación del carrito */}
      {product && (
        <CartAnimation
          isAnimating={isAnimating}
          productImage={productImages[currentImageIndex]}
          onAnimationComplete={handleAnimationComplete}
        />
      )}

      </motion.div>
    </>
  );
}
