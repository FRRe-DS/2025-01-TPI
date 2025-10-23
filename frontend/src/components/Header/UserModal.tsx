import { useState } from "react";
import { useAuth } from "react-oidc-context";
import ProfileModal from "./ProfileModal";

export default function UserModal() {
  const auth = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [showUnderConstruction, setShowUnderConstruction] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  const handleProfileClick = () => {
    setShowModal(false);
    setShowProfileModal(true);
  };

  const handlePedidos = () => {
    setShowModal(false);
    setShowUnderConstruction(true);
  };

  const handleLogout = () => {
    setShowModal(false);
    auth.removeUser();
    auth.signoutRedirect();
  };

  return (
    <div className="user-menu">
      <div 
        className="user-icon" 
        onClick={() => setShowModal(!showModal)}
        title={auth.user?.profile?.name || "Usuario"}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
          <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
        </svg>
      </div>
      
      {showModal && (
        <>
          <div 
            onClick={() => setShowModal(false)} 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 99
            }}
          />
          <div className="dropdown-menu">
            <button onClick={handleProfileClick}>
              Perfil
            </button>
            <button onClick={handlePedidos}>
              Mis pedidos
            </button>
            <button onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}

      {/* Modal de Perfil */}
      <ProfileModal 
        isOpen={showProfileModal} 
        onClose={() => setShowProfileModal(false)} 
      />

      {/* Modal "En construcción" */}
      {showUnderConstruction && (
        <>
          <div 
            onClick={() => setShowUnderConstruction(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 1000
            }}
          >
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'white',
                borderRadius: '1rem',
                padding: '2rem',
                maxWidth: '400px',
                width: '90%',
                textAlign: 'center',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)'
              }}
            >
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🚧</div>
              <h2 style={{ color: '#032d70', marginBottom: '1rem', fontSize: '1.5rem' }}>
                En Construcción
              </h2>
              <p style={{ color: '#666', marginBottom: '1.5rem' }}>
                Esta funcionalidad estará disponible próximamente.
              </p>
              <button 
                onClick={() => setShowUnderConstruction(false)}
                style={{
                  background: '#032d70',
                  color: 'white',
                  border: 'none',
                  padding: '0.75rem 2rem',
                  borderRadius: '0.5rem',
                  fontSize: '1rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#02244f';
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = '#032d70';
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Entendido
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}