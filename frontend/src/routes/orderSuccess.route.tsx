import { Link } from 'react-router';
import { motion } from 'framer-motion';
import { withAuthenticationRequired } from 'react-oidc-context';

/**
 * Página de éxito después de realizar una compra
 */
function OrderSuccessPage() {

  return (
    <motion.main
      className="container mx-auto p-8 max-w-4xl"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="text-8xl mb-6"
        >
          ✅
        </motion.div>

        <h1 className="text-4xl font-bold text-gray-800 mb-4">
          ¡Compra Realizada Exitosamente!
        </h1>

        <p className="text-xl text-gray-600 mb-8">
          Tu pedido ha sido procesado correctamente. Recibirás un correo de confirmación próximamente.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/"
            className="px-6 py-3 bg-blue-900 text-white rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300 hover:scale-105"
          >
            Volver al Inicio
          </Link>
          <Link
            to="/shopcart"
            className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg font-semibold hover:bg-gray-300 transition-all duration-300 hover:scale-105"
          >
            Ver Carrito
          </Link>
        </div>
      </div>
    </motion.main>
  );
}

export default withAuthenticationRequired(OrderSuccessPage, {
  OnRedirecting: () => (
    <div className="container mx-auto p-8 max-w-4xl text-center">
      <p className="text-gray-600">Redirigiendo al login...</p>
    </div>
  )
});

