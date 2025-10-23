import { withAuthenticationRequired } from "react-oidc-context";
import { useState } from "react";

function CartRoute() {
  // TODO: Integrar con estado global del carrito
  const [cartItems] = useState<any[]>([]);

  return (
    <main className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Carrito de Compras
      </h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-lg p-12 text-center">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Tu carrito está vacío
          </h2>
          <p className="text-gray-600 mb-6">
            ¡Agrega productos para comenzar tu compra!
          </p>
          <button
            onClick={() => window.location.href = '/'}
            className="bg-blue-900 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
          >
            Ver Productos
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow p-6 flex gap-4 items-center"
              >
                <img
                  src={item.image}
                  alt={item.name}
                  className="w-24 h-24 object-cover rounded"
                />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{item.name}</h3>
                  <p className="text-gray-600">${item.price}</p>
                </div>
                <div className="flex items-center gap-4">
                  <button className="px-3 py-1 bg-gray-200 rounded">-</button>
                  <span className="font-semibold">{item.quantity}</span>
                  <button className="px-3 py-1 bg-gray-200 rounded">+</button>
                </div>
                <button className="text-red-500 hover:text-red-700">
                  Eliminar
                </button>
              </div>
            ))}
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-lg p-6 sticky top-8">
              <h2 className="text-xl font-bold mb-4">Resumen del Pedido</h2>
              <div className="space-y-2 mb-4 pb-4 border-b">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-semibold">$0.00</span>
                </div>
              </div>
              <div className="flex justify-between text-xl font-bold mb-6">
                <span>Total:</span>
                <span>$0.00</span>
              </div>
              <button className="w-full bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300">
                Proceder al Pago
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="w-full mt-4 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                Seguir Comprando
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

export default withAuthenticationRequired(CartRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

