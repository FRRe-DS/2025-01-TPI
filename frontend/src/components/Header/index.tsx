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

    // Debug logs
    useEffect(() => {
        console.log('Auth state:', {
            isAuthenticated: auth.isAuthenticated,
            isLoading: auth.isLoading,
            error: auth.error,
            user: auth.user
        });
    }, [auth.isAuthenticated, auth.isLoading, auth.error, auth.user]);

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
                            onClick={() => {
                                console.log('Botón de login clickeado');
                                auth.signinRedirect();
                            }}
                            type="button"
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