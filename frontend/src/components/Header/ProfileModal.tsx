import { useState, useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { getUserProfile, updateUserProfile, type UpdateProfileData } from "../../services/user.service";
import "./Header.css";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const auth = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
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
    setSuccess(null);
    
    try {
      const token = auth.user?.access_token;
      if (!token) {
        throw new Error('No hay token de acceso disponible');
      }

      const response = await getUserProfile(token);
      
      if (response.success && response.user) {
        setFormData({
          firstName: response.user.firstName || '',
          lastName: response.user.lastName || '',
          email: response.user.email || '',
          phone: response.user.phone || '',
          dni: response.user.dni || '',
          birthDate: response.user.birthDate || ''
        });
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el perfil');
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
    setSuccess(null);

    try {
      const token = auth.user?.access_token;
      if (!token) {
        throw new Error('No hay token de acceso disponible');
      }

      // Preparar datos para enviar
      const updateData: UpdateProfileData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        phone: formData.phone,
        dni: formData.dni,
        birthDate: formData.birthDate,
      };

      const response = await updateUserProfile(token, updateData);
      
      if (response.success) {
        setEditMode(false);
        // Recargar el perfil para mostrar los datos actualizados
        await loadProfile();
        
        // Mostrar mensaje de éxito después de recargar
        setSuccess('Perfil actualizado exitosamente');
        
        // Ocultar mensaje de éxito después de 5 segundos
        setTimeout(() => {
          setSuccess(null);
        }, 5000);
      } else {
        throw new Error('Error en la respuesta del servidor');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el perfil');
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

        {success && (
          <div className="success-message">
            ✅ {success}
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
                  onChange={handleInputChange}
                  disabled={!editMode}
                  className={!editMode ? 'disabled' : ''}
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

