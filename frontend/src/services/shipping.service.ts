/**
 * Servicio para interactuar con el backend de logística
 */

const SHIPPING_API_URL = import.meta.env.VITE_API_GATEWAY_URL 
  ? `${import.meta.env.VITE_API_GATEWAY_URL}/shipping`
  : 'http://localhost:8000/shipping';

export interface DeliveryAddress {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ShippingProduct {
  id: number;
  quantity: number;
}

export interface ShippingCostRequest {
  delivery_address: DeliveryAddress;
  products: ShippingProduct[];
  // Nota: transport_type NO se envía en el request, el backend elige automáticamente
}

export interface ShippingCostResponse {
  currency: string;
  total_cost: number;
  transport_type: string;
  products: Array<{
    id: number;
    cost: number;
  }>;
}

export interface TransportMethod {
  type: 'air' | 'sea' | 'road' | 'rail';
  name: string;
  estimatedDays: string;
}

export interface TransportMethodsResponse {
  transportMethods: TransportMethod[];
}

/**
 * Obtiene los métodos de transporte disponibles
 * No requiere autenticación
 */
export async function getTransportMethods(): Promise<TransportMethodsResponse> {
  try {
    const response = await fetch(`${SHIPPING_API_URL}/transport-methods`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error al obtener métodos de transporte: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error al obtener métodos de transporte: ${error.message}`);
  }
}

/**
 * Calcula el costo de envío sin crear el envío
 * Requiere scope: envios:write
 */
export async function calculateShippingCost(
  request: ShippingCostRequest,
  token: string
): Promise<ShippingCostResponse> {
  try {
    const response = await fetch(`${SHIPPING_API_URL}/cost`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error al calcular costo de envío: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error al calcular costo de envío: ${error.message}`);
  }
}

export interface CreateShippingRequest {
  user_id: number;
  order_id: number;
  delivery_address: DeliveryAddress;
  transport_type: 'air' | 'sea' | 'road' | 'rail';
  products: ShippingProduct[];
}

export interface CreateShippingResponse {
  shipping_id: number;
  status: string;
  transport_type: string;
  estimated_delivery_at: string;
}

/**
 * Crea un nuevo envío
 * Requiere scope: envios:write
 */
export async function createShipping(
  request: CreateShippingRequest,
  token: string
): Promise<CreateShippingResponse> {
  try {
    const response = await fetch(`${SHIPPING_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error al crear envío: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    throw new Error(`Error al crear envío: ${error.message}`);
  }
}

