// src/services/product.service.ts

// (Puedes mover esto a un archivo JSON si crece mucho)
const allMockProducts = [
  // Tecnología
  { id: 1, nombre: 'MacBook Pro 16"', precio: 2499, precioOriginal: 2799, stockDisponible: 8, imagenes: [{ url: 'https://via.placeholder.com/600x400/1f2937/ffffff?text=MacBook+Pro', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Gris Espacial', fechaCreacion: '2024-01-15', popularidad: 95, descripcion: 'Laptop profesional con chip M3 Pro', caracteristicas: ['Chip M3 Pro', '16GB RAM', '512GB SSD', 'Pantalla Retina 16"'] },
  { id: 2, nombre: 'Mouse Logitech MX Master 3', precio: 99, stockDisponible: 50, imagenes: [{ url: 'https://via.placeholder.com/600x400/374151/ffffff?text=Mouse+Logitech', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Negro', fechaCreacion: '2024-02-10', popularidad: 88, descripcion: 'Mouse ergonómico para productividad', caracteristicas: ['Sensor 4000 DPI', 'Batería 70 días', 'Conexión USB-C', 'Scroll infinito'] },
  { id: 3, nombre: 'Teclado Mecánico Razer', precio: 149, stockDisponible: 30, imagenes: [{ url: 'https://picsum.photos/200/300?random=3', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Razer', color: 'Verde', fechaCreacion: '2024-01-20', popularidad: 82, descripcion: 'Teclado gaming con switches mecánicos', caracteristicas: ['Switches Razer Green', 'RGB Chroma', 'Cable desmontable', 'Reposo de muñeca'] },
  { id: 5, nombre: 'Monitor Samsung 4K 27"', precio: 399, precioOriginal: 499, stockDisponible: 20, imagenes: [{ url: 'https://picsum.photos/200/300?random=5', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Negro', fechaCreacion: '2024-03-05', popularidad: 90, descripcion: 'Monitor 4K con tecnología HDR', caracteristicas: ['Resolución 4K', 'HDR10', 'Puerto USB-C', 'Altavoces integrados'] },
  { id: 7, nombre: 'AirPods Pro 2da Gen', precio: 249, stockDisponible: 40, imagenes: [{ url: 'https://picsum.photos/200/300?random=7', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Blanco', fechaCreacion: '2024-02-28', popularidad: 92, descripcion: 'Auriculares inalámbricos con cancelación de ruido', caracteristicas: ['Cancelación activa de ruido', 'Carga inalámbrica', 'Resistencia al agua', 'Audio espacial'] },
  { id: 8, nombre: 'Webcam Logitech C920', precio: 79, stockDisponible: 25, imagenes: [{ url: 'https://picsum.photos/200/300?random=8', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Negro', fechaCreacion: '2024-01-12', popularidad: 75, descripcion: 'Webcam HD para videoconferencias', caracteristicas: ['1080p 30fps', 'Autofocus', 'Microfono estéreo', 'Clip universal'] },
  { id: 10, nombre: 'iPad Air 5ta Gen', precio: 599, stockDisponible: 18, imagenes: [{ url: 'https://picsum.photos/200/300?random=10', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Azul', fechaCreacion: '2024-03-15', popularidad: 85, descripcion: 'Tablet con chip M1 y pantalla Liquid Retina', caracteristicas: ['Chip M1', 'Pantalla 10.9"', 'Touch ID', 'Soporte Apple Pencil'] },
  { id: 12, nombre: 'Impresora HP LaserJet', precio: 199, stockDisponible: 14, imagenes: [{ url: 'https://picsum.photos/200/300?random=12', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'HP', color: 'Blanco', fechaCreacion: '2024-02-20', popularidad: 70, descripcion: 'Impresora láser multifunción', caracteristicas: ['Impresión láser', 'Escáner', 'Copia', 'WiFi'] },
  { id: 14, nombre: 'Disco Duro WD 2TB', precio: 89, stockDisponible: 35, imagenes: [{ url: 'https://picsum.photos/200/300?random=14', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Western Digital', color: 'Negro', fechaCreacion: '2024-01-08', popularidad: 78, descripcion: 'Disco duro externo USB 3.0', caracteristicas: ['2TB capacidad', 'USB 3.0', 'Compatible Mac/PC', 'Cifrado de hardware'] },
  { id: 16, nombre: 'Router ASUS WiFi 6', precio: 179, stockDisponible: 22, imagenes: [{ url: 'https://picsum.photos/200/300?random=16', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'ASUS', color: 'Negro', fechaCreacion: '2024-03-01', popularidad: 80, descripcion: 'Router WiFi 6 con cobertura extendida', caracteristicas: ['WiFi 6', 'Velocidad hasta 5.4Gbps', '4 antenas', 'App ASUS Router'] },
  { id: 19, nombre: 'Micrófono Blue Yeti', precio: 129, stockDisponible: 28, imagenes: [{ url: 'https://picsum.photos/200/300?random=19', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Blue', color: 'Negro', fechaCreacion: '2024-02-05', popularidad: 85, descripcion: 'Micrófono USB para streaming y podcasting', caracteristicas: ['Patrón cardioide', 'USB plug-and-play', 'Control de ganancia', 'Soporte incluido'] },
  { id: 20, nombre: 'Organizador de Cables', precio: 19, stockDisponible: 80, imagenes: [{ url: 'https://picsum.photos/200/300?random=20', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Generic', color: 'Gris', fechaCreacion: '2024-01-30', popularidad: 60, descripcion: 'Organizador de cables con compartimentos', caracteristicas: ['Material silicona', 'Compartimentos múltiples', 'Fácil limpieza', 'Compatible con todos los cables'] },
  { id: 24, nombre: 'Adaptador USB-C Hub', precio: 39, stockDisponible: 90, imagenes: [{ url: 'https://picsum.photos/200/300?random=24', esPrincipal: true }], categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Anker', color: 'Gris', fechaCreacion: '2024-02-15', popularidad: 72, descripcion: 'Hub USB-C con múltiples puertos', caracteristicas: ['USB-C', 'HDMI', 'USB 3.0', 'Carga rápida'] },

  // Muebles
  { id: 4, nombre: 'Silla Ergonómica Herman Miller', precio: 899, precioOriginal: 1099, stockDisponible: 15, imagenes: [{ url: 'https://picsum.photos/200/300?random=4', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Herman Miller', color: 'Negro', fechaCreacion: '2024-01-25', popularidad: 88, descripcion: 'Silla ergonómica de oficina premium', caracteristicas: ['Ajuste lumbar', 'Reposabrazos ajustables', 'Material mesh', 'Garantía 12 años'] },
  { id: 6, nombre: 'Escritorio IKEA Bekant', precio: 199, stockDisponible: 8, imagenes: [{ url: 'https://picsum.photos/200/300?random=6', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-12', popularidad: 75, descripcion: 'Escritorio moderno con cajones', caracteristicas: ['160x80cm', '2 cajones', 'Fácil montaje', 'Material MDF'] },
  { id: 9, nombre: 'Lámpara LED de Escritorio', precio: 45, stockDisponible: 60, imagenes: [{ url: 'https://picsum.photos/200/300?random=9', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Philips', color: 'Blanco', fechaCreacion: '2024-01-18', popularidad: 68, descripcion: 'Lámpara LED ajustable para escritorio', caracteristicas: ['LED regulable', 'Brazo flexible', 'USB de carga', 'Temperatura de color ajustable'] },
  { id: 11, nombre: 'Estantería Modular IKEA', precio: 89, stockDisponible: 12, imagenes: [{ url: 'https://picsum.photos/200/300?random=11', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-08', popularidad: 70, descripcion: 'Estantería modular de 5 niveles', caracteristicas: ['Modular', 'Fácil montaje', 'Material MDF', 'Ajustable en altura'] },
  { id: 13, nombre: 'Sillón Reclinable', precio: 599, stockDisponible: 9, imagenes: [{ url: 'https://picsum.photos/200/300?random=13', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'La-Z-Boy', color: 'Marrón', fechaCreacion: '2024-03-10', popularidad: 82, descripcion: 'Sillón reclinable de cuero genuino', caracteristicas: ['Cuero genuino', 'Reclinable', 'Reposapiés', 'Mecanismo suave'] },
  { id: 17, nombre: 'Mesa de Centro Moderna', precio: 299, stockDisponible: 11, imagenes: [{ url: 'https://picsum.photos/200/300?random=17', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'West Elm', color: 'Marrón', fechaCreacion: '2024-02-25', popularidad: 76, descripcion: 'Mesa de centro de madera maciza', caracteristicas: ['Madera de roble', 'Acabado natural', 'Patas de metal', 'Diseño minimalista'] },
  { id: 22, nombre: 'Soporte para Monitor', precio: 79, stockDisponible: 32, imagenes: [{ url: 'https://picsum.photos/200/300?random=22', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'VIVO', color: 'Negro', fechaCreacion: '2024-01-22', popularidad: 74, descripcion: 'Soporte ajustable para monitor', caracteristicas: ['Altura ajustable', 'Inclinación -5° a +15°', 'Base estable', 'Fácil instalación'] },
  { id: 25, nombre: 'Reposapiés Ergonómico', precio: 49, stockDisponible: 38, imagenes: [{ url: 'https://picsum.photos/200/300?random=25', esPrincipal: true }], categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Humanscale', color: 'Negro', fechaCreacion: '2024-02-18', popularidad: 65, descripcion: 'Reposapiés ajustable para oficina', caracteristicas: ['Altura ajustable', 'Superficie antideslizante', 'Diseño ergonómico', 'Material duradero'] },

  // Ropa
  { id: 15, nombre: 'Camiseta Básica Algodón', precio: 29, stockDisponible: 100, imagenes: [{ url: 'https://picsum.photos/200/300?random=15', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Uniqlo', color: 'Blanco', fechaCreacion: '2024-01-05', popularidad: 85, descripcion: 'Camiseta básica de algodón 100%', caracteristicas: ['Algodón 100%', 'Corte clásico', 'Lavable en máquina', 'Múltiples tallas'] },
  { id: 18, nombre: 'Pantalón Jeans Levis 501', precio: 89, stockDisponible: 75, imagenes: [{ url: 'https://picsum.photos/200/300?random=18', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Levis', color: 'Azul', fechaCreacion: '2024-02-14', popularidad: 90, descripcion: 'Jeans clásicos corte recto', caracteristicas: ['Denim 100% algodón', 'Corte recto', 'Cintura media', 'Lavado vintage'] },
  { id: 21, nombre: 'Chaqueta Nike Deportiva', precio: 129, stockDisponible: 45, imagenes: [{ url: 'https://picsum.photos/200/300?random=21', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Nike', color: 'Negro', fechaCreacion: '2024-03-08', popularidad: 87, descripcion: 'Chaqueta deportiva con tecnología Dri-FIT', caracteristicas: ['Tecnología Dri-FIT', 'Corte atlético', 'Bolsillos con cremallera', 'Lavable en máquina'] },
  { id: 23, nombre: 'Zapatos Converse All Star', precio: 65, stockDisponible: 55, imagenes: [{ url: 'https://picsum.photos/200/300?random=23', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Converse', color: 'Blanco', fechaCreacion: '2024-01-28', popularidad: 92, descripcion: 'Zapatillas clásicas de lona', caracteristicas: ['Lona de algodón', 'Suela de goma', 'Corte clásico', 'Múltiples colores'] },
  { id: 26, nombre: 'Vestido Elegante Zara', precio: 79, stockDisponible: 30, imagenes: [{ url: 'https://picsum.photos/200/300?random=26', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Zara', color: 'Negro', fechaCreacion: '2024-03-12', popularidad: 83, descripcion: 'Vestido elegante para ocasiones especiales', caracteristicas: ['Tela de poliéster', 'Corte A-line', 'Largo midi', 'Lavable en máquina'] },
  { id: 27, nombre: 'Sudadera con Capucha', precio: 59, stockDisponible: 40, imagenes: [{ url: 'https://picsum.photos/200/300?random=27', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'H&M', color: 'Gris', fechaCreacion: '2024-02-22', popularidad: 78, descripcion: 'Sudadera cómoda con capucha', caracteristicas: ['Algodón 80%', 'Capucha con cordón', 'Bolsillo canguro', 'Corte relajado'] },
  { id: 28, nombre: 'Pantalón Chino', precio: 45, stockDisponible: 35, imagenes: [{ url: 'https://picsum.photos/200/300?random=28', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Gap', color: 'Beige', fechaCreacion: '2024-01-30', popularidad: 72, descripcion: 'Pantalón chino de algodón', caracteristicas: ['Algodón 98%', 'Corte clásico', 'Cintura ajustable', 'Lavable en máquina'] },
  { id: 29, nombre: 'Blusa de Seda', precio: 89, stockDisponible: 25, imagenes: [{ url: 'https://picsum.photos/200/300?random=29', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Massimo Dutti', color: 'Rosa', fechaCreacion: '2024-03-05', popularidad: 80, descripcion: 'Blusa elegante de seda', caracteristicas: ['Seda 100%', 'Corte clásico', 'Lavado en seco', 'Múltiples colores'] },
  { id: 30, nombre: 'Sneakers Adidas', precio: 95, stockDisponible: 50, imagenes: [{ url: 'https://picsum.photos/200/300?random=30', esPrincipal: true }], categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Adidas', color: 'Blanco', fechaCreacion: '2024-02-28', popularidad: 88, descripcion: 'Zapatillas deportivas clásicas', caracteristicas: ['Cuero sintético', 'Suela de goma', 'Corte clásico', 'Comfort superior'] },
];

interface Filter {
  page?: number;
  limit?: number;
  q?: string;
  categoryId?: string;
  marca?: string;
  color?: string;
  precioMin?: number;
  precioMax?: number;
  sortBy?: 'precio_asc' | 'precio_desc' | 'nombre_asc' | 'nombre_desc' | 'fecha_desc' | 'popularidad_desc';
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
  precioOriginal?: number;
  stockDisponible: number;
  imagenes: ProductImage[];
  categorias: ProductCategory[];
  marca: string;
  color: string;
  fechaCreacion: string;
  popularidad: number;
  descripcion: string;
  caracteristicas: string[];
}

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export function getProducts(filter: Filter): Promise<PaginatedProducts> {
  const { 
    page = 1, 
    limit = 10, 
    q = '', 
    categoryId, 
    marca, 
    color, 
    precioMin, 
    precioMax, 
    sortBy = 'popularidad_desc' 
  } = filter;

  // 1. Filtro de búsqueda (por nombre y descripción)
  let filteredProducts = allMockProducts.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    p.descripcion.toLowerCase().includes(q.toLowerCase())
  );

  // 2. Filtro por categoría
  if (categoryId && categoryId !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.categorias.some(c => c.id === parseInt(categoryId, 10))
    );
  }

  // 3. Filtro por marca
  if (marca && marca !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.marca.toLowerCase() === marca.toLowerCase()
    );
  }

  // 4. Filtro por color
  if (color && color !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.color.toLowerCase() === color.toLowerCase()
    );
  }

  // 5. Filtro por rango de precio
  if (precioMin !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.precio >= precioMin);
  }
  if (precioMax !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.precio <= precioMax);
  }

  // 6. Ordenamiento
  filteredProducts.sort((a, b) => {
    switch (sortBy) {
      case 'precio_asc':
        return a.precio - b.precio;
      case 'precio_desc':
        return b.precio - a.precio;
      case 'nombre_asc':
        return a.nombre.localeCompare(b.nombre);
      case 'nombre_desc':
        return b.nombre.localeCompare(a.nombre);
      case 'fecha_desc':
        return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
      case 'popularidad_desc':
      default:
        return b.popularidad - a.popularidad;
    }
  });

  // 7. Paginación
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / limit);
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;
  const productsOnPage = filteredProducts.slice(startIndex, endIndex);

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

// Obtener marcas únicas
export function getBrands() {
  const brands = [...new Set(allMockProducts.map(p => p.marca))];
  return brands.map((brand, index) => ({ id: index + 1, nombre: brand }));
}

// Obtener colores únicos
export function getColors() {
  const colors = [...new Set(allMockProducts.map(p => p.color))];
  return colors.map((color, index) => ({ id: index + 1, nombre: color }));
}

// Obtener rango de precios
export function getPriceRange() {
  const prices = allMockProducts.map(p => p.precio);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}