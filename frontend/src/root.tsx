import React from 'react';
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { AuthProvider } from 'react-oidc-context';
import type { Route } from "./+types/root";
import "./App.css";
import Header from "./components/Header";
import type { User } from "oidc-client-ts";
import { CartProvider } from "./contexts/CartContext";
import { NavigationProvider } from "./contexts/NavigationContext";
import { ThemeProvider, useTheme } from "./contexts/ThemeContext";
import { GlobalTransition } from "./components/GlobalTransition";
import ServiceStatus from "./components/ServiceStatus";
import { useAuth } from "react-oidc-context";
import { getAccessToken } from "./services/auth/getAccessToken";

// Componente para mostrar el token en consola (debe estar dentro de AuthProvider)
function TokenLogger() {
  const auth = useAuth();
  const user = auth.user;

  React.useEffect(() => {
    const token = getAccessToken(user);
    if (token) {
      console.log("🔑 TOKEN DE ACCESO:", token);
      console.log("📋 Token completo (para copiar):", token);
    }
  }, [user]);

  return null;
}

export function Layout({ children }: { children: React.ReactNode }) {
  // Obtener el origin de forma segura para SSR
  const getOrigin = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    // Valor por defecto para SSR
    return import.meta.env.VITE_APP_ORIGIN || 'http://localhost:5173';
  };

  const origin = getOrigin();

  const oidcConfig = {
    authority: import.meta.env.VITE_KEYCLOAK_ISSUER || 'http://localhost:8080/realms/ds-2025-realm',
    client_id: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'grupo-11',
    redirect_uri: `${origin}/login/callback`,
    response_type: 'code',
    post_logout_redirect_uri: `${origin}/`,
    scope: 'openid', // Empezar con solo openid, agregar profile email si están disponibles en Keycloak
    loadUserInfo: true,
    onSigninCallback: (_user: User | void): void => {
      if (typeof window !== 'undefined') {
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname
        );
      }
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/vite.svg" type="image/x-icon" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider {...oidcConfig}>
          <CartProvider>
            <ThemeProvider>
              <NavigationProvider>
                <TokenLogger />
                <Header/>
                {children}
                <GlobalTransition />
                <ServiceStatus />
              </NavigationProvider>
            </ThemeProvider>
          </CartProvider>
        </AuthProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

function ErrorBoundaryContent({ error }: Route.ErrorBoundaryProps) {
  const { isDark } = useTheme();

  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className={`pt-16 p-4 container mx-auto min-h-screen ${isDark ? 'bg-gradient-to-br from-blue-950 via-slate-800 to-slate-900' : 'bg-white'}`}>
      <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{message}</h1>
      <p className="text-gray-600 dark:text-blue-300 mb-4">{details}</p>
      {stack && (
        <pre className={`w-full p-4 overflow-x-auto rounded ${isDark ? 'bg-blue-700 text-white' : 'bg-gray-100 text-gray-800'}`}>
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

export function ErrorBoundary(props: Route.ErrorBoundaryProps) {
  // Ignorar errores de Chrome DevTools (no son errores reales)
  if (typeof window !== 'undefined') {
    const path = window.location.pathname;
    if (path.includes('.well-known') || path.includes('appspecific')) {
      return null; // No mostrar error para rutas de Chrome DevTools
    }
  }

  return (
    <ThemeProvider>
      <ErrorBoundaryContent {...props} />
    </ThemeProvider>
  );
}
