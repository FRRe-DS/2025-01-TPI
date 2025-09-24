import React, { useState } from "react";
import "./Login.css";
import logo from "../assets/Shipper-logo.png";


function Login({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("https://p01--backend--vtq7dc7r2j7w.code.run/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) throw new Error("Error en login");

      const data = await response.json();
      localStorage.setItem("token", data.token);
      onLogin(data);
    } catch (err) {
      setError("Usuario o contraseña incorrectos. Intenta de nuevo.");
    }
  };

  return (
      <div className="login-page">
      {/* Columna izquierda con logo */}
      <div className="split-left">
        <img src={logo} alt="Shipper logo" className="logo-left" />
      </div>

      {/* Columna derecha con formulario */}
      <div className="split-right">
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          <form onSubmit={handleSubmit} className="login-form">
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button type="submit">Ingresar</button>

            <p className="forgot-password">
              <a href="#">¿Olvidaste tu contraseña?</a>
            </p>

            <hr className="form-divider" />

            <p className="register">
              ¿No tenés cuenta? <a href="#">Registrate</a>
            </p>
          </form>
        {error && <p className="error">{error}</p>}
      </div>
      </div>
    </div>
  );
}
export default Login;
