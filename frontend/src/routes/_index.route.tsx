// src/routes/index.route.tsx
import { useEffect, useState, useRef } from "react";
import { useLocation } from "react-router";
import { getProducts, type PaginatedProducts } from "../services/product.service";
import ProductList from "../components/Product";
import { SearchBar } from "../components/Product/SearchBar";
import CategoryCard from "../components/CategoryCard";
import AdvancedFilters, { type FilterState } from "../components/AdvancedFilters";
import ProductSorting from "../components/ProductSorting";
import { FilterViewButton } from "../components/FilterViewButton";

export default function IndexRoute() {
  const location = useLocation();
  const [productData, setProductData] = useState<PaginatedProducts | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showProducts, setShowProducts] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState('popularidad_desc');
  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    marca: 'all',
    color: 'all',
    precioMin: null,
    precioMax: null
  });
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'compact'>('grid');
  const [autoView, setAutoView] = useState(true);
  const [showFilterButton, setShowFilterButton] = useState(false);
  const limit = 1000; // Mostrar todos los productos sin paginación
  
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

  // Efecto para mostrar/ocultar el botón de filtros basado en scroll
  useEffect(() => {
    const handleScroll = () => {
      if (productsSectionRef.current && showProducts) {
        const rect = productsSectionRef.current.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight * 0.3; // Mostrar cuando la sección esté 30% visible
        setShowFilterButton(isVisible);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [showProducts]);

  useEffect(() => {
    if (showProducts) {
      setLoading(true);
      setError(null);
      
      getProducts({ 
        page: 1, 
        limit, 
        q: query, 
        categoryId: filters.category !== 'all' ? filters.category : undefined,
        marca: filters.marca !== 'all' ? filters.marca : undefined,
        color: filters.color !== 'all' ? filters.color : undefined,
        precioMin: filters.precioMin || undefined,
        precioMax: filters.precioMax || undefined,
        sortBy: sortBy as any
      })
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
  }, [query, filters, sortBy, limit, showProducts]);

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

  const handleSortChange = (newSortBy: string) => {
    setSortBy(newSortBy);
    setShowProducts(true);
  };

  const handleFilterButtonClick = () => {
    // Scroll hacia arriba para mostrar los filtros
    if (productsSectionRef.current) {
      productsSectionRef.current.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleViewChange = (view: 'grid' | 'list' | 'compact') => {
    setViewMode(view);
    setAutoView(false); // Desactivar auto-vista cuando el usuario selecciona manualmente
  };

  const toggleAutoView = () => {
    const newAutoView = !autoView;
    setAutoView(newAutoView);
    
    // Si se activa auto-vista, usar vista grid por defecto
    if (newAutoView) {
      setViewMode('grid');
    }
  };

  // Efecto para actualizar automáticamente la vista cuando cambia la cantidad de productos
  useEffect(() => {
    if (autoView && productData) {
      // Siempre usar vista grid por defecto
      setViewMode('grid');
    }
  }, [productData?.products.length, autoView]);

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
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white py-20">
        <div className="container mx-auto px-8 text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Bienvenido a <span className="text-blue-200 shipper-animated">Shipper</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 mb-12 max-w-3xl mx-auto">
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
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-12">
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
        <section ref={productsSectionRef} className="py-16 bg-white">
          <div className="container mx-auto px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-800">
                {query ? `Resultados para "${query}"` : "Nuestros Productos"}
              </h2>
              {isSearching && (
                <div className="flex items-center gap-2 text-blue-600">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-sm font-medium">Buscando productos...</span>
                </div>
              )}
            </div>

            {/* Filtros Avanzados */}
            <AdvancedFilters
              onFiltersChange={handleFiltersChange}
              initialFilters={filters}
            />

            {/* Ordenamiento */}
            {productData && (
              <ProductSorting
                currentSort={sortBy}
                onSortChange={handleSortChange}
                totalProducts={productData.products.length}
              />
            )}
            
            {loading ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-900"></div>
                <p className="mt-4 text-gray-600">Cargando productos...</p>
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
                  viewMode={viewMode}
                  autoView={autoView}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg">No hay datos disponibles</p>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Filter View Button - Fixed at bottom */}
      <FilterViewButton
        onFilterClick={handleFilterButtonClick}
        onViewChange={handleViewChange}
        currentView={viewMode}
        isVisible={showFilterButton}
        autoView={autoView}
        onToggleAutoView={toggleAutoView}
      />
    </main>
  );
}
