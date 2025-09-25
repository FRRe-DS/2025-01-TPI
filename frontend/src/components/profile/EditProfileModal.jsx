import React from "react";
import "./EditProfileModal.css";

const EditProfileModal = ({ onClose }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <h2>Edición de perfil</h2>
        <p>(Formulario de edición en construcción...)</p>

        <div className="modal-actions">
          <button type="button" onClick={onClose} className="cancel-btn">
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;
