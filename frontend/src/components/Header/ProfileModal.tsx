import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import "./Header.css";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  // Estados para el formulario
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    dni: '',
    birthDate: ''
  });

  useEffect(() => {
    if (isOpen && auth.user) {
      loadProfile();
    }
  }, [isOpen, auth.user]);

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Por ahora, usamos los datos del token OIDC
      // Cuando tengamos el endpoint en el backend, usaremos getUserProfile
      const profile = auth.user?.profile;
      
      setFormData({
        firstName: profile?.given_name || '',
        lastName: profile?.family_name || '',
        email: profile?.email || '',
        phone: '', // Estos vendrán del backend eventualmente
        dni: '',
        birthDate: ''
      });
    } catch (err) {
      setError('Error al cargar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // TODO: Cuando tengamos el endpoint, actualizar el perfil
      // const token = auth.user?.access_token;
      // if (token) {
      //   await updateUserProfile(token, formData);
      // }
      
      setEditMode(false);
      // Mostrar mensaje de éxito
      alert('Perfil actualizado exitosamente (funcionalidad pendiente de implementación en backend)');
    } catch (err) {
      setError('Error al actualizar el perfil');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    loadProfile(); // Recargar datos originales
    setEditMode(false);
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="modal-backdrop"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="profile-modal">
        <div className="profile-modal-header">
          <h2>Mi Perfil</h2>
          <button 
            className="close-button"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando...</p>
          </div>
        )}

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        {!loading && !error && (
          <form onSubmit={handleSubmit} className="profile-form">
            {/* Avatar y nombre */}
            <div className="profile-header">
              <div className="profile-avatar">
                {formData.firstName?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="profile-name">
                <h3>{`${formData.firstName || ''} ${formData.lastName || ''}`}</h3>
                <p>{formData.email}</p>
              </div>
            </div>

            {/* Información Personal */}
            <div className="form-section">
              <h3>Información Personal</h3>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="firstName">Nombre</label>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={!editMode ? 'disabled' : ''}
                  />
                  {!editMode}
                </div>

                <div className="form-field">
                  <label htmlFor="lastName">Apellido</label>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={!editMode ? 'disabled' : ''}
                  />
                  {!editMode}
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="disabled"
                />
              </div>
            </div>

            {/* Información Adicional */}
            <div className="form-section">
              <h3>Información Adicional</h3>
              
              <div className="form-row">
                <div className="form-field">
                  <label htmlFor="phone">Teléfono</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={!editMode ? 'disabled' : ''}
                    placeholder="Ej: +54 9 11 1234-5678"
                  />
                </div>

                <div className="form-field">
                  <label htmlFor="dni">DNI</label>
                  <input
                    id="dni"
                    name="dni"
                    type="text"
                    value={formData.dni}
                    onChange={handleInputChange}
                    disabled={!editMode}
                    className={!editMode ? 'disabled' : ''}
                    placeholder="Ej: 12345678"
                  />
                </div>
              </div>

              <div className="form-field">
                <label htmlFor="birthDate">Fecha de Nacimiento</label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formData.birthDate}
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={!editMode ? 'disabled' : ''}
                />
              </div>
            </div>

            {/* Botones de acción */}
            <div className="form-actions">
              {!editMode ? (
                <>
                  <button 
                    type="button"
                    className="btn-primary"
                    onClick={() => setEditMode(true)}
                  >
                    Editar Perfil
                  </button>
                </>
              ) : (
                <>
                  <button 
                    type="button"
                    className="btn-secondary"
                    onClick={handleCancel}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit"
                    className="btn-primary"
                    disabled={loading}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}

