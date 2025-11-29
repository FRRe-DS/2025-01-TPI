import { useEffect, useState } from "react";

interface ServiceStatus {
  name: string;
  url: string;
  status: 'checking' | 'online' | 'offline';
}

export default function ServiceStatus() {
  const [services, setServices] = useState<ServiceStatus[]>([]);

  const checkService = async (service: ServiceStatus): Promise<'online' | 'offline'> => {
    try {
      // Usar AbortController para timeout ya que AbortSignal.timeout puede no estar disponible
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000);
      
      try {
        const response = await fetch(service.url, {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache',
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        // Consideramos online si responde (200, 401, 404, etc. - cualquier cosa excepto error de red)
        // 401/404 son válidos porque significa que el servidor está funcionando pero requiere auth o la ruta no existe
        return response.status < 500 ? 'online' : 'offline';
      } catch (fetchError) {
        clearTimeout(timeoutId);
        throw fetchError;
      }
    } catch (error) {
      // Error de red o timeout = offline
      return 'offline';
    }
  };

  useEffect(() => {
    const GATEWAY_URL = import.meta.env.VITE_API_GATEWAY_URL || 'http://localhost:8000';
    
    const checkAllServices = async () => {
      const serviceUrls = [
        { name: 'Compras', url: `${GATEWAY_URL}/compras/health`, status: 'checking' as const },
        { name: 'Stock', url: `${GATEWAY_URL}/stock/`, status: 'checking' as const },
        { name: 'Logística', url: `${GATEWAY_URL}/logistica/`, status: 'checking' as const },
      ];
      
      const updatedServices = await Promise.all(
        serviceUrls.map(async (service) => {
          const status = await checkService(service);
          return { ...service, status };
        })
      );
      setServices(updatedServices);
    };

    // Verificar inmediatamente
    checkAllServices();
    
    // Verificar cada 30 segundos
    const interval = setInterval(checkAllServices, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const allOnline = services.every(s => s.status === 'online');
  const anyChecking = services.some(s => s.status === 'checking');

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-3 min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className={`w-2 h-2 rounded-full ${
              anyChecking
                ? 'bg-yellow-500 animate-pulse'
                : allOnline
                ? 'bg-green-500'
                : 'bg-red-500'
            }`}
          />
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Servicios
          </span>
        </div>
        <div className="space-y-1">
          {services.map((service) => (
            <div key={service.name} className="flex items-center gap-2 text-xs">
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  service.status === 'checking'
                    ? 'bg-yellow-500 animate-pulse'
                    : service.status === 'online'
                    ? 'bg-green-500'
                    : 'bg-red-500'
                }`}
              />
              <span className="text-gray-600 dark:text-gray-400">{service.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

