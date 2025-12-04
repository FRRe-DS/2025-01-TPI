/**
 * Servicio para gestionar reservas de stock
 * Consume el endpoint del backend de stock
 */

const STOCK_API_URL = import.meta.env.VITE_API_GATEWAY_URL
  ? `${import.meta.env.VITE_API_GATEWAY_URL}/stock/api`
  : 'http://localhost:8000/stock/api';

export interface ReservationProduct {
  idProducto: number;
  cantidad: number;
}

export interface CreateReservationRequest {
  idCompra: string;
  usuarioId: number;
  productos: ReservationProduct[];
}

export interface ReservationResponse {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: string;
  expiresAt: string;
  fechaCreacion: string;
  fechaActualizacion?: string;
  productos?: Array<{
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface ReservationError {
  code: string;
  message: string;
  details?: string;
}

/**
 * Crea una nueva reserva de stock
 * Requiere autenticación con Bearer Token y scope: reservas:write
 * 
 * @param request - Datos de la reserva (idCompra, usuarioId, productos)
 * @param token - JWT token con scope reservas:write
 * @returns Respuesta con idReserva, estado, expiresAt, etc.
 * @throws Error si hay stock insuficiente, producto no encontrado, o problemas de autenticación
 */
export async function createReservation(
  request: CreateReservationRequest,
  token: string
): Promise<ReservationResponse> {
  try {
    const response = await fetch(`${STOCK_API_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorData: ReservationError = await response.json().catch(() => ({
        code: 'UNKNOWN_ERROR',
        message: response.statusText,
      }));
      
      // Manejo específico de errores según la documentación
      if (response.status === 401) {
        throw new Error('No autorizado. Por favor, inicia sesión nuevamente.');
      }
      
      if (response.status === 403) {
        throw new Error('No tienes permisos para crear reservas. Se requiere el scope: reservas:write');
      }
      
      if (errorData.code === 'INSUFFICIENT_STOCK') {
        throw new Error(errorData.message || 'Stock insuficiente para uno o más productos');
      }
      
      if (errorData.code === 'PRODUCT_NOT_FOUND') {
        throw new Error(errorData.message || 'Uno o más productos no existen');
      }
      
      throw new Error(errorData.message || `Error al crear la reserva: ${response.status}`);
    }

    // El endpoint retorna 201 Created según la documentación
    if (response.status !== 201) {
      console.warn(`[createReservation] Respuesta inesperada: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[createReservation] Error:', error);
    throw error;
  }
}
