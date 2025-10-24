import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation } from "react-router";
import UserModal from "./UserModal";
import ShopCartModal from "./ShopCartModal";
import "./Header.css";

export default function Header() {
    const auth = useAuth();
    const path = useLocation().pathname;
    const [showSearchButton, setShowSearchButton] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    
    useEffect(() => {
        if (path !== '/login/callback') {
            localStorage.setItem('redirect_path', path);
        }
    }, [path]);

    // Lógica para mostrar/ocultar el botón de búsqueda
    useEffect(() => {
        const checkSearchBarVisibility = () => {
            if (typeof window === 'undefined') return;
            
            const searchBar = document.querySelector('[data-search-bar]');
            if (searchBar) {
                const rect = searchBar.getBoundingClientRect();
                const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
                const shouldShow = !isVisible;
                
                if (shouldShow && !showSearchButton) {
                    // Mostrar el botón
                    setShowSearchButton(true);
                    setIsLeaving(false);
                } else if (!shouldShow && showSearchButton) {
                    // Ocultar el botón con animación
                    setIsLeaving(true);
                    setTimeout(() => {
                        setShowSearchButton(false);
                        setIsLeaving(false);
                    }, 300); // Duración de la animación de salida
                }
            } else {
                // Si no hay SearchBar en la página, mostrar el botón
                if (!showSearchButton) {
                    setShowSearchButton(true);
                    setIsLeaving(false);
                }
            }
        };

        // Verificar inicialmente
        checkSearchBarVisibility();

        // Escuchar scroll y resize
        window.addEventListener('scroll', checkSearchBarVisibility);
        window.addEventListener('resize', checkSearchBarVisibility);

        return () => {
            window.removeEventListener('scroll', checkSearchBarVisibility);
            window.removeEventListener('resize', checkSearchBarVisibility);
        };
    }, [path, showSearchButton]);

    const handleSearchClick = () => {
        // Scroll hacia el SearchBar principal si existe
        const searchBar = document.querySelector('[data-search-bar]');
        if (searchBar) {
            searchBar.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };


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
                    {/* Botón de búsqueda - solo visible cuando el SearchBar principal no está en pantalla */}
                    {showSearchButton && (
                        <button 
                            className={`search-button ${isLeaving ? 'leaving' : 'entering'}`}
                            onClick={handleSearchClick}
                            type="button"
                            title="Buscar productos"
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                        </button>
                    )}
                    
                    {!auth.isAuthenticated ? (
                        <button 
                            className="login-button" 
                            onClick={() => {
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