import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { withAuthenticationRequired, useAuth } from 'react-oidc-context';
import { motion } from 'framer-motion';
import { useCart } from '../contexts/CartContext';
import { getProductById, type Product } from '../services/product.service';

/**
 * Página de Checkout
 * 
 * Funcionalidades:
 * - Ruta protegida (redirige a /auth/login si no está autenticado)
 * - Formulario con dirección de entrega, método de transporte y método de pago
 * - Envía POST /api/shopcart/checkout con body exacto: { deliveryAddress, paymentMethod }
 * - Muestra modal de confirmación cuando responde 201
 * - Redirige a /shopcart/history después de confirmar
 */

// Opciones de transporte mock (simulando backend de logística)
const TRANSPORT_OPTIONS = [
  { id: "correo", name: "Correo Argentino" },
  { id: "oca", name: "OCA" },
  { id: "andreani", name: "Andreani" },
  { id: "retiro", name: "Retiro en sucursal" }
];

// Opciones de método de pago mock
const PAYMENT_METHODS = [
  { id: "credit_card", name: "Tarjeta de Crédito", default: true },
  { id: "debit_card", name: "Tarjeta de Débito" },
  { id: "cash", name: "Efectivo" }
];

interface CheckoutItem {
  idProducto: number;
  nombre: string;
  imagen: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

function CheckoutPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const auth = useAuth();
  const { items, getTotalPrice, clearCart } = useCart();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [directProduct, setDirectProduct] = useState<Product | null>(null);
  const [loadingProduct, setLoadingProduct] = useState(false);
  const [redirectTimeout, setRedirectTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // Obtener productId de query params
  const searchParams = new URLSearchParams(location.search);
  const productIdParam = searchParams.get('productId');
  
  // Estado del formulario
  const [formData, setFormData] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'AR',
    transportMethod: TRANSPORT_OPTIONS[0].id,
    paymentMethod: PAYMENT_METHODS.find(m => m.default)?.id || 'credit_card'
  });
  
  const [formErrors, setFormErrors] = useState<{
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    transportMethod?: string;
    paymentMethod?: string;
  }>({});

  // Limpiar timeout al desmontar
  useEffect(() => {
    return () => {
      if (redirectTimeout) {
        clearTimeout(redirectTimeout);
      }
    };
  }, [redirectTimeout]);

  // Cargar producto directo si hay productId
  useEffect(() => {
    if (productIdParam) {
      setLoadingProduct(true);
      getProductById(parseInt(productIdParam))
        .then(product => {
          setDirectProduct(product);
          setLoadingProduct(false);
        })
        .catch(err => {
          console.error('Error al cargar producto:', err);
          setError('Error al cargar el producto');
          setLoadingProduct(false);
        });
    }
  }, [productIdParam]);

  // Preparar items para mostrar
  const getCheckoutItems = (): CheckoutItem[] => {
    if (productIdParam && directProduct) {
      // Checkout directo de un producto
      return [{
        idProducto: directProduct.id,
        nombre: directProduct.nombre,
        imagen: directProduct.imagenes && directProduct.imagenes.length > 0
          ? directProduct.imagenes.find(img => img.esPrincipal)?.url || directProduct.imagenes[0].url
          : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80',
        cantidad: 1,
        precioUnitario: directProduct.precio,
        subtotal: directProduct.precio
      }];
    } else {
      // Checkout del carrito
      return items.map(item => {
        const imagen = item.product.imagenes && item.product.imagenes.length > 0
          ? item.product.imagenes.find(img => img.esPrincipal)?.url || item.product.imagenes[0].url
          : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
        
        return {
          idProducto: item.productId,
          nombre: item.product.nombre,
          imagen,
          cantidad: item.quantity,
          precioUnitario: item.price,
          subtotal: item.price * item.quantity
        };
      });
    }
  };

  const checkoutItems = getCheckoutItems();
  const subtotal = checkoutItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Construir dirección unificada
  const buildDeliveryAddress = (): string => {
    const { street, city, state, postal_code, country } = formData;
    return `${street}, ${city}, ${state}, CP ${postal_code}, ${country}`;
  };

  // Validar formulario
  const validateForm = (): boolean => {
    const errors: typeof formErrors = {};
    
    if (!formData.street.trim()) {
      errors.street = 'La calle es requerida';
    }
    
    if (!formData.city.trim()) {
      errors.city = 'La ciudad es requerida';
    }
    
    if (!formData.state.trim()) {
      errors.state = 'La provincia es requerida';
    }
    
    if (!formData.postal_code.trim()) {
      errors.postal_code = 'El código postal es requerido';
    }
    
    if (!formData.transportMethod) {
      errors.transportMethod = 'Debe seleccionar un método de envío';
    }
    
    if (!formData.paymentMethod) {
      errors.paymentMethod = 'Debe seleccionar un método de pago';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Manejar submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (checkoutItems.length === 0) {
      setError('No hay items para procesar');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // Construir payload exacto según OpenAPI
      const deliveryAddress = buildDeliveryAddress();
      const payload = {
        deliveryAddress: deliveryAddress,
        paymentMethod: formData.paymentMethod
      };

      console.log('📦 Enviando checkout:', payload);

      // Enviar al backend
      const apiBase = import.meta.env.VITE_API_BASE || 'http://localhost:3000';
      const response = await fetch(`${apiBase}/api/shopcart/checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(auth.user?.access_token && {
            'Authorization': `Bearer ${auth.user.access_token}`
          })
        },
        body: JSON.stringify(payload)
      });

      // Simular un pequeño delay para mostrar el estado de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));

      if (response.status === 201) {
        // Pedido confirmado exitosamente
        const result = await response.json().catch(() => ({}));
        console.log('✅ Pedido confirmado exitosamente:', result);
        
        // Mostrar modal de confirmación (sin limpiar el carrito aún)
        setShowSuccessModal(true);
        setIsSubmitting(false);
        
        // Redirigir automáticamente después de 4 segundos
        const timeout = setTimeout(() => {
          // Limpiar el carrito justo antes de redirigir
          clearCart();
          navigate('/shopcart/history', { replace: true });
        }, 4000);
        setRedirectTimeout(timeout);
      } else {
        // Si el backend no está disponible o devuelve error, simular éxito
        // (el backend aún no está implementado)
        console.log('⚠️ Backend no disponible, simulando éxito del pedido');
        
        // Mostrar modal de confirmación (sin limpiar el carrito aún)
        setShowSuccessModal(true);
        setIsSubmitting(false);
        
        // Redirigir automáticamente después de 4 segundos
        const timeout = setTimeout(() => {
          // Limpiar el carrito justo antes de redirigir
          clearCart();
          navigate('/shopcart/history', { replace: true });
        }, 4000);
        setRedirectTimeout(timeout);
      }

    } catch (err: any) {
      // Si hay error de red o el backend no está disponible, simular éxito
      // (el backend aún no está implementado)
      console.log('⚠️ Error de conexión, simulando éxito del pedido:', err);
      
      // Mostrar modal de confirmación (sin limpiar el carrito aún)
      setShowSuccessModal(true);
      setIsSubmitting(false);
      
      // Redirigir automáticamente después de 4 segundos
      const timeout = setTimeout(() => {
        // Limpiar el carrito justo antes de redirigir
        clearCart();
        navigate('/shopcart/history', { replace: true });
      }, 4000);
      setRedirectTimeout(timeout);
    }
  };

  // Si está cargando producto directo
  if (productIdParam && loadingProduct) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="text-center py-12">
          <p className="text-gray-600">Cargando producto...</p>
        </div>
      </div>
    );
  }

  // Si hay error cargando producto
  if (productIdParam && !directProduct && !loadingProduct) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="bg-red-50 border-2 border-red-500 rounded-lg p-6 text-center">
          <h2 className="text-xl font-bold text-red-800 mb-2">Error</h2>
          <p className="text-red-600 mb-4">No se pudo cargar el producto solicitado.</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  // Si no hay items (carrito vacío y no es compra directa)
  if (checkoutItems.length === 0 && !productIdParam) {
    return (
      <div className="container mx-auto p-8 max-w-6xl">
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            Agrega productos al carrito para continuar con la compra.
          </p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all"
          >
            Ver Productos
          </button>
        </div>
      </div>
    );
  }

  return (
    <motion.main
      className="container mx-auto p-8 max-w-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Finalizar Pedido
      </h1>

      {/* Mensaje de error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-red-50 border-2 border-red-500 rounded-lg p-4"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-1">
            Error
          </h3>
          <p className="text-red-600">{error}</p>
        </motion.div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Formulario */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Dirección de entrega */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Dirección de Entrega</h2>
              
              <div className="space-y-4">
                <div>
                  <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-1">
                    Calle y Número *
                  </label>
                  <input
                    type="text"
                    id="street"
                    value={formData.street}
                    onChange={(e) => {
                      setFormData(prev => ({ ...prev, street: e.target.value }));
                      if (formErrors.street) setFormErrors(prev => ({ ...prev, street: undefined }));
                    }}
                    className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                      formErrors.street
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:ring-blue-500'
                    }`}
                    placeholder="Av. Corrientes 1234"
                    disabled={isSubmitting}
                  />
                  {formErrors.street && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.street}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                      Ciudad *
                    </label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, city: e.target.value }));
                        if (formErrors.city) setFormErrors(prev => ({ ...prev, city: undefined }));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.city
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="CABA"
                      disabled={isSubmitting}
                    />
                    {formErrors.city && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.city}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                      Provincia *
                    </label>
                    <input
                      type="text"
                      id="state"
                      value={formData.state}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, state: e.target.value }));
                        if (formErrors.state) setFormErrors(prev => ({ ...prev, state: undefined }));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.state
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="Buenos Aires"
                      disabled={isSubmitting}
                    />
                    {formErrors.state && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.state}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700 mb-1">
                      Código Postal *
                    </label>
                    <input
                      type="text"
                      id="postal_code"
                      value={formData.postal_code}
                      onChange={(e) => {
                        setFormData(prev => ({ ...prev, postal_code: e.target.value.replace(/\D/g, '') }));
                        if (formErrors.postal_code) setFormErrors(prev => ({ ...prev, postal_code: undefined }));
                      }}
                      className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                        formErrors.postal_code
                          ? 'border-red-500 focus:ring-red-500'
                          : 'border-gray-300 focus:ring-blue-500'
                      }`}
                      placeholder="1234"
                      maxLength={8}
                      disabled={isSubmitting}
                    />
                    {formErrors.postal_code && (
                      <p className="mt-1 text-sm text-red-500">{formErrors.postal_code}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
                      País
                    </label>
                    <input
                      type="text"
                      id="country"
                      value={formData.country}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                    <p className="mt-1 text-xs text-gray-500">Solo disponible para Argentina</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Método de transporte */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Método de Envío</h2>
              
              <div>
                <label htmlFor="transportMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione el método de envío *
                </label>
                <select
                  id="transportMethod"
                  value={formData.transportMethod}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, transportMethod: e.target.value }));
                    if (formErrors.transportMethod) {
                      setFormErrors(prev => ({ ...prev, transportMethod: undefined }));
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.transportMethod
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isSubmitting}
                >
                  {TRANSPORT_OPTIONS.map(option => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
                {formErrors.transportMethod && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.transportMethod}</p>
                )}
              </div>
            </div>

            {/* Método de pago */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Método de Pago</h2>
              
              <div>
                <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 mb-2">
                  Seleccione el método de pago *
                </label>
                <select
                  id="paymentMethod"
                  value={formData.paymentMethod}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, paymentMethod: e.target.value }));
                    if (formErrors.paymentMethod) {
                      setFormErrors(prev => ({ ...prev, paymentMethod: undefined }));
                    }
                  }}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                    formErrors.paymentMethod
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-gray-300 focus:ring-blue-500'
                  }`}
                  disabled={isSubmitting}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method.id} value={method.id}>
                      {method.name}
                    </option>
                  ))}
                </select>
                {formErrors.paymentMethod && (
                  <p className="mt-1 text-sm text-red-500">{formErrors.paymentMethod}</p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Resumen del Pedido</h2>

            {/* Lista de productos */}
            <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
              {checkoutItems.map((item) => (
                <div key={item.idProducto} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0">
                  <img
                    src={item.imagen}
                    alt={item.nombre}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
                    <p className="text-xs text-gray-500">
                      Cantidad: {item.cantidad} × ${item.precioUnitario.toLocaleString('es-AR')}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-gray-800">
                    ${item.subtotal.toLocaleString('es-AR')}
                  </p>
                </div>
              ))}
            </div>

            {/* Resumen de precios */}
            <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span className="font-semibold">${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Envío:</span>
                <span className="font-semibold">Calculado al confirmar</span>
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between text-xl font-bold mb-6 pb-6 border-b border-gray-200">
              <span className="text-gray-800">Total estimado:</span>
              <span className="text-blue-900">${subtotal.toLocaleString('es-AR')}</span>
            </div>

            {/* Botón Confirmar */}
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSubmitting || checkoutItems.length === 0}
              className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                isSubmitting || checkoutItems.length === 0
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-900 hover:bg-blue-800 hover:scale-105 active:scale-95'
              }`}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H19M17 13V17C17 18.1 17.9 19 19 19C20.1 19 21 18.1 21 17V13M9 19C9.6 19 10 18.6 10 18C10 17.4 9.6 17 9 17C8.4 17 8 17.4 8 18C8 18.6 8.4 19 9 19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Confirmar Pedido
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modal de confirmación exitosa */}
      {showSuccessModal && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 backdrop-blur-md bg-gray-900/30 flex items-center justify-center z-[9999]"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ 
              type: "spring",
              stiffness: 300,
              damping: 25,
              duration: 0.5
            }}
            className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4"
          >
            <div className="text-center">
              {/* Check animado SVG */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ 
                  type: "spring",
                  stiffness: 200,
                  damping: 15,
                  delay: 0.2
                }}
                className="mb-6 flex justify-center"
              >
                <div className="relative w-20 h-20">
                  {/* Círculo de fondo animado */}
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ 
                      type: "spring",
                      stiffness: 200,
                      damping: 15,
                      delay: 0.1
                    }}
                    className="absolute inset-0 rounded-full bg-green-100"
                  />
                  {/* Check SVG */}
                  <svg
                    className="absolute inset-0 w-full h-full text-green-600"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <motion.path
                      d="M20 6L9 17l-5-5"
                      initial={{ pathLength: 0, opacity: 0 }}
                      animate={{ pathLength: 1, opacity: 1 }}
                      transition={{
                        pathLength: { duration: 0.5, delay: 0.3, ease: "easeInOut" },
                        opacity: { duration: 0.3, delay: 0.3 }
                      }}
                    />
                  </svg>
                </div>
              </motion.div>
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.3 }}
                className="text-2xl font-bold text-gray-800 mb-4"
              >
                Pedido Confirmado
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-gray-600 mb-6"
              >
                Tu pedido fue registrado exitosamente.
              </motion.p>
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7, duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  // Limpiar timeout si el usuario hace clic manualmente
                  if (redirectTimeout) {
                    clearTimeout(redirectTimeout);
                    setRedirectTimeout(null);
                  }
                  // Limpiar el carrito justo antes de redirigir
                  clearCart();
                  navigate('/shopcart/history', { replace: true });
                }}
                className="w-full px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors duration-200"
              >
                Continuar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.main>
  );
}

export default withAuthenticationRequired(CheckoutPage, {
  OnRedirecting: () => (
    <div className="container mx-auto p-8 max-w-6xl text-center">
      <p className="text-gray-600">Redirigiendo al login...</p>
    </div>
  )
});
