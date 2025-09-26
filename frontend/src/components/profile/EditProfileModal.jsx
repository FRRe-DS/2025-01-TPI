import React, { useEffect, useState } from "react";
import "./EditProfileModal.css";
import ChangePasswordModal from "../auth/ChangePasswordModal";

const EditProfileModal = ({ onClose, user }) => {
  const [name, setName] = useState("");
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // abrir modal
  const handleOpenChangePassword = () => {
    setShowChangePasswordModal(true);
  };

  // cerrar modal
  const handleCloseChangePassword = () => {
    setShowChangePasswordModal(false);
  };
  
  useEffect(() => {
    setName(user?.user?.name || user?.name || "");
  }, [user]);

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edición de perfil</h2>
        <form>
          <div style={{ textAlign: "left", marginBottom: "1rem" }}>
            <label htmlFor="name" style={{ display: "block", fontWeight: 600 }}>Usuario:</label>
            <input
              id="name"
              type="text"
              value={name}
              readOnly
              style={{ width: "100%", padding: ".6rem", borderRadius: ".5rem", border: "1px solid #ccc", backgroundColor: "#f0f0f0" }}
            />
          </div> 
        </form>

        <div className="modal-actions">
          

          <button type="button" onClick={handleOpenChangePassword} className ="change-password-btn">
            Cambiar contraseña
          </button>

          <button type="button" onClick={onClose} className="cancel-btn">
            Cerrar
          </button>
        </div>
      </div>
       {/* Renderizar el modal de cambiar contraseña si está activo */}
       {showChangePasswordModal && (
        <ChangePasswordModal onClose={handleCloseChangePassword} />
      )}
    </div>
  );
};

export default EditProfileModal;
