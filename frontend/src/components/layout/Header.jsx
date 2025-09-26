import React, {useState} from 'react';
import './Header.css';
import miniLogo from "../../assets/Shipper-mini.png"; 
import EditProfileModal from '../profile/EditProfileModal';
import ChangePasswordModal from '../auth/ChangePasswordModal';

const Header = ({ user, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);


  const handleToggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleOpenEditModal = () => {
    setShowEditModal(true);
    setMenuOpen(false); 
  }

  const handleOpenChangePasswordModal = () => {
    setShowChangePasswordModal(true);
    setMenuOpen(false);
  }

  const handleCloseEditModal = () => setShowEditModal(false);
  const handleCloseChangePasswordModal = () => setShowChangePasswordModal(false);

  return (
    <header className="header">
      <div className="header-container">
        <div className="header-left">
          <h1>
            <img src={miniLogo} alt="Shipper logo" className="header-logo" />
            <em>Shipper</em>
          </h1>
        </div>
        
        <div className="header-right">
         {/* Solo  si el usuario está logueado */}
         {user && (
            <div className="user-menu">
              <div 
                className="user-icon" 
                title={user.user?.name || "Usuario"} 
                onClick={handleToggleMenu}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" fill="currentColor"/>
                  <path d="M12 14C7.58172 14 4 17.5817 4 22H20C20 17.5817 16.4183 14 12 14Z" fill="currentColor"/>
                </svg>
              </div>

              {menuOpen && (
                <div className="dropdown-menu">
                  <button onClick={handleOpenEditModal}>Editar perfil</button>
                  <button onClick={onLogout}>Cerrar sesión</button>
                </div>
              )}
        </div>
        )}
      </div>
      </div>
    {showEditModal && <EditProfileModal onClose={handleCloseEditModal} user={user} />}
    {showChangePasswordModal && <ChangePasswordModal onClose={handleCloseChangePasswordModal} />}
    </header>
  );
};

export default Header;
