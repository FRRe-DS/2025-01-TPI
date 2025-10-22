// src/routes/index.route.tsx
import { useEffect, useState } from "react";
import { getProducts, type PaginatedProducts } from "../services/product.service";
import ProductList from "../components/Product";
import { SearchBar } from "../components/Product/SearchBar";
import { Pagination } from "../components/Product/Pagination";

export default function IndexRoute() {
  const [productData, setProductData] = useState<PaginatedProducts | null>(null);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const limit = 8;

  useEffect(() => {
    console.log("Cargando productos...", { page, limit, query, category });
    setLoading(true);
    setError(null);
    
    getProducts({ page, limit, q: query, categoryId: category })
      .then(data => {
        console.log("Productos cargados:", data);
        setProductData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error loading products:", err);
        setError(err.message);
        setLoading(false);
      });
  }, [page, query, category, limit]);

  if (loading) {
    return <div className="p-8 text-center">Cargando productos...</div>;
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!productData) {
    return <div className="p-8 text-center">No hay datos</div>;
  }

  return (
    <main className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      <SearchBar
        initialQuery={query}
        initialCategory={category}
        onSearch={(q, cat) => { setQuery(q); setCategory(cat); setPage(1); }}
      />
      <ProductList products={productData.products} />
      {productData.totalPages > 1 && (
        <Pagination 
          currentPage={productData.currentPage} 
          totalPages={productData.totalPages} 
          onPageChange={setPage} 
        />
      )}
    </main>
  );
}
