import { useState } from "react";
import { useAuth } from "react-oidc-context";
import { useNavigate } from "react-router";

export default function UserModal() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleProfileClick = () => {
    setShowModal(false);
    navigate('/profile');
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
            <button onClick={handleLogout}>
              Cerrar Sesión
            </button>
          </div>
        </>
      )}
    </div>
  );
}