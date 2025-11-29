// Ruta catch-all para manejar rutas no encontradas
// Ignora rutas de Chrome DevTools y otras rutas no definidas

export default function NotFound() {
  // Si es una ruta de Chrome DevTools, retornar null (no mostrar error)
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('.well-known') || path.includes('appspecific')) {
      return null;
    }
  }

  return (
    <main className="pt-16 p-4 container mx-auto bg-white dark:bg-blue-700 min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-4">404</h1>
        <p className="text-gray-600 dark:text-blue-300 mb-4">Página no encontrada</p>
        <a 
          href="/" 
          className="text-blue-600 dark:text-blue-400 hover:underline"
        >
          Volver al inicio
        </a>
      </div>
    </main>
  );
}

