// src/routes/payment.route.tsx
import { withAuthenticationRequired } from "react-oidc-context";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CheckoutSteps } from "../components/CheckoutSteps";
import { createShipping, type CreateShippingRequest } from "../services/shipping.service";
import { createOrder, type CreateOrderRequest } from "../services/order.service";
import { createReservation, type CreateReservationRequest } from "../services/reservation.service";
import { getAccessToken } from "../services/auth/getAccessToken";
import { getUserId } from "../services/auth/getUserId";
import { useAuth } from "react-oidc-context";
import { notificationManager } from "../utils/notifications";

interface ShippingData {
  deliveryAddress: {
    street: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
  };
  transportType: string;
  shippingCost: number;
}

function PaymentRoute() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { items, getTotalPrice } = useCart();
  const auth = useAuth();
  const [paymentMethod, setPaymentMethod] = useState<string>('card');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);

  // Función para formatear el campo de vencimiento (MM/AA)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, ''); // Solo números
    
    // Limitar a 4 dígitos
    if (value.length > 4) {
      value = value.slice(0, 4);
    }
    
    // Agregar barra después de 2 dígitos
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setCardData({ ...cardData, expiry: value });
  };

  // Cargar datos de shipping del paso anterior
  useEffect(() => {
    const savedShippingData = localStorage.getItem('shipping_data');
    if (savedShippingData) {
      try {
        setShippingData(JSON.parse(savedShippingData));
      } catch (error) {
        console.error('Error parsing shipping data:', error);
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      if (!shippingData || !auth.user) {
        throw new Error('Faltan datos de envío o autenticación');
      }

      const token = getAccessToken(auth.user);
      const userId = getUserId(auth.user);
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }
      
      if (!userId) {
        throw new Error('No se pudo obtener el ID del usuario');
      }

      // Generar un order_id único compatible con INT (máximo 2,147,483,647)
      // Usamos los últimos 9 dígitos del timestamp para mantener unicidad
      const timestamp = Date.now();
      const orderId = parseInt(timestamp.toString().slice(-9), 10); // Últimos 9 dígitos
      const idCompra = `compra-${timestamp}`;
      
      // Validar que todos los productos tengan IDs válidos
      const invalidProducts = items.filter(item => !item.product || !item.product.id);
      if (invalidProducts.length > 0) {
        throw new Error('Algunos productos no tienen un ID válido. Por favor, actualiza tu carrito.');
      }
      
      // PASO 1: Crear reserva en stock (antes de crear el envío)
      let reservationResponse;
      try {
        const reservationRequest: CreateReservationRequest = {
          idCompra: idCompra,
          usuarioId: userId,
          productos: items.map(item => ({
            idProducto: item.product.id,
            cantidad: item.quantity
          }))
        };
        
        reservationResponse = await createReservation(reservationRequest, token);
      } catch (reservationError: any) {
        console.error('Error al crear reserva:', reservationError);
        const errorMessage = reservationError.message || 'No se pudo crear la reserva de stock';
        notificationManager.error(
          'Error al reservar stock',
          `${errorMessage}. Por favor, verifica que haya stock disponible e intenta nuevamente.`
        );
        throw new Error(errorMessage);
      }
      
      // PASO 2: Si la reserva fue exitosa, crear envío en logística
      let shippingResponse;
      try {
        // Asegurar que delivery_address tenga el formato correcto con todos los campos requeridos
        const delivery_address = {
          street: shippingData.deliveryAddress.street,
          city: shippingData.deliveryAddress.city,
          state: shippingData.deliveryAddress.state,
          postal_code: shippingData.deliveryAddress.postal_code,
          country: shippingData.deliveryAddress.country || 'Argentina'
        };
        
        // Asegurar que user_id y order_id sean números
        const userIdNumber = typeof userId === 'string' ? parseInt(userId, 10) : userId;
        const orderIdNumber = typeof orderId === 'string' ? parseInt(orderId, 10) : orderId;
        
        if (isNaN(userIdNumber) || isNaN(orderIdNumber)) {
          throw new Error('user_id o order_id no son números válidos');
        }
        
        const shippingRequest: CreateShippingRequest = {
          user_id: userIdNumber,
          order_id: orderIdNumber,
          delivery_address: delivery_address,
          transport_type: shippingData.transportType as 'air' | 'sea' | 'road' | 'rail',
          products: items.map(item => ({
            id: item.product.id,
            quantity: item.quantity
          }))
        };
        
        console.log('[PaymentRoute] Creando envío con request:', JSON.stringify(shippingRequest, null, 2));
        shippingResponse = await createShipping(shippingRequest, token);
      } catch (shippingError: any) {
        console.error('Error al crear envío:', shippingError);
        const errorMessage = shippingError.message || 'No se pudo crear el envío';
        notificationManager.error(
          'Error al crear envío',
          `${errorMessage}. Por favor, intenta nuevamente.`
        );
        throw new Error(errorMessage);
      }
      
      // PASO 3: Si el envío fue exitoso, crear la orden en nuestro backend
      const orderRequest: CreateOrderRequest = {
        shippingId: shippingResponse.shipping_id,
        transportType: shippingData.transportType as 'air' | 'sea' | 'road' | 'rail',
        shippingCost: shippingData.shippingCost,
        deliveryAddress: shippingData.deliveryAddress,
        products: items.map(item => ({
          id: item.product.id,
          quantity: item.quantity,
          price: item.price // Precio unitario del producto
        }))
      };
      
      const orderResponse = await createOrder(token, orderRequest);
      
      // Guardar el orderId para mostrarlo en la confirmación
      localStorage.setItem('order_id', orderResponse.orderId.toString());
      
      // Limpiar datos de shipping
      localStorage.removeItem('shipping_data');
      
      // Redirigir a la página de confirmación con el orderId
      navigate(`/shopcart/confirmation?orderId=${orderResponse.orderId}`);
    } catch (error: any) {
      console.error('Error al procesar pago y crear envío:', error);
      notificationManager.error(
        'Error al procesar el pago',
        error.message || 'Por favor, intenta nuevamente.'
      );
      setIsProcessing(false);
    }
  };

  const handleBack = () => {
    navigate('/shopcart/shipping');
  };

  const subtotal = getTotalPrice() || 0;
  const shippingCost = shippingData?.shippingCost || 0;
  const total = subtotal + shippingCost;

  return (
    <>
      <CheckoutSteps />
      <motion.main
        className={`container mx-auto p-8 max-w-4xl min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-bold mb-8 text-gray-800 dark:text-white">
          Método de Pago
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Métodos de Pago */}
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Selecciona un Método de Pago
              </h2>
              <div className="space-y-3 mb-6">
                <label
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'card'
                      ? isDark
                        ? 'border-blue-400 bg-blue-900/30'
                        : 'border-blue-600 bg-blue-50'
                      : isDark
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={paymentMethod === 'card'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      Tarjeta de Crédito/Débito
                    </div>
                  </div>
                </label>
                <label
                  className={`flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    paymentMethod === 'transfer'
                      ? isDark
                        ? 'border-blue-400 bg-blue-900/30'
                        : 'border-blue-600 bg-blue-50'
                      : isDark
                      ? 'border-gray-700 hover:border-gray-600'
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                >
                  <input
                    type="radio"
                    name="payment"
                    value="transfer"
                    checked={paymentMethod === 'transfer'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <div className="flex-1">
                    <div className={`font-semibold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      Transferencia bancaria
                    </div>
                    <div className={`text-sm ${
                      isDark ? 'text-gray-300' : 'text-gray-600'
                    }`}>
                      20% de descuento
                    </div>
                  </div>
                </label>
              </div>

              {/* Formulario de Tarjeta */}
              {paymentMethod === 'card' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Número de Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardData.number}
                      onChange={(e) => setCardData({ ...cardData, number: e.target.value })}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                      Nombre en la Tarjeta
                    </label>
                    <input
                      type="text"
                      value={cardData.name}
                      onChange={(e) => setCardData({ ...cardData, name: e.target.value })}
                      placeholder="Juan Pérez"
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        Vencimiento
                      </label>
                      <input
                        type="text"
                        value={cardData.expiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/AA"
                        maxLength={5}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardData.cvv}
                        onChange={(e) => setCardData({ ...cardData, cvv: e.target.value })}
                        placeholder="123"
                        maxLength={3}
                        className={`w-full px-4 py-2 rounded-lg border ${
                          isDark 
                            ? 'bg-gray-800 border-gray-700 text-white' 
                            : 'bg-white border-gray-300 text-gray-900'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        required
                      />
                    </div>
                  </div>
                </form>
              )}

              {paymentMethod === 'transfer' && (
                <div className={`p-4 rounded-lg ${
                  isDark ? 'bg-gray-800' : 'bg-gray-100'
                }`}>
                  <p className={`text-sm mb-2 ${
                    isDark ? 'text-gray-200' : 'text-gray-800'
                  }`}>
                    Realiza una transferencia bancaria a:
                  </p>
                  <p className={`font-mono text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    CBU: 1234567890123456789012
                  </p>
                  <p className={`font-mono text-sm ${
                    isDark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Alias: COMPRAS.DS.2025
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Resumen del Pedido
              </h2>
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Subtotal:</span>
                  <span className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${
                    isDark ? 'text-gray-400' : 'text-gray-600'
                  }`}>Envío:</span>
                  <span className={`font-semibold ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}>${shippingCost.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span className={`${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>Total:</span>
                <span className={`${
                  isDark ? 'text-white' : 'text-gray-800'
                }`}>${total.toLocaleString('es-AR')}</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing || (paymentMethod === 'card' && (!cardData.number || !cardData.name || !cardData.expiry || !cardData.cvv))}
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? 'Procesando...' : 'Confirmar pago'}
                </button>
                <button
                  onClick={handleBack}
                  className="w-full bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300"
                >
                  Volver
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.main>
    </>
  );
}

export default withAuthenticationRequired(PaymentRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

