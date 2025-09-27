import React, { useState } from "react";
import "./ChangePasswordModal.css";
import authService from "../../services/auth/authService";

export default function ChangePasswordModal({ onClose }) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword1, setNewPassword1] = useState("");
  const [newPassword2, setNewPassword2] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!currentPassword || !newPassword1 || !newPassword2) {
      setError("Completá todos los campos.");
      return;
    }
    if (newPassword1 !== newPassword2) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (newPassword1.length < 8) {
      setError("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }


    try {
      setLoading(true);

      await authService.changePassword(currentPassword, newPassword1);
      setSuccess("¡Contraseña actualizada!");
      
      // Limpiar formulario
      setCurrentPassword("");
      setNewPassword1("");
      setNewPassword2("");
      
      // Cerrar modal después de 2 segundos
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error) {
      console.error("Error al cambiar contraseña:", error);
    
      if (error.status === 401) {
        setError("No autorizado. Volvé a iniciar sesión.");
      } else if (error.status === 400) {
        setError("La contraseña actual es incorrecta.");
      } else if (error.status === 500) {
        setError("Error del servidor. Intentá más tarde.");
      } else {
        setError(error.message || "No se pudo cambiar la contraseña.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cp-modal-backdrop" onClick={onClose}>
      <div className="cp-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="cp-modal__header">
          <h3>Cambiar contraseña</h3>
          <button className="cp-close" onClick={onClose} aria-label="Cerrar">×</button>
        </div>

        <form onSubmit={handleSubmit} className="cp-modal__body">
          <label className="cp-field">
            <span>Contraseña actual</span>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>

          <label className="cp-field">
            <span>Nueva contraseña</span>
            <input
              type="password"
              value={newPassword1}
              onChange={(e) => setNewPassword1(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          <label className="cp-field">
            <span>Repetir nueva contraseña</span>
            <input
              type="password"
              value={newPassword2}
              onChange={(e) => setNewPassword2(e.target.value)}
              autoComplete="new-password"
              required
            />
          </label>

          {error && <div className="cp-alert cp-alert--error">{error}</div>}
          {success && <div className="cp-alert cp-alert--ok">{success}</div>}

          <div className="cp-modal__footer">
            <button type="button" className="cp-btn cp-btn--ghost" onClick={onClose} disabled={loading}>
              Cancelar
            </button>
            <button type="submit" className="cp-btn cp-btn--primary" disabled={loading}>
              {loading ? "Guardando..." : "Guardar cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
