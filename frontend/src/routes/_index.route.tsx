// src/routes/index.route.tsx
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { getProducts, getProductsFromStockDocker, type PaginatedProducts } from "../services/product.service";
import ProductList from "../components/Product";
import { SearchBar } from "../components/Product/SearchBar";
import CategoryCard from "../components/CategoryCard";
import AdvancedFilters, { FilterBar, type FilterState } from "../components/AdvancedFilters";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "react-oidc-context";
import { getAccessToken } from "../services/auth/getAccessToken";

export default function IndexRoute() {
  const location = useLocation();
  const { isDark } = useTheme();
  const auth = useAuth();
  const [productData, setProductData] = useState<PaginatedProducts | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    q: ''
  });
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const limit = 1000; // Mostrar todos los productos sin paginación
  
  // Flag para usar el backend de stock en Docker (para pruebas)
  const USE_STOCK_DOCKER = true;
  
  // Ref para hacer scroll a la sección de productos
  const productsSectionRef = useRef<HTMLElement>(null);
  const filterButtonRef = useRef<HTMLDivElement>(null);

  // Cargar query del localStorage al montar el componente
  useEffect(() => {
    const savedQuery = localStorage.getItem('searchQuery');
    if (savedQuery) {
      setQuery(savedQuery);
      setShowProducts(true);
      // Limpiar el localStorage después de usarlo
      localStorage.removeItem('searchQuery');
    }
  }, []);

  // Ejecutar petición automáticamente cuando hay token (para pruebas con Stock Docker)
  useEffect(() => {
    console.log('[IndexRoute] useEffect triggered - USE_STOCK_DOCKER:', USE_STOCK_DOCKER);
    console.log('[IndexRoute] auth.user:', !!auth.user);
    console.log('[IndexRoute] auth.isAuthenticated:', auth.isAuthenticated);
    
    if (USE_STOCK_DOCKER && auth.user && auth.isAuthenticated) {
      const token = getAccessToken(auth.user);
      console.log('[IndexRoute] Token available:', !!token);
      
      if (token) {
        console.log('[IndexRoute] 🚀 Auto-fetching products from Stock Docker (token available)');
        console.log('[IndexRoute] Token (first 50 chars):', token.substring(0, 50));
        setShowProducts(true);
        setLoading(true);
        setError(null);
        
        const filterParams = { 
          page: 1, 
          limit: 10, 
          q: '', 
        };
        
        console.log('[IndexRoute] Calling getProductsFromStockDocker with params:', filterParams);
        getProductsFromStockDocker(filterParams, token)
          .then(data => {
            console.log('[IndexRoute] ✅ Products loaded from Stock Docker:', data);
            setProductData(data);
            setLoading(false);
          })
          .catch(err => {
            console.error("[IndexRoute] ❌ Error loading products from Stock Docker:", err);
            setError(err.message);
            setLoading(false);
          });
      } else {
        console.warn('[IndexRoute] ⚠️ No token available even though user is authenticated');
      }
    } else {
      console.log('[IndexRoute] ⏭️ Skipping Stock Docker fetch - conditions not met');
    }
  }, [auth.user, auth.isAuthenticated]);

  // Efecto para mostrar/ocultar el botón de filtros basado en scroll
  useEffect(() => {
    const handleScroll = () => {
      if (productsSectionRef.current && showProducts) {
        const rect = productsSectionRef.current.getBoundingClientRect();
        // Lógica de visibilidad eliminada junto con el modal
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showProducts]);

  useEffect(() => {
    if (showProducts) {
      setLoading(true);
      setError(null);
      
      const filterParams = { 
        page: 1, 
        limit, 
        q: query, 
        categoryId: filters.category !== 'all' ? filters.category : undefined,
        marca: filters.marca !== 'all' ? filters.marca : undefined,
        color: filters.color !== 'all' ? filters.color : undefined,
        precioMin: filters.precioMin || undefined,
        precioMax: filters.precioMax || undefined,
        sortBy: (filters.orden || 'popularidad_desc') as any
      };
      
      // Si está habilitado usar stock Docker y hay token, usar el backend de stock
      if (USE_STOCK_DOCKER && auth.user) {
        const token = getAccessToken(auth.user);
        if (token) {
          console.log('[IndexRoute] Using Stock Docker backend with token');
          getProductsFromStockDocker(filterParams, token)
            .then(data => {
              setProductData(data);
              setLoading(false);
            })
            .catch(err => {
              console.error("[IndexRoute] Error loading products from Stock Docker:", err);
              setError(err.message);
              setLoading(false);
            });
          return;
        } else {
          console.warn('[IndexRoute] No token available, falling back to regular getProducts');
        }
      }
      
      // Fallback al método normal
      getProducts(filterParams)
        .then(data => {
          setProductData(data);
          setLoading(false);
        })
        .catch(err => {
          console.error("Error loading products:", err);
          setError(err.message);
          setLoading(false);
        });
    }
  }, [query, filters, limit, showProducts, auth.user]);

  const scrollToProducts = () => {
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleSearch = (q: string) => {
    setIsSearching(true);
    setQuery(q);
    setShowProducts(true);
    
    // Scroll suave a la sección de productos después de un pequeño delay
    setTimeout(() => {
      scrollToProducts();
      setIsSearching(false);
    }, 100);
  };

  const handleCategoryClick = (categoryId: string) => {
    setIsSearching(true);
    setFilters(prev => ({ ...prev, category: categoryId }));
    setQuery("");
    setShowProducts(true);
    
    // Scroll suave a la sección de productos después de un pequeño delay
    setTimeout(() => {
      scrollToProducts();
      setIsSearching(false);
    }, 100);
  };

  const handleFiltersChange = (newFilters: FilterState) => {
    setFilters(newFilters);
    setShowProducts(true);
    
    // Scroll suave a la sección de productos
    setTimeout(() => {
      scrollToProducts();
    }, 100);
  };



  // Manejar estado de navegación desde la página de producto
  useEffect(() => {
    if (location.state) {
      const { scrollToProducts, selectedCategory } = location.state as { 
        scrollToProducts?: boolean; 
        selectedCategory?: string; 
      };
      
      if (selectedCategory) {
        setFilters(prev => ({ ...prev, category: selectedCategory }));
        setQuery("");
        setShowProducts(true);
        
        // Scroll a productos después de un pequeño delay
        setTimeout(() => {
          if (productsSectionRef.current) {
            productsSectionRef.current.scrollIntoView({ 
              behavior: 'smooth',
              block: 'start'
            });
          }
        }, 100);
      }
    }
  }, [location.state]);


  return (
    <main className={`min-h-screen ${isDark ? 'bg-gradient-to-br from-black via-slate-900 to-slate-950' : 'bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700'}`}>

      {/* Hero Section */}
      <section className="text-white py-20">
        <div className="container mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Bienvenido a <span className="text-blue-300 shipper-animated">Shipper</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto">
            Todos tus productos en un solo lugar
          </p>
          
          {/* Search Bar */}
          <div className="max-w-4xl mx-auto">
            <SearchBar
              initialQuery={query}
              onSearch={handleSearch}
              isSearching={isSearching}
            />
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <div className="container mx-auto px-8">
          <h2 className="categories-title">
            Las categorías más buscadas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <CategoryCard
              title="Tecnología"
              description="Laptops, smartphones, accesorios y más"
              imageUrl="https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2071&q=80"
              categoryId="1"
              onClick={() => handleCategoryClick("1")}
            />
            <CategoryCard
              title="Moda"
              description="Ropa para hombre, mujer y niños"
              imageUrl="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80"
              categoryId="3"
              onClick={() => handleCategoryClick("3")}
            />
            <CategoryCard
              title="Hogar"
              description="Muebles, decoración y electrodomésticos"
              imageUrl="https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2058&q=80"
              categoryId="2"
              onClick={() => handleCategoryClick("2")}
            />
          </div>
        </div>
      </section>

      {/* Products Section */}
      {showProducts && (
        <section ref={productsSectionRef} className="products-section">
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="products-title">
                {query ? `Resultados para "${query}"` : "Nuestros Productos"}
              </h2>
              {isSearching && (
                <div className="products-loading">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Buscando productos...</span>
                </div>
              )}
            </div>

            {/* Filter Bar - Barra superior minimalista */}
            <FilterBar
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
              onToggleAdvanced={() => setShowAdvancedFilters(!showAdvancedFilters)}
            />

            {/* Advanced Filters Panel - Panel separado con espacio elegante */}
            {showAdvancedFilters && (
              <div className="mt-8">
                <AdvancedFilters
                  onFiltersChange={handleFiltersChange}
                  initialFilters={filters}
                />
              </div>
            )}

            {/* Mostrando productos - Texto informativo sin ordenamiento */}
            {productData && (
              <div className="mt-8 pt-6 pb-6 border-t border-gray-200/50 dark:border-gray-600/50">
                <div className="flex items-center gap-2">
                  <span className={`text-sm ${isDark ? 'text-white' : 'text-gray-600'}`}>
                    Mostrando {productData.products.length} producto{productData.products.length !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className={`mt-4 ${isDark ? 'text-white' : 'text-gray-600'}`}>Cargando productos...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <div className="text-red-500 text-xl mb-4">⚠️</div>
                <p className="text-red-600 text-lg">Error: {error}</p>
              </div>
            ) : productData ? (
              <>
                <ProductList
                  products={productData.products}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className={`${isDark ? 'text-white' : 'text-gray-600'} text-lg`}>No hay datos disponibles</p>
              </div>
            )}
          </div>
        </section>
      )}

    </main>
  );
}
