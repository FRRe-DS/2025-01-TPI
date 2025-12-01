// src/services/product.service.ts

// ==================== TIPOS E INTERFACES ====================

export interface ProductImage {
  url: string;
  esPrincipal: boolean;
}

export interface ProductCategory {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Dimensiones {
  largoCm: number;
  anchoCm: number;
  altoCm: number;
}

export interface UbicacionAlmacen {
  street: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
}

export interface ProductVariant {
  color: string;
  size: string;
  material: string;
  precio: number;
  precioOriginal?: number;
  stockDisponible: number;
  sku: string;
}

export interface ProductPromociones {
  transferenciaDescuento?: number;
  cuotasSinInteres?: number;
  envioGratis?: number;
}

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  precioOriginal?: number;
  stockDisponible: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes: ProductImage[];
  categorias?: ProductCategory[];
  marca?: string;
  color?: string;
  fechaCreacion?: string;
  popularidad?: number;
  variantes?: ProductVariant[];
  promociones?: ProductPromociones;
  garantia?: string;
  tiempoFabricacion?: string;
  politicas?: {
    cambio?: boolean;
    devolucion?: boolean;
    personalizado?: boolean;
  };
  caracteristicas?: string[];
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface Filter {
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

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

// ==================== CONSTANTES ====================

const STOCK_DOCKER_API_URL = 'http://localhost:8000/stock/api';

// ==================== FUNCIONES HELPER ====================

/**
 * Genera una imagen placeholder basada en el ID y nombre del producto
 */
const generatePlaceholderImage = (productId: number, productName: string, index: number = 0): string => {
  const getProductKeyword = (name: string): string => {
    if (!name || name.trim() === '') return 'product';
    const firstWord = name.trim().split(/\s+/)[0].toLowerCase();
    
    const keywordMap: { [key: string]: string } = {
      'laptop': 'laptop computer',
      'notebook': 'laptop computer',
      'mouse': 'computer mouse',
      'teclado': 'keyboard',
      'monitor': 'computer monitor',
      'auriculares': 'headphones',
      'airpods': 'wireless headphones',
      'webcam': 'webcam camera',
      'tablet': 'tablet computer',
      'ipad': 'tablet computer',
      'impresora': 'printer',
      'disco': 'hard drive',
      'router': 'network router',
      'micrófono': 'microphone',
      'adaptador': 'adapter',
      'silla': 'office chair',
      'escritorio': 'desk',
      'lámpara': 'desk lamp',
      'estantería': 'bookshelf',
      'sillón': 'armchair',
      'mesa': 'table',
      'soporte': 'monitor stand',
      'reposapiés': 'footrest',
      'camiseta': 't-shirt',
      'jeans': 'jeans',
      'pantalón': 'pants',
      'chaqueta': 'jacket',
      'zapatos': 'shoes',
      'zapatillas': 'running shoes',
      'vestido': 'dress',
      'sudadera': 'hoodie',
      'blusa': 'blouse',
    };
    
    return keywordMap[firstWord] || firstWord;
  };

  const keyword = getProductKeyword(productName);
  const keywordImageMap: { [key: string]: string[] } = {
    'laptop computer': [
      'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&h=400&fit=crop',
      'https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=500&h=400&fit=crop',
    ],
    'computer mouse': [
      'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=400&fit=crop',
    ],
    'keyboard': [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&h=400&fit=crop',
    ],
    'computer monitor': [
      'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&h=400&fit=crop',
    ],
    'headphones': [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
    ],
    'office chair': [
      'https://images.unsplash.com/photo-1506439773649-6e0eb8cfb237?w=500&h=400&fit=crop',
    ],
    'desk': [
      'https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=500&h=400&fit=crop',
    ],
    'running shoes': [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=400&fit=crop',
    ],
    't-shirt': [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=400&fit=crop',
    ],
  };
  
  if (keywordImageMap[keyword] && keywordImageMap[keyword].length > 0) {
    const imageIndex = index % keywordImageMap[keyword].length;
    return keywordImageMap[keyword][imageIndex];
  }
  
  const keywordHash = keyword.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const seed = (productId * 1000 + keywordHash + index * 100) % 1000;
  return `https://picsum.photos/seed/${seed}/500/400`;
};

/**
 * Transforma un producto del backend de stock al formato esperado por el frontend
 */
function transformStockProduct(product: any): Product {
  const isExampleUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true;
    return url.includes('example.com') || 
           url.includes('placeholder') || 
           url.startsWith('http://example') ||
           url.startsWith('https://example');
  };

  return {
    id: product.id,
    nombre: product.nombre,
    descripcion: product.descripcion || undefined,
    precio: typeof product.precio === 'string' ? parseFloat(product.precio) : product.precio,
    stockDisponible: product.stockDisponible || product.stock_disponible || 0,
    pesoKg: product.pesoKg 
      ? (typeof product.pesoKg === 'string' ? parseFloat(product.pesoKg) : product.pesoKg)
      : undefined,
    dimensiones: product.dimensiones ? {
      largoCm: product.dimensiones.largoCm || product.dimensiones.largo_cm || 0,
      anchoCm: product.dimensiones.anchoCm || product.dimensiones.ancho_cm || 0,
      altoCm: product.dimensiones.altoCm || product.dimensiones.alto_cm || 0,
    } : undefined,
    ubicacion: product.ubicacion ? {
      street: product.ubicacion.street || '',
      city: product.ubicacion.city || '',
      state: product.ubicacion.state || '',
      postal_code: product.ubicacion.postal_code || '',
      country: product.ubicacion.country || '',
    } : undefined,
    imagenes: (() => {
      if (!product.imagenes || !Array.isArray(product.imagenes) || product.imagenes.length === 0) {
        return [{
          url: generatePlaceholderImage(product.id, product.nombre || 'Producto', 0),
          esPrincipal: true
        }];
      }
      
      const transformedImages = product.imagenes
        .map((img: any, index: number) => {
          const originalUrl = img?.url || '';
          
          if (isExampleUrl(originalUrl)) {
            return {
              url: generatePlaceholderImage(product.id, product.nombre || 'Producto', index),
              esPrincipal: img.esPrincipal !== undefined ? img.esPrincipal : (img.es_principal !== undefined ? img.es_principal : index === 0),
            };
          }
          
          return {
            url: originalUrl,
            esPrincipal: img.esPrincipal !== undefined ? img.esPrincipal : (img.es_principal !== undefined ? img.es_principal : index === 0),
          };
        })
        .filter((img: any) => img && img.url);
      
      if (transformedImages.length === 0) {
        return [{
          url: generatePlaceholderImage(product.id, product.nombre || 'Producto', 0),
          esPrincipal: true
        }];
      }
      
      return transformedImages;
    })(),
    categorias: product.categorias && Array.isArray(product.categorias)
      ? product.categorias.map((cat: any) => ({
          id: cat.id,
          nombre: cat.nombre || '',
          descripcion: cat.descripcion || undefined,
        }))
      : [],
  };
}

/**
 * Realiza una petición HTTP al backend de stock en Docker
 */
async function apiRequestStockDocker<T>(endpoint: string, token: string, options: RequestInit = {}): Promise<T> {
  const url = `${STOCK_DOCKER_API_URL}${endpoint}`;

  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    ...options,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${response.statusText} - ${errorText}`);
  }

  return response.json();
}

// ==================== PRODUCTOS MOCKADOS (FALLBACK) ====================

const allMockProducts: Product[] = [
  // Productos básicos para fallback
  {
    id: 1,
    nombre: 'MacBook Pro 16"',
    descripcion: 'Laptop profesional con chip M3 Pro',
    precio: 2499,
    stockDisponible: 8,
    pesoKg: 2.1,
    dimensiones: { largoCm: 35.5, anchoCm: 24.1, altoCm: 1.6 },
    ubicacion: {
      street: 'Av. Vélez Sársfield 123',
      city: 'Resistencia',
      state: 'Chaco',
      postal_code: 'H3500ABC',
      country: 'AR'
    },
    imagenes: [{ url: 'https://picsum.photos/500/400?random=1', esPrincipal: true }],
    categorias: [{ id: 1, nombre: 'Electrónica' }],
  },
];

// ==================== FUNCIONES PÚBLICAS ====================

/**
 * Obtiene productos del backend de stock en Docker
 */
export async function getProductsFromStockDocker(
  filter: Filter, 
  token: string
): Promise<PaginatedProducts> {
  try {
    const {
      page = 1,
      limit = 10,
      q = '',
      categoryId,
    } = filter;

    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (q && q.trim() !== '') {
      params.append('q', q.trim());
    }

    if (categoryId && categoryId !== 'all') {
      const categoriaIdNum = typeof categoryId === 'string' ? parseInt(categoryId, 10) : categoryId;
      if (!isNaN(categoriaIdNum)) {
        params.append('categoriaId', categoriaIdNum.toString());
      }
    }

    const response = await apiRequestStockDocker<{ 
      data: any[]; 
      pagination: { 
        page: number; 
        limit: number; 
        total: number; 
        totalPages: number;
      }; 
    }>(
      `/productos?${params}`,
      token
    );

    const transformedProducts = (response.data || []).map(transformStockProduct);

    // Aplicar filtros adicionales en el frontend que el backend no soporta
    let filteredProducts = transformedProducts;

    if (filter.precioMin !== undefined || filter.precioMax !== undefined) {
      filteredProducts = filteredProducts.filter(product => {
        if (filter.precioMin !== undefined && product.precio < filter.precioMin) {
          return false;
        }
        if (filter.precioMax !== undefined && product.precio > filter.precioMax) {
          return false;
        }
        return true;
      });
    }

    if (filter.sortBy) {
      filteredProducts.sort((a, b) => {
        switch (filter.sortBy) {
          case 'precio_asc':
            return a.precio - b.precio;
          case 'precio_desc':
            return b.precio - a.precio;
          case 'nombre_asc':
            return a.nombre.localeCompare(b.nombre);
          case 'nombre_desc':
            return b.nombre.localeCompare(a.nombre);
          default:
            return 0;
        }
      });
    }

    return {
      products: filteredProducts,
      currentPage: response.pagination?.page || page,
      totalPages: response.pagination?.totalPages || 1,
    };
  } catch (error: any) {
    console.error('[getProductsFromStockDocker] Error:', error);
    throw error;
  }
}

/**
 * Obtiene productos (fallback a mock si falla)
 */
export async function getProducts(filter: Filter): Promise<PaginatedProducts> {
  try {
    // Fallback a datos mockados
    return getProductsMock(filter);
  } catch (error) {
    console.error('Error fetching products:', error);
    return getProductsMock(filter);
  }
}

/**
 * Obtiene un producto por ID del backend de stock en Docker
 */
export async function getProductByIdFromStock(
  id: number, 
  token: string
): Promise<Product | null> {
  try {
    const response = await apiRequestStockDocker<any>(
      `/productos/${id}`,
      token
    );

    return transformStockProduct(response);
  } catch (error: any) {
    console.error(`[getProductByIdFromStock] Error fetching product ${id}:`, error);
    if (error.message?.includes('404') || error.message?.includes('Not Found')) {
      return null;
    }
    throw error;
  }
}

/**
 * Obtiene un producto por ID (fallback a mock)
 */
export async function getProductById(id: number): Promise<Product | null> {
  const product = allMockProducts.find(p => p.id === id);
  return Promise.resolve(product || null);
}

/**
 * Obtiene una variante específica de un producto
 */
export function getProductVariant(
  productId: number, 
  color: string, 
  size: string, 
  material: string
): ProductVariant | null {
  const product = allMockProducts.find(p => p.id === productId);
  if (!product || !product.variantes) return null;
  
  return product.variantes.find(v => 
    v.color === color && 
    v.size === size && 
    v.material === material
  ) || null;
}

/**
 * Obtiene productos relacionados
 */
export function getRelatedProducts(
  productId: number, 
  limit: number = 4
): Promise<Product[]> {
  const product = allMockProducts.find(p => p.id === productId);
  if (!product) return Promise.resolve([]);
  
  const related = allMockProducts
    .filter(p => 
      p.id !== productId && 
      (p.categorias?.some(c => product.categorias?.some(pc => pc.id === c.id)) || 
       p.marca === product.marca)
    )
    .sort((a, b) => (b.popularidad || 0) - (a.popularidad || 0))
    .slice(0, limit);
  
  return Promise.resolve(related);
}

/**
 * Obtiene categorías del backend de stock
 */
export async function getCategories(): Promise<Categoria[]> {
  return listarCategorias();
}

/**
 * Lista categorías del backend de stock
 */
export async function listarCategorias(): Promise<Categoria[]> {
  try {
    const url = `${STOCK_DOCKER_API_URL}/categorias`;
    
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch categories: ${response.status} ${response.statusText}`);
    }
    
    return response.json();
  } catch (error) {
    console.error('Error listing categories:', error);
    return getCategoriesMock();
  }
}

