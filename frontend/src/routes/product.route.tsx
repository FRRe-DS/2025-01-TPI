import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { type Product, getProducts } from '../services/product.service';
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
  const [imageError, setImageError] = useState(false);
  const [showFloatingCart, setShowFloatingCart] = useState(false);
  const [isCartAnimating, setIsCartAnimating] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const result = await getProducts({});
        const foundProduct = result.products.find(p => p.id === parseInt(id || '0'));
        setProduct(foundProduct || null);
        if (foundProduct) {
          setSelectedColor(foundProduct.color);
          setSelectedSize('90x40cm'); // Tamaño por defecto
          setSelectedMaterial('Classic'); // Material por defecto
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

  const mainImage = imageError 
    ? `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#f3f4f6"/><text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Producto</text></svg>')}` 
    : (product.imagenes.find(img => img.esPrincipal)?.url || `data:image/svg+xml;base64,${btoa('<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#f3f4f6"/><text x="300" y="200" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" fill="#6b7280">Producto</text></svg>')}`);

  const handleImageError = () => {
    setImageError(true);
  };

  const handleAddToCart = () => {
    // Aquí se implementará la lógica para agregar al carrito
    console.log('Agregando al carrito:', {
      product: product.id,
      color: selectedColor,
      size: selectedSize,
      material: selectedMaterial,
      quantity
    });
  };

  const handleBuyNow = () => {
    // Aquí se implementará la lógica para comprar ahora
    console.log('Comprando ahora:', {
      product: product.id,
      color: selectedColor,
      size: selectedSize,
      material: selectedMaterial,
      quantity
    });
  };

  return (
    <div className="min-h-screen bg-[#F8F7F2] py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Imagen del producto */}
          <div className="relative rounded-lg cursor-pointer group" onClick={() => setShowImageModal(true)}>
            <img 
              src={mainImage} 
              alt={product.nombre}
              className="w-full h-96 object-cover rounded-lg hover:opacity-90 transition-opacity"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 rounded-lg flex items-center justify-center">
              <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white bg-opacity-90 rounded-full p-3">
                <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Detalles del producto */}
          <div className="space-y-6">
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
                ${product.precio.toFixed(2)}
              </span>
              {product.precioOriginal && (
                <span className="text-lg text-gray-500 line-through">
                  ${product.precioOriginal.toFixed(2)}
                </span>
              )}
            </div>

            {/* Promociones */}
            <div className="space-y-2">
              <div className="text-green-600 font-medium">
                20% off abonando con transferencia
              </div>
              <div className="text-green-600 font-medium">
                Hasta 6 cuotas sin interés
              </div>
              {product.precioOriginal && (
                <div className="text-sm text-gray-600">
                  <span className="line-through">Precio original: ${product.precioOriginal.toFixed(2)}</span>
                  <br />
                  <span className="font-bold text-green-600">
                    Precio con transferencia: ${product.precio.toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Selección de color */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-700">
                Color
              </label>
              <div className="flex gap-3">
                <div className="relative group">
                  <button
                    onClick={() => setSelectedColor('Negro')}
                    className={`w-8 h-8 rounded border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                      selectedColor === 'Negro' 
                        ? 'border-gray-800' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: '#000000' }}
                  />
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap z-10">
                    Negro
                  </div>
                </div>
                <div className="relative group">
                  <button
                    onClick={() => setSelectedColor('Blanco')}
                    className={`w-8 h-8 rounded border-2 transition-all duration-300 hover:scale-110 hover:shadow-lg ${
                      selectedColor === 'Blanco' 
                        ? 'border-gray-800' 
                        : 'border-gray-300 hover:border-gray-500'
                    }`}
                    style={{ backgroundColor: '#FFFFFF' }}
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
                className="liquid-button flex-1 min-w-[200px] bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-300"
              >
                Agregar al carrito
              </button>
            </div>

            <button
              onClick={handleBuyNow}
              className="w-full bg-white border-2 border-green-600 text-green-600 hover:bg-green-600 hover:text-white font-medium py-3 px-6 rounded-lg transition-all duration-500 hover:scale-105 hover:shadow-lg"
            >
              Comprar ahora
            </button>

            {/* Información adicional */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Garantía de 1 año</div>
                  <div className="text-gray-600">Cobertura completa en todos nuestros productos</div>
                </div>
              </div>
              
              <div className="flex items-center gap-4 text-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Fabricación personalizada</div>
                  <div className="text-gray-600">Tu pedido se fabrica en 5-7 días hábiles</div>
                </div>
              </div>

              <div className="flex items-center gap-4 text-sm">
                <div className="flex-shrink-0 w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div>
                  <div className="font-semibold text-gray-800">Envío rápido</div>
                  <div className="text-gray-600">Despacho en 24-48 horas una vez fabricado</div>
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
            {/* Acordeón 1 */}
            <div className="border-b border-gray-200">
              <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">DESCRIPCIÓN SERIE CLASSIC</span>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Acordeón 2 */}
            <div className="border-b border-gray-200">
              <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">DESCRIPCIÓN SERIE PRO</span>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Acordeón 3 */}
            <div className="border-b border-gray-200">
              <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">¿TIENEN CAMBIO O DEVOLUCIÓN?</span>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>

            {/* Acordeón 4 */}
            <div>
              <button className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors">
                <span className="font-semibold text-gray-800">¿QUÉ DEMORA TIENEN EN FABRICARSE?</span>
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Métodos de pago */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">MÉTODOS DE PAGO</h2>
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-800">Tarjeta de Crédito</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-800">Transferencia</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-800">Efectivo</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-800">Cuotas</div>
              </div>
            </div>
          </div>
        </div>

        {/* También te puede gustar */}
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
            {/* Producto 1 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Mousepad Samurai</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Mousepad Samurai con katana 90x40 Classic | PERSONALIZADO</h3>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500 line-through">$23.750,00</div>
                  <div className="text-sm font-bold text-gray-800">$19.000,00</div>
                  <div className="text-xs text-green-600">con transferencia</div>
                </div>
              </div>
            </div>

            {/* Producto 2 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center">
                <span className="text-gray-800 text-sm font-medium">Mousepad CS</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Mousepad CS | MGMGAMERS</h3>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">A partir de $14.375,00</div>
                  <div className="text-sm font-bold text-gray-800">$11.500,00</div>
                  <div className="text-xs text-green-600">con transferencia</div>
                </div>
              </div>
            </div>

            {/* Producto 3 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-gray-900 to-black flex items-center justify-center">
                <span className="text-white text-sm font-medium">Mousepad X White</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Mousepad X White | MGMGAMERS</h3>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">A partir de $18.125,00</div>
                  <div className="text-sm font-bold text-gray-800">$14.500,00</div>
                  <div className="text-xs text-green-600">con transferencia</div>
                </div>
              </div>
            </div>

            {/* Producto 4 */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="h-48 bg-gradient-to-br from-green-800 to-green-900 flex items-center justify-center">
                <span className="text-white text-sm font-medium">Mousepad Grid</span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-800 text-sm mb-2">Mousepad Grid | MGMGAMERS</h3>
                <div className="space-y-1">
                  <div className="text-xs text-gray-500">A partir de $23.750,00</div>
                  <div className="text-sm font-bold text-gray-800">$19.000,00</div>
                  <div className="text-xs text-green-600">con transferencia</div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
                  ${product.precio.toFixed(2)}
                </div>
              </div>
              
              {/* Botón de agregar al carrito */}
              <div className="flex-shrink-0">
                <button
                  onClick={handleAddToCart}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-full text-sm transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  Agregar al carrito
                </button>
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
            />
          </div>
        </div>
      )}
    </div>
  );
}
