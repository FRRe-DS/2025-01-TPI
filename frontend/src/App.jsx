import React, { useState } from "react";
import "./App.css";
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import Login from "./components/auth/Login";
import { removeToken } from './services/config/apiConfig';

function App() {
  const [user, setUser] = useState(null);

  const handleLogout = () => {
    removeToken();
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
              <h2>¡Bienvenido {user.user.name}!</h2>
              <p>Tu sesión está iniciada 🎉</p>
            </div>
          )}
      </main>

      <Footer />
    </div>
  );
}

export default App;
