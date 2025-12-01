/**
 * Servicio para gestionar órdenes
 * Consume el endpoint del backend de compras
 */

const ORDERS_API_URL = import.meta.env.VITE_API_GATEWAY_URL
  ? `${import.meta.env.VITE_API_GATEWAY_URL}/compras/api/orders`
  : 'http://localhost:8000/compras/api/orders';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface OrderProduct {
  id: number;
  quantity: number;
  price: number;
}

export interface CreateOrderRequest {
  shippingId?: number;
  transportType?: 'air' | 'sea' | 'road' | 'rail';
  shippingCost?: number;
  deliveryAddress: DeliveryAddress;
  products: OrderProduct[];
}

export interface OrderProductResponse {
  productId: number;
  quantity: number;
  price: number;
}

export interface OrderResponse {
  id: number;
  orderId: string; // BigInt se serializa como string en JSON
  shippingId?: number;
  status: string;
  transportType?: string;
  shippingCost?: number;
  deliveryAddress: DeliveryAddress;
  products: OrderProductResponse[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersListResponse {
  orders: OrderResponse[];
  total: number;
}

/**
 * Crea una nueva orden
 */
export async function createOrder(
  token: string,
  orderData: CreateOrderRequest
): Promise<OrderResponse> {
  try {
    const response = await fetch(ORDERS_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 400) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear la orden');
      }
      throw new Error(`Error al crear la orden: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[createOrder] Error:', error);
    throw error;
  }
}

/**
 * Obtiene una orden por ID
 */
export async function getOrderById(
  token: string,
  orderId: string
): Promise<OrderResponse> {
  try {
    const response = await fetch(`${ORDERS_API_URL}/${orderId}`, {
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
      if (response.status === 404) {
        throw new Error('Orden no encontrada');
      }
      throw new Error(`Error al obtener la orden: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[getOrderById] Error:', error);
    throw error;
  }
}

/**
 * Obtiene todas las órdenes del usuario
 */
export async function getUserOrders(
  token: string
): Promise<OrdersListResponse> {
  try {
    const response = await fetch(ORDERS_API_URL, {
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
      throw new Error(`Error al obtener las órdenes: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[getUserOrders] Error:', error);
    throw error;
  }
}

