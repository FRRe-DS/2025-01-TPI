import type { CheckoutCartItem } from '../../hooks/useCartCheckout';

/**
 * Componente Summary que muestra el resumen del pedido
 * Incluye subtotal, total y botón BUY
 */

interface SummaryProps {
  items: CheckoutCartItem[];
  subtotal: number;
  total: number;
  onBuy: () => void;
  isLoading?: boolean;
  formRef?: React.RefObject<HTMLFormElement>;
}

export default function Summary({ items, subtotal, total, onBuy, isLoading = false, formRef }: SummaryProps) {
  // Calcular costo de envío (diferencia entre total y subtotal)
  const shippingCost = total - subtotal;

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Resumen del Pedido</h2>

      {/* Lista de productos */}
      <div className="mb-6 space-y-3 max-h-64 overflow-y-auto">
        {items.map((item) => (
          <div key={item.idProducto} className="flex items-center gap-3 pb-3 border-b border-gray-200 last:border-0">
            <img
              src={item.imagenPrincipal}
              alt={item.nombre}
              className="w-16 h-16 object-cover rounded"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-800 truncate">{item.nombre}</p>
              <p className="text-xs text-gray-500">
                Cantidad: {item.cantidad} × ${item.precioUnitario.toLocaleString('es-AR')}
              </p>
            </div>
            <p className="text-sm font-semibold text-gray-800">
              ${(item.precioUnitario * item.cantidad).toLocaleString('es-AR')}
            </p>
          </div>
        ))}
      </div>

      {/* Resumen de precios */}
      <div className="space-y-2 mb-6 pb-6 border-b border-gray-200">
        <div className="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span className="font-semibold">${subtotal.toLocaleString('es-AR')}</span>
        </div>
        <div className="flex justify-between text-gray-600">
          <span>Envío:</span>
          <span className="font-semibold">
            {shippingCost > 0 
              ? `$${shippingCost.toLocaleString('es-AR')}`
              : 'Calculado en checkout'
            }
          </span>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between text-xl font-bold mb-6 pb-6 border-b border-gray-200">
        <span className="text-gray-800">Total:</span>
        <span className="text-blue-900">${total.toLocaleString('es-AR')}</span>
      </div>

      {/* Botón BUY */}
      <button
        type="button"
        onClick={() => {
          if (formRef?.current) {
            formRef.current.requestSubmit();
          } else {
            onBuy();
          }
        }}
        disabled={isLoading || items.length === 0}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
          isLoading || items.length === 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-900 hover:bg-blue-800 hover:scale-105 active:scale-95'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando...
          </span>
        ) : (
          '🛒 COMPRAR'
        )}
      </button>

      {items.length === 0 && (
        <p className="mt-3 text-sm text-center text-gray-500">
          El carrito está vacío
        </p>
      )}
    </div>
  );
}