/**
 * Obtiene marcas únicas de los productos mockados
 */
export function getBrands() {
  const brands = new Set<string>();
  allMockProducts.forEach(product => {
    if (product.marca) {
      brands.add(product.marca);
    }
  });
  return Array.from(brands).sort().map(brand => ({ nombre: brand }));
}

/**
 * Obtiene colores únicos de los productos mockados
 */
export function getColors() {
  const colors = new Set<string>();
  allMockProducts.forEach(product => {
    if (product.color) {
      colors.add(product.color);
    }
  });
  return Array.from(colors).sort().map(color => ({ nombre: color }));
}

/**
 * Obtiene el rango de precios de los productos mockados
 */
export function getPriceRange() {
  const prices = allMockProducts.map(p => p.precio);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

/**
 * Calcula el precio con descuento por transferencia
 */
export function calculateTransferPrice(
  originalPrice: number, 
  discountPercent: number = 20
): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

/**
 * Calcula el precio de cuotas
 */
export function calculateInstallmentPrice(
  originalPrice: number, 
  installments: number
): number {
  return Math.round(originalPrice / installments);
}

// ==================== FUNCIONES PRIVADAS ====================

/**
 * Obtiene productos mockados con filtros aplicados
 */
function getProductsMock(filter: Filter): Promise<PaginatedProducts> {
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

  let filteredProducts = allMockProducts.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(q.toLowerCase()))
  );

  if (categoryId && categoryId !== 'all') {
    const categoryIdNum = parseInt(categoryId, 10);
    filteredProducts = filteredProducts.filter(p => {
      return p.categorias && p.categorias.some(c => c.id === categoryIdNum);
    });
  }

  if (marca && marca !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.marca && p.marca.toLowerCase() === marca.toLowerCase()
    );
  }

  if (color && color !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.color && p.color.toLowerCase() === color.toLowerCase()
    );
  }

  if (precioMin !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.precio >= precioMin);
  }
  if (precioMax !== undefined) {
    filteredProducts = filteredProducts.filter(p => p.precio <= precioMax);
  }

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
        return new Date(b.fechaCreacion || '2024-01-01').getTime() - new Date(a.fechaCreacion || '2024-01-01').getTime();
      case 'popularidad_desc':
      default:
        return (b.popularidad || 0) - (a.popularidad || 0);
    }
  });

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

/**
 * Obtiene categorías mockadas como fallback
 */
function getCategoriesMock(): Categoria[] {
  return [
    { id: 1, nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos y accesorios' },
    { id: 2, nombre: 'Muebles', descripcion: 'Muebles y decoración del hogar' },
    { id: 3, nombre: 'Ropa', descripcion: 'Ropa y accesorios de vestir' },
  ];
}
