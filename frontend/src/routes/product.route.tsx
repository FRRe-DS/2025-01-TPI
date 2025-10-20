// src/routes/product.route.tsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import ProductList from '../components/Product';
import { SearchBar } from '../components/Product/SearchBar';
import { Pagination } from '../components/Product/Pagination';
import { getProducts, type PaginatedProducts } from '../services/product.service';

export default function ProductRoute() {

  const [searchParams, setSearchParams] = useSearchParams();

  const [productData, setProductData] = useState<PaginatedProducts | null>(null);

  const page = parseInt(searchParams.get('page') || '1', 10);
  const query = searchParams.get('q') || '';
  const category = searchParams.get('categoryId') || 'all';

  useEffect(() => {
    const data = getProducts({
      page: page,
      q: query,
      categoryId: category,
      limit: 10
    });
    setProductData(data);
  }, [searchParams, page, query, category]);

  const handleSearch = (newQuery: string, newCategory: string) => {
    setSearchParams({
      q: newQuery,
      categoryId: newCategory,
      page: '1'
    });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams(prev => {
      prev.set('page', newPage.toString());
      return prev;
    });
  };

  if (!productData) {
    return <div>Cargando productos...</div>;
  }


  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Nuestros Productos</h1>
      
      <SearchBar
        initialQuery={query}
        initialCategory={category}
        onSearch={handleSearch}
      />
      
      <ProductList products={productData.products} />
      
      {productData.totalPages > 1 && (
        <Pagination
          currentPage={productData.currentPage}
          totalPages={productData.totalPages}
          onPageChange={handlePageChange}
        />
      )}
    </div>
  );
}
