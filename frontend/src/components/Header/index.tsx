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
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    
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
        // Toggle del buscador desplegable
        setIsSearchOpen(!isSearchOpen);
    };

    const closeSearch = () => {
        setIsSearchOpen(false);
    };

    // Efecto para manejar la tecla ESC
    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape' && isSearchOpen) {
                closeSearch();
            }
        };

        if (isSearchOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchOpen]);

    // Efecto para manejar mouse leave del header y desplegable
    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!isSearchOpen) return;
            
            const target = event.target as Element;
            const header = document.querySelector('.header');
            const searchDropdown = document.querySelector('.search-dropdown');
            
            // Verificar si el mouse está fuera del header y del desplegable
            if (header && searchDropdown && 
                !header.contains(target) && 
                !searchDropdown.contains(target)) {
                closeSearch();
            }
        };

        if (isSearchOpen) {
            // Pequeño delay para evitar que se cierre inmediatamente al abrir
            const timeoutId = setTimeout(() => {
                document.addEventListener('mousemove', handleMouseMove);
            }, 100);
            
            return () => {
                clearTimeout(timeoutId);
                document.removeEventListener('mousemove', handleMouseMove);
            };
        }
    }, [isSearchOpen]);


    return (
        <>
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

            {/* Overlay de fondo borroso */}
            {isSearchOpen && (
                <div className="search-overlay" onClick={closeSearch}></div>
            )}

            {/* Sección de búsqueda desplegable */}
            <div className={`search-dropdown ${isSearchOpen ? 'search-dropdown--open' : ''}`}>
                <div className="search-dropdown-content">
                    {/* Aquí irá el contenido del buscador más adelante */}
                </div>
            </div>
        </>
    );
}