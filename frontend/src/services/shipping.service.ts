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
    const requestBody = JSON.stringify(request);
    console.log('[ShippingService] Creando envío:', {
      url: SHIPPING_API_URL,
      method: 'POST',
      body: requestBody,
      requestObject: request
    });
    
    const response = await fetch(`${SHIPPING_API_URL}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: requestBody,
    });

    console.log('[ShippingService] Respuesta del servidor:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[ShippingService] Error response body:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { message: errorText || response.statusText };
      }
      throw new Error(errorData.message || `Error al crear envío: ${response.status}`);
    }

    const responseData = await response.json();
    console.log('[ShippingService] Respuesta exitosa:', responseData);
    return responseData;
  } catch (error: any) {
    console.error('[ShippingService] Error al crear envío:', error);
    throw new Error(`Error al crear envío: ${error.message}`);
  }
}

export interface ShippingLog {
  timestamp: string;
  status: string;
  message: string;
}

export interface ShippingDetailResponse {
  shipping_id: number;
  order_id: number;
  user_id: number;
  delivery_Address: DeliveryAddress;
  departure_Address?: DeliveryAddress;
  products: ShippingProduct[];
  status: string;
  transport_type: {
    type: 'air' | 'sea' | 'road' | 'rail';
  };
  tracking_number?: string;
  carrier_name?: string;
  total_cost?: number;
  currency?: string;
  estimated_delivery_at: string;
  created_at: string;
  updated_at: string;
  logs?: ShippingLog[];
}

/**
 * Obtiene los detalles completos de un envío por ID
 * Requiere scope: envios:read
 */
export async function getShippingById(
  shippingId: number,
  token: string
): Promise<ShippingDetailResponse> {
  try {
    const response = await fetch(`${SHIPPING_API_URL}/${shippingId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 404) {
        throw new Error('Envío no encontrado');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error al obtener el envío: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[getShippingById] Error:', error);
    throw error;
  }
}

export interface CancelShippingResponse {
  shipping_id: number;
  status: string;
  cancelled_at: string;
}

/**
 * Cancela un envío
 * Requiere scope: envios:write
 * Solo se pueden cancelar envíos en estado 'created' o 'reserved'
 */
export async function cancelShipping(
  shippingId: number,
  token: string
): Promise<CancelShippingResponse> {
  try {
    const response = await fetch(`${SHIPPING_API_URL}/${shippingId}/cancel`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      if (response.status === 404) {
        throw new Error('Envío no encontrado');
      }
      if (response.status === 422) {
        const errorData = await response.json().catch(() => ({ message: 'No se puede cancelar este envío' }));
        throw new Error(errorData.message || 'No se puede cancelar este envío en su estado actual');
      }
      const errorData = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(errorData.message || `Error al cancelar el envío: ${response.status}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error('[cancelShipping] Error:', error);
    throw error;
  }
}

/**
 * Traduce el estado del envío al español
 */
export function translateShippingStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'created': 'Creado',
    'reserved': 'Reservado',
    'in_transit': 'En tránsito',
    'arrived': 'Llegado',
    'in_distribution': 'En distribución',
    'delivered': 'Entregado',
    'cancelled': 'Cancelado'
  };
  return statusMap[status] || status;
}

/**
 * Obtiene el color del badge según el estado del envío
 */
export function getShippingStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'created': '#6b7280',      // gray
    'reserved': '#3b82f6',     // blue
    'in_transit': '#f59e0b',   // amber
    'arrived': '#8b5cf6',      // purple
    'in_distribution': '#10b981', // green
    'delivered': '#059669',    // emerald
    'cancelled': '#dc2626'     // red
  };
  return colorMap[status] || '#6b7280';
}

