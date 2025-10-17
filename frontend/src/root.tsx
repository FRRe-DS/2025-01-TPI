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
import "./app.css";
import Header from "./components/Header";
import type { User } from "oidc-client-ts";

export function Layout({ children }: { children: React.ReactNode }) {
  const oidcConfig = {
    authority: 'http://localhost:8080/realms/ds-2025-realm',
    client_id: 'grupo-01',
    redirect_uri: 'http://localhost:5173/login/callback',
    response_type: 'code',
    post_logout_redirect_uri: 'http://localhost:5173/',
    scope: 'productos:read',
    onSigninCallback: (_user: User | void): void => {
     window.history.replaceState(
         {},
         document.title,
         window.location.pathname
     )
    }
  };

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="shortcut icon" href="/vite.svg" type="image/x-icon" />
        <Meta />
        <Links />
      </head>
      <body>
        <AuthProvider {...oidcConfig}>
          <Header/>
          {children}
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

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
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
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
