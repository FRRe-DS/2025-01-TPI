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
  productos?: Array<{
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

/**
 * Crea una nueva reserva de stock
 * No requiere autenticación según la documentación
 */
export async function createReservation(
  reservationData: CreateReservationRequest
): Promise<ReservationResponse> {
  try {
    console.log('[ReservationService] Enviando request a:', `${STOCK_API_URL}/reservas`);
    console.log('[ReservationService] Payload:', JSON.stringify(reservationData, null, 2));
    
    const response = await fetch(`${STOCK_API_URL}/reservas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });

    const responseText = await response.text();
    console.log('[ReservationService] Response status:', response.status);
    console.log('[ReservationService] Response body:', responseText);

    if (!response.ok) {
      let errorData;
      try {
        errorData = JSON.parse(responseText);
      } catch {
        errorData = { message: responseText || response.statusText };
      }
      
      if (response.status === 400) {
        // El backend puede devolver un mensaje específico sobre qué producto no existe
        const errorMessage = errorData.message || errorData.code || 'Error al crear la reserva';
        throw new Error(errorMessage);
      }
      throw new Error(errorData.message || `Error al crear la reserva: ${response.status} ${response.statusText}`);
    }

    const data = JSON.parse(responseText);
    return data;
  } catch (error: any) {
    console.error('[createReservation] Error:', error);
    throw error;
  }
}

