// src/routes/confirmation.route.tsx
import { withAuthenticationRequired } from "react-oidc-context";
import { useNavigate, Link, useSearchParams } from "react-router";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";
import { useCart } from "../contexts/CartContext";
import { CheckoutSteps } from "../components/CheckoutSteps";
import { useState, useEffect } from "react";
import { getOrderById, type OrderResponse } from "../services/order.service";
import { getAccessToken } from "../services/auth/getAccessToken";
import { useAuth } from "react-oidc-context";
import { getProductByIdFromStock, type Product } from "../services/product.service";

function ConfirmationRoute() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { clearCart } = useCart();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadOrder = async () => {
      const orderIdParam = searchParams.get('orderId');
      
      if (!orderIdParam) {
        setError('No se encontró el ID de la orden');
        setLoading(false);
        return;
      }

      // orderId es un string (BigInt serializado)
      const orderId = orderIdParam;

      if (!auth.user) {
        setError('Usuario no autenticado');
        setLoading(false);
        return;
      }

      try {
        const token = getAccessToken(auth.user);
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        const orderData = await getOrderById(token, orderId);
        setOrder(orderData);
        
        // Obtener los detalles de cada producto desde el backend de stock
        const productsMap = new Map<number, Product>();
        const productPromises = orderData.products.map(async (orderProduct) => {
          try {
            const product = await getProductByIdFromStock(orderProduct.productId, token);
            if (product) {
              productsMap.set(orderProduct.productId, product);
            }
          } catch (err) {
            console.error(`Error al obtener producto ${orderProduct.productId}:`, err);
          }
        });
        await Promise.all(productPromises);
        setProducts(productsMap);
        
        // Limpiar el carrito después de cargar la orden
        clearCart();
      } catch (err: any) {
        console.error('Error al cargar la orden:', err);
        setError(err.message || 'Error al cargar los datos de la orden');
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [searchParams, auth.user, clearCart]);

  if (loading) {
    return (
      <>
        <CheckoutSteps />
        <div className={`container mx-auto p-8 max-w-4xl min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando datos de la orden...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !order) {
    return (
      <>
        <CheckoutSteps />
        <div className={`container mx-auto p-8 max-w-4xl min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
          <div className="text-center">
            <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Error</h1>
            <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {error || 'No se pudo cargar la orden'}
            </p>
            <Link
              to="/"
              className="inline-block bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </>
    );
  }

  const subtotal = order.products.reduce((sum, product) => sum + (product.price * product.quantity), 0);
  const shippingCost = order.shippingCost || 0;
  const total = order.totalAmount;

  return (
    <>
      <CheckoutSteps />
      <motion.main
        className={`container mx-auto p-8 max-w-4xl min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="w-20 h-20 mx-auto mb-4 bg-green-500 rounded-full flex items-center justify-center"
          >
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={3}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </motion.div>
          <h1 className="text-4xl font-bold mb-4 text-gray-800 dark:text-white">
            ¡Pedido Confirmado!
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Gracias por tu compra. Te enviaremos un correo con los detalles de tu pedido.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {/* Resumen del Pedido */}
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Resumen del Pedido
              </h2>
              <div className="mb-4">
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Orden #<span className="font-mono font-semibold">{order.orderId}</span>
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fecha: {new Date(order.createdAt).toLocaleDateString('es-AR', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Estado: <span className="font-semibold capitalize">{order.status}</span>
                </p>
              </div>
              <div className="space-y-4">
                {order.products.map((orderProduct) => {
                  const product = products.get(orderProduct.productId);
                  const productName = product?.nombre || `Producto #${orderProduct.productId}`;
                  const mainImage = product?.imagenes && product.imagenes.length > 0
                    ? product.imagenes[0].url
                    : `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80`;
                  
                  return (
                    <div
                      key={orderProduct.productId}
                      className="flex gap-4 items-center pb-4 border-b border-gray-300 dark:border-gray-700 last:border-0"
                    >
                      <img
                        src={mainImage}
                        alt={productName}
                        className="w-20 h-20 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-gray-800 dark:text-white">
                          {productName}
                        </h3>
                        <p className="text-gray-600 dark:text-gray-400">
                          Cantidad: {orderProduct.quantity}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">
                          Precio unitario: ${orderProduct.price.toLocaleString('es-AR')}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-lg text-gray-800 dark:text-white">
                          ${(orderProduct.price * orderProduct.quantity).toLocaleString('es-AR')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Información de Envío */}
            <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Información de Envío
              </h2>
              <div className={`space-y-3 ${
                isDark ? 'text-gray-300' : 'text-gray-700'
              }`}>
                {order.shippingId && (
                  <div>
                    <p className="font-semibold mb-1">ID de Envío:</p>
                    <p className="font-mono text-sm">{order.shippingId}</p>
                  </div>
                )}
                {order.transportType && (
                  <div>
                    <p className="font-semibold mb-1">Tipo de Transporte:</p>
                    <p className="capitalize">{order.transportType === 'air' ? 'Aéreo' : order.transportType === 'sea' ? 'Marítimo' : order.transportType === 'road' ? 'Terrestre' : 'Ferroviario'}</p>
                  </div>
                )}
                <div>
                  <p className="font-semibold mb-1">Dirección de Entrega:</p>
                  <p className="text-sm">
                    {order.deliveryAddress.street}<br />
                    {order.deliveryAddress.city}, {order.deliveryAddress.state}<br />
                    {order.deliveryAddress.postal_code}, {order.deliveryAddress.country}
                  </p>
                </div>
                <p className="text-sm mt-4">Recibirás un correo con el número de seguimiento una vez que el pedido sea despachado.</p>
              </div>
            </div>
          </div>

          {/* Resumen de Precios */}
          <div className="lg:col-span-1">
            <div className={`rounded-lg shadow-lg p-6 sticky top-8 ${isDark ? 'bg-white/5' : 'bg-white'}`}>
              <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                Total del Pedido
              </h2>
              <div className="space-y-2 mb-4 pb-4 border-b border-gray-300 dark:border-gray-700">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Subtotal:</span>
                  <span className="font-semibold">${subtotal.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Envío:</span>
                  <span className="font-semibold">${shippingCost.toLocaleString('es-AR')}</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span className="text-gray-800 dark:text-white">Total:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <Link
                to="/"
                className="block w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 text-center"
              >
                Volver al Inicio
              </Link>
            </div>
          </div>
        </div>
      </motion.main>
    </>
  );
}

export default withAuthenticationRequired(ConfirmationRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

