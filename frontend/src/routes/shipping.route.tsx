// src/routes/shipping.route.tsx
import { withAuthenticationRequired } from "react-oidc-context";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CheckoutSteps } from "../components/CheckoutSteps";
import { calculateShippingCost, getTransportMethods, type ShippingCostRequest, type TransportMethod } from "../services/shipping.service";
import { getAccessToken } from "../services/auth/getAccessToken";
import { useAuth } from "react-oidc-context";
import { notificationManager } from "../utils/notifications";

function ShippingRoute() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { items, getTotalPrice } = useCart();
  const auth = useAuth();
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null);
  const [shippingCost, setShippingCost] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [transportMethods, setTransportMethods] = useState<TransportMethod[]>([]);
  const [costsByTransport, setCostsByTransport] = useState<Record<string, number>>({});
  const [deliveryAddress, setDeliveryAddress] = useState({
    street: '',
    city: '',
    state: '',
    postal_code: '',
    country: 'Argentina'
  });

  // Cargar métodos de transporte al montar el componente
  useEffect(() => {
    const loadTransportMethods = async () => {
      try {
        const response = await getTransportMethods();
        setTransportMethods(response.transportMethods || []);
      } catch (error) {
        console.error('Error loading transport methods:', error);
      }
    };
    loadTransportMethods();
  }, []);

  // Validar formato de código postal: LNNNNLLL (1 letra, 4 números, 3 letras)
  // Ejemplo: H3500AAA
  const validatePostalCode = (postalCode: string): boolean => {
    if (!postalCode) return false;
    
    // Eliminar espacios en blanco y convertir a mayúsculas
    const cleaned = postalCode.trim().toUpperCase();
    
    // Validar que tenga exactamente 8 caracteres
    if (cleaned.length !== 8) {
      return false;
    }
    
    // Formato: LNNNNLLL (ejemplo: H3500AAA)
    // 1 letra + 4 números + 3 letras
    const postalCodeRegex = /^[A-Z]\d{4}[A-Z]{3}$/;
    return postalCodeRegex.test(cleaned);
  };

  const handleCalculateShipping = async () => {
    if (!deliveryAddress.street || !deliveryAddress.city || !deliveryAddress.state || !deliveryAddress.postal_code) {
      notificationManager.warning(
        'Campos incompletos',
        'Por favor, completa todos los campos de la dirección de entrega'
      );
      return;
    }

    // Validar formato del código postal
    if (!validatePostalCode(deliveryAddress.postal_code)) {
      notificationManager.error(
        'Código postal inválido',
        'El código postal debe tener el formato LNNNNLLL (1 letra, 4 números, 3 letras). Ejemplo: H3500AAA'
      );
      return;
    }

    setIsCalculating(true);
    
    try {
      const token = getAccessToken(auth.user);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      // El endpoint /shipping/cost NO acepta transport_type en el request
      // El backend elige automáticamente el método de transporte
      // Limpiar y normalizar el código postal antes de enviarlo
      const cleanedPostalCode = deliveryAddress.postal_code.trim().toUpperCase();
      const request: ShippingCostRequest = {
        delivery_address: {
          ...deliveryAddress,
          postal_code: cleanedPostalCode
        },
        products: items.map(item => ({
          id: item.product.id,
          quantity: item.quantity
        }))
      };

      const result = await calculateShippingCost(request, token);
      
      // El backend devuelve el transport_type que eligió y el costo
      const selectedTransportType = result.transport_type;
      const cost = result.total_cost;
      
      // Guardar el costo para el método de transporte elegido por el backend
      setCostsByTransport({ [selectedTransportType]: cost });
      setSelectedShipping(selectedTransportType);
      setShippingCost(cost);
    } catch (error: any) {
      console.error('Error calculating shipping:', error);
      notificationManager.error(
        'Error al calcular envío',
        error.message || 'Por favor, intenta nuevamente.'
      );
    } finally {
      setIsCalculating(false);
    }
  };

  const handleContinue = () => {
    if (!selectedShipping) {
      notificationManager.warning(
        'Selección requerida',
        'Por favor, selecciona una forma de envío'
      );
      return;
    }
    if (shippingCost === null) {
      notificationManager.warning(
        'Cálculo requerido',
        'Por favor, calcula el costo de envío primero'
      );
      return;
    }
    
    // Guardar datos de shipping en localStorage para usarlos en el paso de pago
    localStorage.setItem('shipping_data', JSON.stringify({
      deliveryAddress,
      transportType: selectedShipping,
      shippingCost
    }));
    
    navigate('/shopcart/payment');
  };

  const handleSelectShipping = (transportType: string) => {
    setSelectedShipping(transportType);
    setShippingCost(costsByTransport[transportType] || null);
  };

  const handleBack = () => {
    navigate('/shopcart');
  };

  const subtotal = getTotalPrice() || 0;
  const total = subtotal + (shippingCost ?? 0);

  return (
    <>
      <CheckoutSteps />
      <motion.main
        className={`container mx-auto p-8 max-w-4xl min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <h1 className={`text-3xl font-bold mb-8 ${isDark ? 'text-white' : 'text-gray-800'}`}>
          Seleccionar forma de envío
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Dirección de Entrega */}
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Dirección de Entrega
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Calle y Número
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.street}
                    onChange={(e) => setDeliveryAddress({ ...deliveryAddress, street: e.target.value })}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="Av. Corrientes 1234"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Ciudad
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.city}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, city: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Resistencia"
                    />
                  </div>
                  <div>
                    <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                      Provincia
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress.state}
                      onChange={(e) => setDeliveryAddress({ ...deliveryAddress, state: e.target.value })}
                      className={`w-full px-4 py-2 rounded-lg border ${
                        isDark 
                          ? 'bg-gray-800 border-gray-700 text-white' 
                          : 'bg-white border-gray-300 text-gray-900'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Chaco"
                    />
                  </div>
                </div>
                <div>
                  <label className={`block text-sm font-medium mb-2 ${isDark ? 'text-white' : 'text-gray-700'}`}>
                    Código Postal
                  </label>
                  <input
                    type="text"
                    value={deliveryAddress.postal_code}
                    onChange={(e) => {
                      // Convertir a mayúsculas automáticamente
                      const upperValue = e.target.value.toUpperCase();
                      setDeliveryAddress({ ...deliveryAddress, postal_code: upperValue });
                    }}
                    maxLength={8}
                    className={`w-full px-4 py-2 rounded-lg border ${
                      isDark 
                        ? 'bg-gray-800 border-gray-700 text-white' 
                        : 'bg-white border-gray-300 text-gray-900'
                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    placeholder="H3500AAA"
                  />
                  <p className={`mt-1 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                    Formato: 1 letra, 4 números, 3 letras (ejemplo: H3500AAA)
                  </p>
                </div>
                <button
                  onClick={handleCalculateShipping}
                  disabled={isCalculating}
                  className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isCalculating ? 'Calculando...' : 'Calcular costo de envío'}
                </button>
              </div>
            </div>

            {/* Opciones de Envío */}
            {shippingCost !== null && selectedShipping && (
              <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
                <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Método de Envío Seleccionado
                </h2>
                <div className="space-y-3">
                  {transportMethods
                    .filter(method => method.type === selectedShipping)
                    .map((method) => {
                      const cost = costsByTransport[method.type] || shippingCost;
                      
                      return (
                        <div
                          key={method.type}
                          className={`flex items-center p-4 rounded-lg border-2 ${
                            isDark
                              ? 'border-blue-400 bg-blue-900/30'
                              : 'border-blue-600 bg-blue-50'
                          }`}
                        >
                          <div className="flex-1">
                            <div className={`font-semibold flex items-center gap-2 ${
                              isDark ? 'text-white' : 'text-gray-800'
                            }`}>
                              {method.name}
                              <span className={`text-xs px-2 py-1 rounded font-medium ${
                                isDark 
                                  ? 'bg-blue-500 text-white' 
                                  : 'bg-blue-600 text-white'
                              }`}>
                                Recomendado
                              </span>
                            </div>
                            <div className={`text-sm ${
                              isDark ? 'text-white' : 'text-gray-600'
                            }`}>
                              {method.estimatedDays}
                            </div>
                          </div>
                          <div className={`font-bold ${
                            isDark ? 'text-white' : 'text-gray-800'
                          }`}>
                            ${cost.toLocaleString('es-AR')}
                          </div>
                        </div>
                      );
                    })}
                </div>
                <p className={`mt-4 text-sm ${isDark ? 'text-white' : 'text-gray-600'}`}>
                  El método de transporte fue seleccionado automáticamente por el sistema según las características de tu pedido.
                </p>
              </div>
            )}
          </div>

          {/* Resumen */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Resumen del Pedido
              </h2>
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-white' : 'text-gray-600'}`}>Subtotal:</span>
                  <span className="font-semibold">${(subtotal || 0).toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className={`${isDark ? 'text-white' : 'text-gray-600'}`}>Envío:</span>
                  <span className="font-semibold">
                    {shippingCost !== null 
                      ? `$${shippingCost.toLocaleString('es-AR')}` 
                      : 'No calculado'}
                  </span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span className={`${isDark ? 'text-white' : 'text-gray-800'}`}>Total:</span>
                <span>${(total || 0).toLocaleString('es-AR')}</span>
              </div>
              <div className="space-y-3">
                <button
                  onClick={handleContinue}
                  disabled={!selectedShipping || shippingCost === null}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continuar al pago
                </button>
                <button
                  onClick={handleBack}
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${isDark ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-gray-200 text-gray-800 hover:bg-gray-300'}`}
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

export default withAuthenticationRequired(ShippingRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

