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
    console.log('🔍 Verificando datos guardados...');
    const savedUser = authService.getCurrentUser();
    console.log('👤 Usuario guardado:', savedUser);
    if (savedUser) {
      console.log('Restaurando sesión...');
      setUser({ user: savedUser });
    } else {
      console.log('No hay datos guardados');
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
