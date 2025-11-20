import { withAuthenticationRequired } from "react-oidc-context";
import { useNavigate, Link } from "react-router";
import { useCart } from "../contexts/CartContext";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

function CartRoute() {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, getTotalPrice, clearCart } = useCart();
  const total = getTotalPrice();
  const [isClearing, setIsClearing] = useState(false);

  const handleIncreaseQuantity = (itemId: string, currentQuantity: number) => {
    updateQuantity(itemId, currentQuantity + 1);
  };

  const handleDecreaseQuantity = (itemId: string, currentQuantity: number) => {
    if (currentQuantity > 1) {
      updateQuantity(itemId, currentQuantity - 1);
    } else {
      removeItem(itemId);
    }
  };

  const handleCheckout = () => {
    navigate('/shopcart/checkout');
  };

  const handleClearCart = () => {
    setIsClearing(true);
    // Pequeño delay para la animación
    setTimeout(() => {
      clearCart();
      setIsClearing(false);
    }, 300);
  };

  const handleViewProducts = () => {
    navigate('/', { state: { fromCart: true } });
  };

  return (
    <motion.main 
      className="container mx-auto p-8 max-w-6xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Carrito de Compras
      </h1>

      {items.length === 0 ? (
        <motion.div 
          className="bg-white rounded-lg shadow-lg p-12 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            ¡Agrega productos para comenzar tu compra!
          </p>
          <motion.button
            onClick={handleViewProducts}
            className="bg-blue-900 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            Ver Productos
          </motion.button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isClearing ? 0 : 1 }}
            transition={{ duration: 0.3 }}
            className="lg:col-span-2 space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {items.map((item, index) => {
              const mainImage = item.product.imagenes && item.product.imagenes.length > 0
                ? item.product.imagenes[0].url
                : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
              
              return (
                <motion.div
                  key={item.id}
                  className="bg-white rounded-lg shadow p-6 flex gap-4 items-center"
                  initial={{ opacity: 0, x: -20, height: 0 }}
                  animate={{ opacity: 1, x: 0, height: 'auto' }}
                  exit={{ opacity: 0, x: 20, height: 0, marginTop: 0, marginBottom: 0, paddingTop: 0, paddingBottom: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ scale: 1.01, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                >
                  <img
                    src={mainImage}
                    alt={item.product.nombre}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <div className="flex-1">
                    <Link 
                      to={`/product/${item.product.id}`}
                      className="hover:underline"
                    >
                      <h3 className="font-semibold text-lg">{item.product.nombre}</h3>
                    </Link>
                    <p className="text-gray-600">{item.product.marca}</p>
                    <p className="text-gray-800 font-bold mt-1">
                      ${item.price.toLocaleString('es-AR')}
                    </p>
                    {item.selectedColor && (
                      <p className="text-sm text-gray-500 mt-1">
                        Color: {item.selectedColor}
                        {item.selectedSize && ` | Tamaño: ${item.selectedSize}`}
                        {item.selectedMaterial && ` | Material: ${item.selectedMaterial}`}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handleDecreaseQuantity(item.id, item.quantity)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      -
                    </button>
                    <span className="font-semibold min-w-[30px] text-center">{item.quantity}</span>
                    <button
                      onClick={() => handleIncreaseQuantity(item.id, item.quantity)}
                      className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg mb-2">
                      ${(item.price * item.quantity).toLocaleString('es-AR')}
                    </p>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="remove-item-btn-cart"
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        padding: '0.4rem 0.75rem',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '6px',
                        color: '#ef4444',
                        fontSize: '0.875rem',
                        fontWeight: '500',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      Eliminar
                    </button>
                  </div>
                </motion.div>
              );
            })}
            </AnimatePresence>
          </motion.div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">${total.toLocaleString('es-AR')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">Calculado en pedido</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total:</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
              <button
                onClick={handleCheckout}
                className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
              >
                Proceder al Pago
              </button>
              <motion.button
                onClick={handleViewProducts}
                className="w-full mt-4 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                Seguir Comprando
              </motion.button>
              {items.length > 0 && (
                <motion.button
                  onClick={handleClearCart}
                  className="w-full mt-2 bg-white border-2 border-red-500 text-red-500 py-2 px-4 rounded-lg font-medium hover:bg-red-50 hover:border-red-600 transition-all duration-300 flex items-center justify-center gap-2"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 6H5H21M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6V20C19 20.5304 18.7893 21.0391 18.4142 21.4142C18.0391 21.7893 17.5304 22 17 22H7C6.46957 22 5.96086 21.7893 5.58579 21.4142C5.21071 21.0391 5 20.5304 5 20V6H19Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M14 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Vaciar Carrito
                </motion.button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.main>
  );
}

export default withAuthenticationRequired(CartRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

