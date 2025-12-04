// src/routes/shipping-tracking.route.tsx
import { withAuthenticationRequired } from "react-oidc-context";
import { useNavigate, useSearchParams, Link } from "react-router";
import { motion } from "framer-motion";
import { useState, useEffect, useCallback } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { getShippingById, translateShippingStatus, getShippingStatusColor, type ShippingDetailResponse } from "../services/shipping.service";
import { getAccessToken } from "../services/auth/getAccessToken";
import { useAuth } from "react-oidc-context";
import { getProductByIdFromStock, type Product } from "../services/product.service";

function ShippingTrackingRoute() {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const auth = useAuth();
  const [searchParams] = useSearchParams();
  const [shipping, setShipping] = useState<ShippingDetailResponse | null>(null);
  const [products, setProducts] = useState<Map<number, Product>>(new Map());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Función para cargar el envío (memoizada para evitar recreaciones innecesarias)
  const loadShipping = useCallback(async (shippingId: number) => {
    if (!auth.isAuthenticated || !auth.user) {
      setError('Usuario no autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getAccessToken(auth.user);
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const shippingData = await getShippingById(shippingId, token);
      setShipping(shippingData);
      
      // Obtener los detalles de cada producto desde el backend de stock
      const productsMap = new Map<number, Product>();
      const productPromises = shippingData.products.map(async (shippingProduct) => {
        try {
          const product = await getProductByIdFromStock(shippingProduct.id, token);
          if (product) {
            productsMap.set(shippingProduct.id, product);
          }
        } catch (err) {
          console.error(`Error al obtener producto ${shippingProduct.id}:`, err);
        }
      });
      await Promise.all(productPromises);
      setProducts(productsMap);
      setError(null);
    } catch (err: any) {
      console.error('Error al cargar el envío:', err);
      setError(err.message || 'Error al cargar los datos del envío');
    } finally {
      setLoading(false);
    }
  }, [auth.isAuthenticated, auth.user]);

  useEffect(() => {
    const shippingIdParam = searchParams.get('id');
    
    if (!shippingIdParam) {
      setError('No se encontró el ID del envío');
      setLoading(false);
      return;
    }

    const shippingId = parseInt(shippingIdParam, 10);
    if (isNaN(shippingId)) {
      setError('ID de envío inválido');
      setLoading(false);
      return;
    }

    loadShipping(shippingId);
  }, [searchParams, auth.isAuthenticated]);

  // Escuchar cambios en el estado del envío (cuando se cancela desde el modal)
  useEffect(() => {
    const handleShippingStatusChange = (event: CustomEvent) => {
      const { shippingId: changedShippingId, shipping: updatedShipping } = event.detail;
      const currentShippingId = parseInt(searchParams.get('id') || '0', 10);
      
      // Si el envío que cambió es el mismo que estamos viendo, refrescar
      if (changedShippingId === currentShippingId && !isNaN(currentShippingId)) {
        console.log('[ShippingTracking] Envío cancelado, refrescando datos...');
        // Actualizar el estado directamente con los datos recibidos
        if (updatedShipping) {
          setShipping(updatedShipping);
        } else {
          // Si no se recibieron los datos completos, recargar desde el servidor
          loadShipping(currentShippingId);
        }
      }
    };

    window.addEventListener('shippingStatusChanged', handleShippingStatusChange as EventListener);
    
    return () => {
      window.removeEventListener('shippingStatusChanged', handleShippingStatusChange as EventListener);
    };
  }, [searchParams, loadShipping]);

  if (loading) {
    return (
      <div className={`container mx-auto p-8 max-w-4xl min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>Cargando información del envío...</p>
        </div>
      </div>
    );
  }

  if (error || !shipping) {
    return (
      <div className={`container mx-auto p-8 max-w-4xl min-h-screen flex items-center justify-center ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}>
        <div className="text-center">
          <h1 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>Error</h1>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {error || 'No se pudo cargar el envío'}
          </p>
          <Link
            to="/"
            className={`inline-block py-3 px-6 rounded-lg font-semibold transition-all duration-300 ${
              isDark 
                ? 'bg-gray-700 text-white hover:bg-gray-600' 
                : 'bg-gray-200 text-gray-800 hover:bg-gray-300'
            }`}
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const statusColor = getShippingStatusColor(shipping.status);
  const estimatedDelivery = new Date(shipping.estimated_delivery_at);

  return (
    <motion.main
      className={`container mx-auto p-8 max-w-4xl min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gray-50'}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="mb-6">
        <Link
          to="/"
          className={`inline-flex items-center text-sm mb-4 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}
        >
          ← Volver
        </Link>
        <h1 className={`text-3xl font-bold mb-2 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
          Seguimiento de Envío
        </h1>
        <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          Envío #{shipping.shipping_id}
        </p>
      </div>

      <div className="space-y-6">
        {/* Productos - Primera fila, ancho completo */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            Productos en el Envío
          </h2>
          <div className="space-y-4">
            {shipping.products.map((shippingProduct) => {
              const product = products.get(shippingProduct.id);
              const productName = product?.nombre || `Producto #${shippingProduct.id}`;
              const mainImage = product?.imagenes && product.imagenes.length > 0
                ? product.imagenes[0].url
                : `https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80`;
              
              return (
                <div
                  key={shippingProduct.id}
                  className={`flex gap-6 p-4 rounded-lg border ${isDark ? 'bg-gray-700/50 border-gray-600' : 'bg-gray-50 border-gray-200'}`}
                >
                  <img
                    src={mainImage}
                    alt={productName}
                    className="w-24 h-24 object-cover rounded border border-gray-300 flex-shrink-0"
                  />
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Producto
                      </p>
                      <h3 className={`font-semibold mb-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                        {productName}
                      </h3>
                      {product?.descripcion && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} line-clamp-2`}>
                          {product.descripcion}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Cantidad y Precio
                      </p>
                      <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                        Cantidad: {shippingProduct.quantity}
                      </p>
                      {product?.precio && (
                        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          ${product.precio.toLocaleString('es-AR')} c/u
                        </p>
                      )}
                      {product?.precio && (
                        <p className={`text-sm font-semibold mt-1 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                          Total: ${(product.precio * shippingProduct.quantity).toLocaleString('es-AR')}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Categoría y Marca
                      </p>
                      {product?.categorias && product.categorias.length > 0 ? (
                        <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} font-medium`}>
                          {product.categorias[0].nombre}
                        </p>
                      ) : (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          Sin categoría
                        </p>
                      )}
                      {product?.marca && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Marca: {product.marca}
                        </p>
                      )}
                      {product?.color && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                          Color: {product.color}
                        </p>
                      )}
                    </div>
                    <div>
                      <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                        Dimensiones y Peso
                      </p>
                      {product?.dimensiones ? (
                        <>
                          <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                            {product.dimensiones.largoCm} × {product.dimensiones.anchoCm} × {product.dimensiones.altoCm} cm
                          </p>
                          {product.pesoKg && (
                            <p className={`text-sm mt-1 ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                              Peso: {product.pesoKg} kg
                            </p>
                          )}
                        </>
                      ) : (
                        <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                          No disponible
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado actual e Información del Envío - Segunda fila horizontal */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Estado actual */}
          <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Estado Actual
            </h2>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span
                className="px-4 py-2 rounded-lg font-semibold"
                style={{ 
                  backgroundColor: statusColor + '20',
                  color: statusColor,
                  border: `2px solid ${statusColor}`
                }}
              >
                {translateShippingStatus(shipping.status)}
              </span>
              {shipping.tracking_number && (
                <div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Número de tracking:
                  </p>
                  <p className={`font-mono font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    {shipping.tracking_number}
                  </p>
                </div>
              )}
            </div>
            {shipping.carrier_name && (
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Transportista: <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>{shipping.carrier_name}</span>
              </p>
            )}
            <p className={`text-sm mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Entrega estimada: <span className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                {estimatedDelivery.toLocaleDateString('es-AR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </span>
            </p>
          </div>

          {/* Información del Envío */}
          <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Información del Envío
            </h2>
            
            <div className="grid grid-cols-2 gap-3">
              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Orden ID
                </p>
                <p className={`font-mono text-sm ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                  #{shipping.order_id}
                </p>
              </div>

              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Tipo de Transporte
                </p>
                <p className={`${isDark ? 'text-gray-100' : 'text-gray-800'} capitalize font-medium`}>
                  {shipping.transport_type.type === 'air' ? 'Aéreo' : 
                   shipping.transport_type.type === 'sea' ? 'Marítimo' : 
                   shipping.transport_type.type === 'road' ? 'Terrestre' : 'Ferroviario'}
                </p>
              </div>

              {shipping.total_cost && (
                <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Costo Total
                  </p>
                  <p className={`text-lg font-bold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                    {shipping.currency || 'ARS'} ${shipping.total_cost.toLocaleString('es-AR')}
                  </p>
                </div>
              )}

              <div className={`p-3 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold mb-1 uppercase tracking-wide ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  Fecha de Creación
                </p>
                <p className={`text-sm ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {new Date(shipping.created_at).toLocaleDateString('es-AR', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Historial de estados - Tercera fila horizontal */}
        {shipping.logs && shipping.logs.length > 0 && (
          <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
            <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
              Historial de Estados
            </h2>
            <div className="space-y-4">
              {shipping.logs.map((log, index) => (
                <div
                  key={index}
                  className={`flex gap-4 pb-4 border-b ${isDark ? 'border-gray-700' : 'border-gray-300'} last:border-0`}
                >
                  <div className="flex-shrink-0 pt-1">
                    <div
                      className="w-3 h-3 rounded-full border-2"
                      style={{ 
                        backgroundColor: getShippingStatusColor(log.status) + '40',
                        borderColor: getShippingStatusColor(log.status)
                      }}
                    />
                  </div>
                  <div className="flex-1">
                    <p className={`font-semibold ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
                      {translateShippingStatus(log.status)}
                    </p>
                    <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                      {log.message}
                    </p>
                    <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                      {new Date(log.timestamp).toLocaleString('es-AR', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Direcciones - Tercera fila horizontal */}
        <div className={`rounded-lg shadow-lg p-6 ${isDark ? 'bg-gray-800 border border-gray-700' : 'bg-white'}`}>
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-gray-100' : 'text-gray-800'}`}>
            Direcciones
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
              <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Dirección de Entrega
              </p>
              <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                {shipping.delivery_Address.street}<br />
                {shipping.delivery_Address.city}, {shipping.delivery_Address.state}<br />
                {shipping.delivery_Address.postal_code}, {shipping.delivery_Address.country}
              </p>
            </div>

            {shipping.departure_Address && (
              <div className={`p-4 rounded-lg ${isDark ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                <p className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  Dirección de Origen
                </p>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-200' : 'text-gray-700'}`}>
                  {shipping.departure_Address.street}<br />
                  {shipping.departure_Address.city}, {shipping.departure_Address.state}<br />
                  {shipping.departure_Address.postal_code}, {shipping.departure_Address.country}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.main>
  );
}

export default withAuthenticationRequired(ShippingTrackingRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

