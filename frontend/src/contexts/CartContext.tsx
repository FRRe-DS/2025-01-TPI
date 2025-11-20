import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { type Product } from '../services/product.service';

export interface CartItem {
  id: string; // ID único del item (productId + variantes)
  productId: number;
  product: Product;
  quantity: number;
  selectedColor?: string;
  selectedSize?: string;
  selectedMaterial?: string;
  price: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string, selectedMaterial?: string) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isAnimating: boolean;
  triggerCartAnimation: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(() => {
    // Verificar si estamos en el navegador (localStorage disponible)
    if (typeof window === 'undefined') {
      return [];
    }

    // Cargar del localStorage si existe
    try {
      const saved = localStorage.getItem('cart');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading cart from localStorage:', error);
    }
    return [];
  });

  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTimeout, setAnimationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Guardar en localStorage cada vez que cambie
  useEffect(() => {
    // Verificar si estamos en el navegador
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('cart', JSON.stringify(items));
      } catch (error) {
        console.error('Error saving cart to localStorage:', error);
      }
    }
  }, [items]);

  const generateItemId = (
    productId: number,
    color?: string,
    size?: string,
    material?: string
  ): string => {
    return `${productId}-${color || ''}-${size || ''}-${material || ''}`;
  };

  const addItem = (
    product: Product,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string,
    selectedMaterial?: string
  ) => {
    const itemId = generateItemId(product.id, selectedColor, selectedSize, selectedMaterial);
    const price = product.precio; // Usar precio base por ahora

    setItems(prevItems => {
      const existingItem = prevItems.find(item => item.id === itemId);

      if (existingItem) {
        // Si ya existe, incrementar cantidad
        return prevItems.map(item =>
          item.id === itemId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        // Si no existe, agregar nuevo item
        return [...prevItems, {
          id: itemId,
          productId: product.id,
          product,
          quantity,
          selectedColor,
          selectedSize,
          selectedMaterial,
          price
        }];
      }
    });

    // Trigger cart animation
    triggerCartAnimation();
  };

  const removeItem = (itemId: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }

    setItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };
  const getTotalItems = () => {
    return items.reduce((total, item) => total + item.quantity, 0);
  };

  const getTotalPrice = () => {
    return items.reduce((total, item) => total + (item.price * item.quantity), 0);
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

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        getTotalItems,
        getTotalPrice,
        isAnimating,
        triggerCartAnimation
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
