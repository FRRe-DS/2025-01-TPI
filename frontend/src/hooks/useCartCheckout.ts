import { useCart } from '../contexts/CartContext';
import { useAuth } from 'react-oidc-context';

/**
 * Hook personalizado para el checkout que transforma los datos del carrito
 * al formato requerido por la API
 */

// Estructura de datos requerida para el checkout
export interface CheckoutCartItem {
  idProducto: number;
  nombre: string;
  precioUnitario: number;
  cantidad: number;
  imagenPrincipal: string;
}

export interface CheckoutCart {
  usuarioId: number;
  items: CheckoutCartItem[];
  total: number;
}

/**
 * Convierte el UUID de Keycloak a un número para usar como usuarioId
 * Usa un hash simple del UUID para generar un número consistente
 */
function uuidToNumericId(uuid: string): number {
  // Si el UUID ya contiene números al inicio, intentar extraerlos
  // Si no, usar un hash simple
  let hash = 0;
  for (let i = 0; i < uuid.length; i++) {
    const char = uuid.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  // Asegurar que sea un número positivo y razonable (máximo 2^31-1)
  return Math.abs(hash) % 2147483647;
}

/**
 * Hook para obtener el carrito en formato de checkout
 */
export function useCartCheckout() {
  const { items, getTotalPrice } = useCart();
  const auth = useAuth();

  // Obtener usuarioId del usuario autenticado
  const getUsuarioId = (): number => {
    // Si aún está cargando la autenticación, retornar un valor temporal
    if (auth.isLoading) {
      return 0; // Valor temporal mientras carga
    }
    
    if (!auth.user?.sub) {
      console.warn('Usuario no autenticado, usando ID temporal');
      return 0; // Valor temporal si no hay usuario
    }
    // Convertir UUID a número
    return uuidToNumericId(auth.user.sub);
  };

  // Transformar items del carrito al formato requerido
  const getCheckoutCart = (): CheckoutCart => {
    // Si aún está cargando la autenticación, retornar datos temporales
    if (auth.isLoading) {
      return {
        usuarioId: 0,
        items: [],
        total: 0
      };
    }
    
    const usuarioId = getUsuarioId();
    const total = getTotalPrice();

    const checkoutItems: CheckoutCartItem[] = items.map(item => {
      // Obtener imagen principal
      const imagenPrincipal = item.product.imagenes && item.product.imagenes.length > 0
        ? item.product.imagenes.find(img => img.esPrincipal)?.url || item.product.imagenes[0].url
        : 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';

      return {
        idProducto: item.productId,
        nombre: item.product.nombre,
        precioUnitario: item.price,
        cantidad: item.quantity,
        imagenPrincipal
      };
    });

    return {
      usuarioId,
      items: checkoutItems,
      total
    };
  };

  return {
    getCheckoutCart,
    getUsuarioId,
    cartItems: items,
    subtotal: getTotalPrice(),
    isLoading: auth.isLoading
  };
}

