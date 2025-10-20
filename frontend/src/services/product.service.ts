// src/services/product.service.ts

// (Puedes mover esto a un archivo JSON si crece mucho)
const allMockProducts = [
  { id: 1, nombre: 'Laptop Pro', precio: 1500, stockDisponible: 10, imagenes: [{ url: 'https://picsum.photos/200/300', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 2, nombre: 'Mouse Gamer', precio: 80, stockDisponible: 50, imagenes: [{ url: 'https://picsum.photos/200/300', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 3, nombre: 'Teclado Mecánico', precio: 120, stockDisponible: 30, imagenes: [{ url: 'https://picsum.photos/200/300', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 4, nombre: 'Silla de Oficina', precio: 300, stockDisponible: 15, imagenes: [{ url: 'https://picsum.photos/200/300', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 5, nombre: 'Monitor 4K', precio: 450, stockDisponible: 20, imagenes: [{ url: 'https://picsum.photos/200/300', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  // ... Agrega 20 productos más para que la paginación funcione
];

interface Filter {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string; // Los query params siempre llegan como string
}

// Definimos los tipos de datos que usaremos
export interface ProductImage {
  url: string;
  esPrincipal: boolean;
}

export interface ProductCategory {
  id: number;
  nombre: string;
}

export interface Product {
  id: number;
  nombre: string;
  precio: number;
  stockDisponible: number;
  imagenes: ProductImage[];
  categorias: ProductCategory[];
}

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export function getProducts(filter: Filter): PaginatedProducts {
  const { page = 1, limit = 10, q = '', categoryId } = filter;

  // 1. Simular filtro de búsqueda (por nombre)
  let filteredProducts = allMockProducts.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase())
  );

  // 2. Simular filtro por categoría
  if (categoryId && categoryId !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.categorias.some(c => c.id === parseInt(categoryId, 10))
    );
  }

  // 3. Simular paginación
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  const productsOnPage = filteredProducts.slice(startIndex, endIndex);

  return {
    products: productsOnPage,
    currentPage: page,
    totalPages: totalPages,
  };
}

// También simulamos la obtención de categorías para el filtro
export function getCategories() {
  return [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Muebles' },
    { id: 3, nombre: 'Ropa' },
  ];
}