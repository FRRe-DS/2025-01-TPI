import React, { useState, useEffect } from "react";
import "./App.css";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from "./components/auth/Login";
import { removeToken, removeUser } from './services/config/apiConfig';
import authService from './services/auth/authService';

function App() {
  const [user, setUser] = useState(null);

  // Verificar si hay datos del usuario al cargar la aplicación
  useEffect(() => {
    const savedUser = authService.getCurrentUser();
    if (savedUser) {
      setUser({ user: savedUser });
    }
  }, []);

  const handleLogout = () => {
    removeToken();
    removeUser();
    setUser(null);
  };

  return (
    <div className="app">
      <Header user={user} onLogout={handleLogout} />      
        <main className="main-content">
          {!user ? (
            <Login onLogin={setUser} />
          ) : (
            <div className="welcome-message">

              <h2>¡Bienvenido!</h2>
              <p>Tu sesión está iniciada</p>

            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
