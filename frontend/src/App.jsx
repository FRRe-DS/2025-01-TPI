import React, { useState } from "react";
import "./App.css";
import Header from './components/Header';
import Footer from './components/Footer';
import Login from "./components/Login";
import logo from "./assets/shipper-logo.svg";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <Header />

      <main className="main-content">
        {/* Columna izquierda con logo */}
        <div className="split-left">
          <img src={logo} alt="Shipper logo" className="logo-left" />
        </div>

        {/* Columna derecha con login o bienvenida */}
        <div className="split-right">
          {!user ? (
            <Login onLogin={setUser} />
          ) : (
            <div className="welcome-message">
              <h2>¡Bienvenido {user.user.name}!</h2>
              <p>Tu sesión está iniciada 🎉</p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default App;
