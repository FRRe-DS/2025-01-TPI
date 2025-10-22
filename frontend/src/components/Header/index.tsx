import { useEffect } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";
import UserModal from "./UserModal";
import ShopCartModal from "./ShopCartModal";
import "./Header.css";

export default function Header() {
    const auth = useAuth();
    const path = useLocation().pathname;
    
    useEffect(() => {
        if (path !== '/login/callback') {
            localStorage.setItem('redirect_path', path);
        }
    }, [path]);

    return (
        <header className="header">
            <div className="header-container">
                <div className="header-left">
                    <a href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'flex', alignItems: 'center' }}>
                        <h1>
                            <img src="/Shipper-mini.png" alt="Shipper logo" className="header-logo" />
                            <em>Shipper</em>
                        </h1>
                    </a>
                </div>
                
                <div className="header-right">
                    {!auth.isAuthenticated ? (
                        <button 
                            className="login-button" 
                            onClick={() => auth.signinRedirect()}
                        >
                            Iniciar Sesión
                        </button>
                    ) : (
                        <>
                            <ShopCartModal />
                            <UserModal />
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}