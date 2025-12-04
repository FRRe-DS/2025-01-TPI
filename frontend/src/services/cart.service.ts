/**
 * Servicio para gestionar el carrito de compras
 * Consume el endpoint del backend de compras
 */

const CART_API_URL = 'http://localhost:8000/compras/api/cart';

export interface CartItemDto {
  productId: number;
  quantity: number;
}

export interface CartResponse {
  items: CartItemDto[];
}

/**
 * Obtiene el carrito del usuario autenticado
 */
export async function getCart(token: string): Promise<CartResponse> {
  try {
    const response = await fetch(CART_API_URL, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      throw new Error(`Error al obtener el carrito: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[getCart] Error:', error);
    throw error;
  }
}

/**
 * Actualiza el carrito del usuario autenticado
 * Si items está vacío, vacía el carrito
 */
export async function updateCart(token: string, items: CartItemDto[]): Promise<CartResponse> {
  try {
    const response = await fetch(CART_API_URL, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items }),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al actualizar el carrito');
      }
      throw new Error(`Error al actualizar el carrito: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[updateCart] Error:', error);
    throw error;
  }
}

/**
 * Agrega un producto al carrito o incrementa su cantidad si ya existe
 */
export async function addToCart(
  token: string,
  productId: number,
  quantity: number = 1
): Promise<CartResponse> {
  try {
    // Obtener el carrito actual
    const currentCart = await getCart(token);
    
    // Buscar si el producto ya existe en el carrito
    const existingItemIndex = currentCart.items.findIndex(
      item => item.productId === productId
    );

    let updatedItems: CartItemDto[];

    if (existingItemIndex >= 0) {
      // Si ya existe, incrementar la cantidad
      updatedItems = currentCart.items.map((item, index) => {
        if (index === existingItemIndex) {
          return {
            ...item,
            quantity: item.quantity + quantity,
          };
        }
        return item;
      });
    } else {
      // Si no existe, agregarlo
      updatedItems = [
        ...currentCart.items,
        { productId, quantity },
      ];
    }

    // Actualizar el carrito
    return await updateCart(token, updatedItems);
  } catch (error: any) {
    console.error('[addToCart] Error:', error);
    throw error;
  }
}

/**
 * Actualiza la cantidad de un producto en el carrito
 */
export async function updateCartItemQuantity(
  token: string,
  productId: number,
  quantity: number
): Promise<CartResponse> {
  try {
    // Obtener el carrito actual
    const currentCart = await getCart(token);
    
    // Actualizar la cantidad del producto
    const updatedItems = currentCart.items.map(item => {
      if (item.productId === productId) {
        return { ...item, quantity };
      }
      return item;
    });

    // Si la cantidad es 0 o menor, eliminar el producto
    const filteredItems = updatedItems.filter(item => item.quantity > 0);

    // Actualizar el carrito
    return await updateCart(token, filteredItems);
  } catch (error: any) {
    console.error('[updateCartItemQuantity] Error:', error);
    throw error;
  }
}

/**
 * Elimina un producto del carrito
 */
export async function removeFromCart(
  token: string,
  productId: number
): Promise<CartResponse> {
  try {
    // Obtener el carrito actual
    const currentCart = await getCart(token);
    
    // Filtrar el producto a eliminar
    const updatedItems = currentCart.items.filter(
      item => item.productId !== productId
    );

    // Actualizar el carrito
    return await updateCart(token, updatedItems);
  } catch (error: any) {
    console.error('[removeFromCart] Error:', error);
    throw error;
  }
}

/**
 * Vacía el carrito completamente
 */
export async function clearCart(token: string): Promise<CartResponse> {
  return await updateCart(token, []);
}

