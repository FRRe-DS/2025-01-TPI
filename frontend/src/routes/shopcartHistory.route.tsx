import { withAuthenticationRequired } from 'react-oidc-context';

/**
 * Página de Historial de Pedidos
 * 
 * Esta ruta está protegida y lista para que otros miembros del equipo
 * implementen la funcionalidad de historial de pedidos.
 */
function ShopcartHistoryPage() {
  return (
    <div className="container mx-auto p-8 max-w-6xl">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">
        Historial de Pedidos
      </h1>
      
      <div className="bg-white rounded-lg shadow-lg p-12 text-center">
        <p className="text-gray-600">
          Esta funcionalidad será implementada próximamente.
        </p>
      </div>
    </div>
  );
}

export default withAuthenticationRequired(ShopcartHistoryPage, {
  OnRedirecting: () => (
    <div className="container mx-auto p-8 max-w-6xl text-center">
      <p className="text-gray-600">Redirigiendo al login...</p>
    </div>
  )
});

