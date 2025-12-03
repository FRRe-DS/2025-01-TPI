import { useEffect, useState } from "react";
import { useAuth } from "react-oidc-context";
import { useLocation, useNavigate } from "react-router";
import { useTheme } from "../../contexts/ThemeContext";
import UserModal from "./UserModal";
import ShopCartModal from "./ShopCartModal";
import "./Header.css";

export default function Header() {
    const auth = useAuth();
    const path = useLocation().pathname;
    const navigate = useNavigate();
    const { isDark } = useTheme();
    const [showSearchButton, setShowSearchButton] = useState(false);
    const [isLeaving, setIsLeaving] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [searchHistory, setSearchHistory] = useState<string[]>([]);
    const [truckArrived, setTruckArrived] = useState(false);
    
    useEffect(() => {
        if (path !== '/login/callback') {
            localStorage.setItem('redirect_path', path);
        }
    }, [path]);

    // Marcar cuando el camión ha llegado (después de 2 segundos)
    useEffect(() => {
        const timer = setTimeout(() => {
            setTruckArrived(true);
        }, 2000);
        
        return () => clearTimeout(timer);
    }, []);

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

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchValue(e.target.value);
    };

    const clearSearch = () => {
        setSearchValue('');
    };

    // Cargar historial de búsquedas al abrir el buscador
    useEffect(() => {
        if (isSearchOpen) {
            const savedHistory = localStorage.getItem('searchHistory');
            if (savedHistory) {
                setSearchHistory(JSON.parse(savedHistory));
            }
        }
    }, [isSearchOpen]);

    // Guardar búsqueda en el historial
    const saveSearchToHistory = (query: string) => {
        if (query.trim() === '') return;
        
        const trimmedQuery = query.trim();
        const newHistory = [trimmedQuery, ...searchHistory.filter(item => item !== trimmedQuery)].slice(0, 5);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    // Manejar búsqueda (cuando se presiona Enter)
    const handleSearchSubmit = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchValue.trim()) {
            saveSearchToHistory(searchValue);
            performSearch(searchValue);
        }
    };

    // Eliminar búsqueda del historial
    const removeFromHistory = (queryToRemove: string) => {
        const newHistory = searchHistory.filter(item => item !== queryToRemove);
        setSearchHistory(newHistory);
        localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    };

    // Usar búsqueda del historial
    const useHistorySearch = (query: string) => {
        setSearchValue(query);
        performSearch(query);
    };

    // Función para realizar la búsqueda
    const performSearch = (query: string) => {
        // Cerrar el dropdown de búsqueda
        setIsSearchOpen(false);
        
        // Navegar a la página principal con la query como parámetro
        navigate(`/?q=${encodeURIComponent(query)}`);
        
        // Guardar la query en localStorage para que la página principal la use
        localStorage.setItem('searchQuery', query);
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
                                <img src={isDark ? "/logoshippernegro.png" : "/Shipper-mini.png"} alt="Shipper logo" className={`header-logo ${truckArrived ? 'arrived' : ''} ${isDark ? 'dark-logo' : ''}`} />
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
                                Iniciar sesión
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
                    <div className="apple-search-container">
                        <div className={`apple-search-field ${searchValue ? 'has-text' : ''}`}>
                            <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                                <circle cx="11" cy="11" r="8"/>
                                <path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input 
                                type="text" 
                                className="apple-search-input"
                                placeholder="Buscar productos, marcas..."
                                value={searchValue}
                                onChange={handleSearchChange}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        e.preventDefault();
                                        if (searchValue.trim()) {
                                            saveSearchToHistory(searchValue);
                                            performSearch(searchValue);
                                        }
                                    }
                                }}
                                autoFocus={isSearchOpen}
                            />
                            {searchValue && (
                                <button 
                                    className="clear-search-button"
                                    onClick={clearSearch}
                                    type="button"
                                    title="Limpiar búsqueda"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <line x1="18" y1="6" x2="6" y2="18"/>
                                        <line x1="6" y1="6" x2="18" y2="18"/>
                                    </svg>
                                </button>
                            )}
                        </div>
                    </div>
                    
                    {/* Historial de búsquedas */}
                    {searchHistory.length > 0 && (
                        <div className="quick-links-container">
                            <div className="quick-links">
                                {searchHistory.map((query, index) => (
                                    <div key={index} className="quick-link">
                                        <span className="quick-link-arrow">→</span>
                                        <span 
                                            className="quick-link-text"
                                            onClick={() => useHistorySearch(query)}
                                        >
                                            {query}
                                        </span>
                                        <button 
                                            className="remove-history-button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                removeFromHistory(query);
                                            }}
                                            title="Eliminar de historial"
                                        >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <line x1="18" y1="6" x2="6" y2="18"/>
                                                <line x1="6" y1="6" x2="18" y2="18"/>
                                            </svg>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}