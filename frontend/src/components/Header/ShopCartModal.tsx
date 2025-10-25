import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "framer-motion";
import { useCart } from "../../contexts/CartContext";

export default function ShopCartModal() {
  const navigate = useNavigate();
  const [showCart, setShowCart] = useState(false);
  const { getTotalItems, items, isAnimating } = useCart();
  const cartItems = getTotalItems();

  const handleViewCart = () => {
    setShowCart(false);
    navigate('/cart');
  };

  return (
    <div className="user-menu" style={{ position: 'relative' }}>
      <motion.div 
        className="user-icon" 
        onClick={() => setShowCart(!showCart)}
        title="Carrito de compras"
        style={{ 
          position: 'relative',
          overflow: 'hidden'
        }}
        animate={{}}
        transition={{
          duration: 0.6,
          ease: "easeInOut"
        }}
      >
        {/* Efecto de llenado con degradado exacto como SHIPPER */}
        {isAnimating && (
          <motion.div
            key={isAnimating ? 'animate' : 'static'}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(90deg, #ffffff, #3b82f6, #ffffff)',
              backgroundSize: '300% 100%',
              borderRadius: '50%',
              opacity: 1,
              zIndex: 1
            }}
            initial={{
              backgroundPosition: '0% 50%',
              scale: 0.8,
              opacity: 0
            }}
            animate={{
              backgroundPosition: ['0% 50%', '100% 50%'],
              scale: [0.8, 1.1],
              opacity: [0, 1]
            }}
            transition={{
              duration: 3.0,
              ease: "easeInOut"
            }}
            onAnimationComplete={() => {
              // La animación se completa automáticamente
            }}
          />
        )}
        
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          style={{ position: 'relative', zIndex: 2 }}
        >
          <path d="M7 18C5.9 18 5.01 18.9 5.01 20C5.01 21.1 5.9 22 7 22C8.1 22 9 21.1 9 20C9 18.9 8.1 18 7 18ZM1 2V4H3L6.6 11.59L5.25 14.04C5.09 14.32 5 14.65 5 15C5 16.1 5.9 17 7 17H19V15H7.42C7.28 15 7.17 14.89 7.17 14.75L7.2 14.63L8.1 13H15.55C16.3 13 16.96 12.59 17.3 11.97L20.88 5.48C20.96 5.34 21 5.17 21 5C21 4.45 20.55 4 20 4H5.21L4.27 2H1ZM17 18C15.9 18 15.01 18.9 15.01 20C15.01 21.1 15.9 22 17 22C18.1 22 19 21.1 19 20C19 18.9 18.1 18 17 18Z" fill="currentColor"/>
        </svg>
      </motion.div>
      
      {/* Contador rojo - FUERA del ícono del carrito */}
      {cartItems > 0 && (
        <span style={{
          position: 'absolute',
          top: '-8px',
          right: '-8px',
          background: '#ff4444',
          color: 'white',
          borderRadius: '50%',
          width: '20px',
          height: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.8rem',
          fontWeight: 'bold',
          zIndex: 10,
          boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
          minWidth: '20px',
          minHeight: '20px'
        }}>
          {cartItems}
        </span>
      )}
      
      {showCart && (
        <>
          <div 
            onClick={() => setShowCart(false)} 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
          />
          <div className="dropdown-menu">
            <div style={{ padding: '1rem', textAlign: 'center', color: '#666', borderBottom: '1px solid #eee' }}>
              {cartItems === 0 ? (
                <p style={{ margin: 0 }}>Tu carrito está vacío</p>
              ) : (
                <div>
                  <p style={{ margin: 0 }}>Tienes {cartItems} producto(s)</p>
                  <button 
                    onClick={handleViewCart}
                    style={{
                      marginTop: '0.5rem',
                      background: '#3B82F6',
                      color: 'white',
                      border: 'none',
                      padding: '0.5rem 1rem',
                      borderRadius: '0.375rem',
                      cursor: 'pointer',
                      fontSize: '0.875rem'
                    }}
                  >
                    Ver carrito
                  </button>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}