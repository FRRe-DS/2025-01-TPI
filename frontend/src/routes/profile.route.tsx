import { withAuthenticationRequired } from "react-oidc-context";
import { useAuth } from "react-oidc-context";

function ProfileRoute() {
  const auth = useAuth();
  const user = auth.user;

  return (
    <main className="container mx-auto p-8 max-w-4xl">
      <div className="bg-white rounded-lg shadow-lg p-8">
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

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información del Perfil
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-semibold text-gray-600">Nombre</label>
                <p className="text-gray-800 mt-1">
                  {user?.profile?.given_name || 'No disponible'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-semibold text-gray-600">Apellido</label>
                <p className="text-gray-800 mt-1">
                  {user?.profile?.family_name || 'No disponible'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-semibold text-gray-600">Email</label>
                <p className="text-gray-800 mt-1">
                  {user?.profile?.email || 'No disponible'}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="text-sm font-semibold text-gray-600">Usuario</label>
                <p className="text-gray-800 mt-1">
                  {user?.profile?.preferred_username || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Información de la Sesión
            </h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <label className="text-sm font-semibold text-gray-600">Roles</label>
              <p className="text-gray-800 mt-1">
                {user?.profile?.roles ? 
                  Array.isArray(user.profile.roles) ? 
                    user.profile.roles.join(', ') : 
                    user.profile.roles 
                  : 'No asignados'}
              </p>
            </div>
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

export default withAuthenticationRequired(ProfileRoute, {
  OnRedirecting: () => (<div className="p-8 text-center">Redirigiendo al login...</div>)
});

