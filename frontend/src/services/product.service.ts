// src/services/product.service.ts

// (Puedes mover esto a un archivo JSON si crece mucho)
const allMockProducts = [
  { id: 1, nombre: 'Laptop Pro', precio: 1500, stockDisponible: 10, imagenes: [{ url: 'https://picsum.photos/200/300?random=1', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 2, nombre: 'Mouse Gamer', precio: 80, stockDisponible: 50, imagenes: [{ url: 'https://picsum.photos/200/300?random=2', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 3, nombre: 'Teclado Mecánico', precio: 120, stockDisponible: 30, imagenes: [{ url: 'https://picsum.photos/200/300?random=3', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 4, nombre: 'Silla de Oficina', precio: 300, stockDisponible: 15, imagenes: [{ url: 'https://picsum.photos/200/300?random=4', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 5, nombre: 'Monitor 4K', precio: 450, stockDisponible: 20, imagenes: [{ url: 'https://picsum.photos/200/300?random=5', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 6, nombre: 'Escritorio de Madera', precio: 500, stockDisponible: 8, imagenes: [{ url: 'https://picsum.photos/200/300?random=6', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 7, nombre: 'Auriculares Inalámbricos', precio: 150, stockDisponible: 40, imagenes: [{ url: 'https://picsum.photos/200/300?random=7', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 8, nombre: 'Webcam HD', precio: 90, stockDisponible: 25, imagenes: [{ url: 'https://picsum.photos/200/300?random=8', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 9, nombre: 'Lámpara de Escritorio', precio: 45, stockDisponible: 60, imagenes: [{ url: 'https://picsum.photos/200/300?random=9', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 10, nombre: 'Tablet 10"', precio: 350, stockDisponible: 18, imagenes: [{ url: 'https://picsum.photos/200/300?random=10', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 11, nombre: 'Estantería Modular', precio: 220, stockDisponible: 12, imagenes: [{ url: 'https://picsum.photos/200/300?random=11', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 12, nombre: 'Impresora Multifunción', precio: 280, stockDisponible: 14, imagenes: [{ url: 'https://picsum.photos/200/300?random=12', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 13, nombre: 'Sillón Ergonómico', precio: 420, stockDisponible: 9, imagenes: [{ url: 'https://picsum.photos/200/300?random=13', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 14, nombre: 'Disco Duro Externo 2TB', precio: 110, stockDisponible: 35, imagenes: [{ url: 'https://picsum.photos/200/300?random=14', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 15, nombre: 'Camiseta Básica', precio: 25, stockDisponible: 100, imagenes: [{ url: 'https://picsum.photos/200/300?random=15', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }] },
  { id: 16, nombre: 'Router WiFi 6', precio: 180, stockDisponible: 22, imagenes: [{ url: 'https://picsum.photos/200/300?random=16', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 17, nombre: 'Mesa de Centro', precio: 190, stockDisponible: 11, imagenes: [{ url: 'https://picsum.photos/200/300?random=17', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 18, nombre: 'Pantalón Jeans', precio: 55, stockDisponible: 75, imagenes: [{ url: 'https://picsum.photos/200/300?random=18', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }] },
  { id: 19, nombre: 'Micrófono USB', precio: 95, stockDisponible: 28, imagenes: [{ url: 'https://picsum.photos/200/300?random=19', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 20, nombre: 'Organizador de Cables', precio: 15, stockDisponible: 80, imagenes: [{ url: 'https://picsum.photos/200/300?random=20', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 21, nombre: 'Chaqueta Deportiva', precio: 85, stockDisponible: 45, imagenes: [{ url: 'https://picsum.photos/200/300?random=21', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }] },
  { id: 22, nombre: 'Soporte para Monitor', precio: 65, stockDisponible: 32, imagenes: [{ url: 'https://picsum.photos/200/300?random=22', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
  { id: 23, nombre: 'Zapatos Casuales', precio: 70, stockDisponible: 55, imagenes: [{ url: 'https://picsum.photos/200/300?random=23', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }] },
  { id: 24, nombre: 'Adaptador USB-C', precio: 30, stockDisponible: 90, imagenes: [{ url: 'https://picsum.photos/200/300?random=24', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }] },
  { id: 25, nombre: 'Reposapiés', precio: 40, stockDisponible: 38, imagenes: [{ url: 'https://picsum.photos/200/300?random=25', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }] },
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

export function getProducts(filter: Filter): Promise<PaginatedProducts> {
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

  // Retornar directamente sin delay
  return Promise.resolve({
    products: productsOnPage,
    currentPage: page,
    totalPages: totalPages,
  });
}

// También simulamos la obtención de categorías para el filtro
export function getCategories() {
  return [
    { id: 1, nombre: 'Electrónica' },
    { id: 2, nombre: 'Muebles' },
    { id: 3, nombre: 'Ropa' },
  ];
}