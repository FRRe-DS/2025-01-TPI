import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CartAnimationProps {
  isAnimating: boolean;
  productImage: string;
  onAnimationComplete: () => void;
}

export default function CartAnimation({ isAnimating, productImage, onAnimationComplete }: CartAnimationProps) {
  const [animationKey, setAnimationKey] = useState(0);

  useEffect(() => {
    if (isAnimating) {
      setAnimationKey(prev => prev + 1);
    }
  }, [isAnimating]);

  // Calcular la posición exacta del carrito en el header
  const getCartPosition = () => {
    // Buscar el elemento del carrito en el DOM para obtener su posición real
    const cartElement = document.querySelector('.user-icon[title="Carrito de compras"]');
    
    if (cartElement) {
      const rect = cartElement.getBoundingClientRect();
      return {
        x: rect.left + rect.width / 2, // Centro horizontal del ícono
        y: rect.top + rect.height / 2  // Centro vertical del ícono
      };
    }
    
    // Fallback si no se encuentra el elemento
    const cartIconX = window.innerWidth - 50;
    const cartIconY = 30;
    return { x: cartIconX, y: cartIconY };
  };

  return (
    <AnimatePresence>
      {isAnimating && (
        <motion.div
          key={animationKey}
          className="fixed z-50 pointer-events-none"
          initial={{ 
            scale: 1,
            opacity: 1,
            x: 0,
            y: 0
          }}
          animate={{ 
            scale: 0.3,
            opacity: 0.8,
            x: getCartPosition().x - window.innerWidth / 2,
            y: getCartPosition().y - window.innerHeight / 2
          }}
          exit={{ 
            scale: 0,
            opacity: 0
          }}
          transition={{
            duration: 0.6,
            ease: [0.25, 0.46, 0.45, 0.94] // Curva de animación más suave
          }}
          onAnimationComplete={onAnimationComplete}
          style={{
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        >
          <motion.img
            src={productImage}
            alt="Producto"
            className="w-16 h-16 object-cover rounded-lg shadow-lg"
            initial={{ rotate: 0 }}
            animate={{ rotate: 180 }}
            transition={{
              duration: 0.6,
              ease: "easeInOut"
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
