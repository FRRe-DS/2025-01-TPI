import React, { useState } from "react";
import "./App.css";
import Header from './components/Header';
import Footer from './components/Footer';
import Login from "./components/Login";

function App() {
  const [user, setUser] = useState(null);

  return (
    <div className="app">
      <Header />

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
