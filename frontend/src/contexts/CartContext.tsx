import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  color: string;
  size: string;
  material: string;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
  isAnimating: boolean;
  triggerCartAnimation: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTimeout, setAnimationTimeout] = useState<NodeJS.Timeout | null>(null);

  const addToCart = (newItem: Omit<CartItem, 'quantity'>, quantity: number = 1) => {
    setItems(prevItems => {
      const existingItem = prevItems.find(item => 
        item.id === newItem.id && 
        item.color === newItem.color && 
        item.size === newItem.size && 
        item.material === newItem.material
      );

      if (existingItem) {
        return prevItems.map(item =>
          item.id === existingItem.id &&
          item.color === existingItem.color &&
          item.size === existingItem.size &&
          item.material === existingItem.material
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        return [...prevItems, { ...newItem, quantity }];
      }
    });
    
    // Trigger cart animation
    triggerCartAnimation();
  };

  const removeFromCart = (id: number) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  const updateQuantity = (id: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(id);
      return;
    }
    
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setItems([]);
  };

  const triggerCartAnimation = () => {
    // Si ya está animando, no hacer nada (protección contra spam)
    if (isAnimating) {
      return;
    }

    // Limpiar timeout anterior si existe
    if (animationTimeout) {
      clearTimeout(animationTimeout);
    }

    // Reset first to ensure animation triggers
    setIsAnimating(false);
    
    // Small delay to ensure reset, then trigger animation
    const timeout = setTimeout(() => {
      setIsAnimating(true);
      // Reset animation after it completes
      const resetTimeout = setTimeout(() => setIsAnimating(false), 3000);
      setAnimationTimeout(resetTimeout);
    }, 10);
    
    setAnimationTimeout(timeout);
  };

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (animationTimeout) {
        clearTimeout(animationTimeout);
      }
    };
  }, [animationTimeout]);

  const value: CartContextType = {
    items,
    addToCart,
    removeFromCart,
    updateQuantity,
    getTotalItems,
    getTotalPrice,
    clearCart,
    isAnimating,
    triggerCartAnimation,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
