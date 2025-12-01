import { useEffect } from "react";
import { useAuth, withAuthenticationRequired } from "react-oidc-context";
import { useNavigate } from "react-router";

const LoginCallback = () => {
  const auth = useAuth()
  const navigate = useNavigate();

  useEffect(() => {
    if (auth.isLoading) return; // Espera a que termine de cargar el estado de autenticación

    if (auth.isAuthenticated) {
      const redirectPath = localStorage.getItem('redirect_path') || '/';
      navigate(redirectPath, { replace: true });
    } else if (!auth.isAuthenticated && !auth.isLoading && !auth.error) {
      auth.signinRedirect();
    }
    // Si hay error, podrías mostrar un mensaje o manejarlo aquí
  }, [auth.isAuthenticated, auth.isLoading, auth.error, navigate, auth]);

  return null;
}

export default withAuthenticationRequired(LoginCallback, {
  OnRedirecting: () => (<div>Redirecting to the login page...</div>)
});