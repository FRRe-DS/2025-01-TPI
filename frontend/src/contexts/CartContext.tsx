import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { useAuth } from 'react-oidc-context';
import { type Product, getProductByIdFromStock } from '../services/product.service';
import { getCart, addToCart, updateCartItemQuantity, removeFromCart, clearCart as clearCartService, type CartItemDto } from '../services/cart.service';
import { getAccessToken } from '../services/auth/getAccessToken';

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
  isLoading: boolean;
  addItem: (product: Product, quantity: number, selectedColor?: string, selectedSize?: string, selectedMaterial?: string) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  isAnimating: boolean;
  triggerCartAnimation: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationTimeout, setAnimationTimeout] = useState<NodeJS.Timeout | null>(null);

  // Cargar el carrito del backend cuando el usuario esté autenticado
  useEffect(() => {
    const loadCart = async () => {
      if (!auth.isAuthenticated || !auth.user) {
        setIsLoading(false);
        setItems([]);
        return;
      }

      try {
        const token = getAccessToken(auth.user);
        if (!token) {
          console.warn('[CartContext] No token available');
          setIsLoading(false);
          setItems([]);
          return;
        }

        console.log('[CartContext] Loading cart from backend...');
        const cartResponse = await getCart(token);
        console.log('[CartContext] Cart loaded:', cartResponse);

        // Obtener los productos completos para cada item del carrito
        const itemsWithProducts: CartItem[] = await Promise.all(
          cartResponse.items.map(async (item: CartItemDto) => {
            try {
              const product = await getProductByIdFromStock(item.productId, token);
              if (!product) {
                console.warn(`[CartContext] Product ${item.productId} not found`);
                return null;
              }
              return {
                id: `product-${item.productId}`,
                productId: item.productId,
                product,
                quantity: item.quantity,
                price: product.precio,
              };
            } catch (error) {
              console.error(`[CartContext] Error loading product ${item.productId}:`, error);
              return null;
            }
          })
        );

        // Filtrar items nulos
        const validItems = itemsWithProducts.filter((item): item is CartItem => item !== null);
        setItems(validItems);
        console.log('[CartContext] Cart items loaded:', validItems);
      } catch (error) {
        console.error('[CartContext] Error loading cart:', error);
        setItems([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [auth.isAuthenticated, auth.user]);

  const generateItemId = (
    productId: number,
    color?: string,
    size?: string,
    material?: string
  ): string => {
    return `${productId}-${color || ''}-${size || ''}-${material || ''}`;
  };

  const addItem = async (
    product: Product,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string,
    selectedMaterial?: string
  ) => {
    if (!auth.isAuthenticated || !auth.user) {
      console.warn('[CartContext] User not authenticated, cannot add to cart');
      return;
    }

    const token = getAccessToken(auth.user);
    if (!token) {
      console.warn('[CartContext] No token available');
      return;
    }

    try {
      console.log(`[CartContext] Adding product ${product.id} to cart with quantity ${quantity}`);
      
      // Agregar al carrito usando el servicio del backend
      const cartResponse = await addToCart(token, product.id, quantity);
      console.log('[CartContext] Cart updated:', cartResponse);

      // Actualizar el estado local con el producto completo
      setItems(prevItems => {
        const existingItem = prevItems.find(item => item.productId === product.id);

        if (existingItem) {
          // Si ya existe, actualizar cantidad
          return prevItems.map(item =>
            item.productId === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        } else {
          // Si no existe, agregar nuevo item
          return [...prevItems, {
            id: `product-${product.id}`,
            productId: product.id,
            product,
            quantity,
            selectedColor,
            selectedSize,
            selectedMaterial,
            price: product.precio
          }];
        }
      });

      // Trigger cart animation
      triggerCartAnimation();
    } catch (error) {
      console.error('[CartContext] Error adding to cart:', error);
      throw error;
    }
  };

  const removeItem = async (itemId: string) => {
    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!auth.isAuthenticated || !auth.user) {
      console.warn('[CartContext] User not authenticated, cannot remove from cart');
      return;
    }

    const token = getAccessToken(auth.user);
    if (!token) {
      console.warn('[CartContext] No token available');
      return;
    }

    try {
      console.log(`[CartContext] Removing product ${item.productId} from cart`);
      await removeFromCart(token, item.productId);
      
      setItems(prevItems => prevItems.filter(i => i.id !== itemId));
    } catch (error) {
      console.error('[CartContext] Error removing from cart:', error);
      throw error;
    }
  };

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeItem(itemId);
      return;
    }

    const item = items.find(i => i.id === itemId);
    if (!item) return;

    if (!auth.isAuthenticated || !auth.user) {
      console.warn('[CartContext] User not authenticated, cannot update cart');
      return;
    }

    const token = getAccessToken(auth.user);
    if (!token) {
      console.warn('[CartContext] No token available');
      return;
    }

    try {
      console.log(`[CartContext] Updating product ${item.productId} quantity to ${quantity}`);
      await updateCartItemQuantity(token, item.productId, quantity);
      
      setItems(prevItems =>
        prevItems.map(i =>
          i.id === itemId ? { ...i, quantity } : i
        )
      );
    } catch (error) {
      console.error('[CartContext] Error updating cart:', error);
      throw error;
    }
  };

  const clearCart = async () => {
    if (!auth.isAuthenticated || !auth.user) {
      console.warn('[CartContext] User not authenticated, cannot clear cart');
      return;
    }

    const token = getAccessToken(auth.user);
    if (!token) {
      console.warn('[CartContext] No token available');
      return;
    }

    try {
      console.log('[CartContext] Clearing cart');
      await clearCartService(token);
      setItems([]);
    } catch (error) {
      console.error('[CartContext] Error clearing cart:', error);
      throw error;
    }
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
        isLoading,
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
