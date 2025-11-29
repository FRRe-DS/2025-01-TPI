import { useEffect, useState } from "react";
import { withAuthenticationRequired, useAuth } from "react-oidc-context";
import { getAccessToken } from "../services/auth/getAccessToken";

function ProfileRoute() {
  const auth = useAuth();
  const user = auth.user;

  const [backendProfile, setBackendProfile] = useState<{
    phone?: string;
    dni?: string;
    birthDate?: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = getAccessToken(user);
    if (token) {
      loadBackendProfile(token);
    }
  }, [user]);

  const loadBackendProfile = async (token: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE}/api/user/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setBackendProfile(data);
      } else {
        const body = await res.json().catch(() => ({}));
        if (res.status === 404 || body?.code === "PROFILE_NOT_FOUND") {
          // todavía no creó el perfil
          setBackendProfile(null);
        } else {
          throw new Error(body?.error || "Error desconocido");
        }
      }
    } catch (err: any) {
      console.error(err);
      setError("Error al obtener el perfil complementario");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
        {/* Encabezado */}
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
          <div className="w-20 h-20 bg-blue-900 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            {user?.profile?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              {user?.profile?.name || 'Usuario'}
            </h1>
            <p className="text-gray-600">{user?.profile?.email || 'Sin email'}</p>
          </div>
        </div>

        {/* Información OIDC */}
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información del Perfil (OIDC)
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Field label="Nombre" value={user?.profile?.given_name} />
              <Field label="Apellido" value={user?.profile?.family_name} />
              <Field label="Email" value={user?.profile?.email} />
              <Field label="Usuario" value={user?.profile?.preferred_username} />
            </div>
          </div>

          {/* Información complementaria del backend */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información Complementaria
            </h2>
            {loading ? (
              <p className="text-gray-500">Cargando...</p>
            ) : error ? (
              <p className="text-red-500">{error}</p>
            ) : backendProfile ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Teléfono" value={backendProfile.phone} />
                <Field label="DNI" value={backendProfile.dni} />
                <Field label="Fecha de nacimiento" value={backendProfile.birthDate} />
              </div>
            ) : (
              <p className="text-gray-500">Aún no cargaste tu información complementaria.</p>
            )}
          </div>

          {/* Información de sesión */}
          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información de la Sesión
            </h2>
            <Field
              label="Roles"
              value={
                user?.profile?.roles
                  ? Array.isArray(user.profile.roles)
                    ? user.profile.roles.join(", ")
                    : user.profile.roles
                  : "No asignados"
              }
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              onClick={() => window.location.href = '/'}
              className="flex-1 bg-blue-900 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-800 transition-all duration-300"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Field({ label, value }: { label: string; value?: string }) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <label className="text-sm font-semibold text-gray-600">{label}</label>
      <p className="text-gray-800 mt-1">{value || "No disponible"}</p>
    </div>
  );
}

export default withAuthenticationRequired(ProfileRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});