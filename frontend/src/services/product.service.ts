// src/services/product.service.ts

// Función para generar imágenes específicas y coherentes para cada producto
const generateProductImage = (productId: number, productName: string, category: string) => {
  // Imágenes específicas y coherentes para cada producto usando URLs más confiables
  const productImages: { [key: number]: string } = {
    // ELECTRÓNICA - Productos tecnológicos específicos
    1: 'https://picsum.photos/500/400?random=1', // MacBook Pro - Laptop
    2: 'https://picsum.photos/500/400?random=2', // Mouse Logitech - Mouse
    3: 'https://picsum.photos/500/400?random=3', // Teclado Razer - Keyboard
    5: 'https://picsum.photos/500/400?random=5', // Monitor Samsung - Monitor
    7: 'https://picsum.photos/500/400?random=7', // AirPods Pro - Headphones
    8: 'https://picsum.photos/500/400?random=8', // Webcam Logitech - Webcam
    10: 'https://picsum.photos/500/400?random=10', // iPad Air - Tablet
    12: 'https://picsum.photos/500/400?random=12', // Impresora HP - Printer
    14: 'https://picsum.photos/500/400?random=14', // Disco Duro WD - Hard Drive
    16: 'https://picsum.photos/500/400?random=16', // Router ASUS - Router
    19: 'https://picsum.photos/500/400?random=19', // Micrófono Blue Yeti - Microphone
    20: 'https://picsum.photos/500/400?random=20', // Organizador de Cables - Cable Organizer
    24: 'https://picsum.photos/500/400?random=24', // Adaptador USB-C Hub - USB Hub
    
    // MUEBLES - Muebles específicos y coherentes
    4: 'https://picsum.photos/500/400?random=4', // Silla Herman Miller - Office Chair
    6: 'https://picsum.photos/500/400?random=6', // Escritorio IKEA - Desk
    9: 'https://picsum.photos/500/400?random=9', // Lámpara LED - Desk Lamp
    11: 'https://picsum.photos/500/400?random=11', // Estantería IKEA - Bookshelf
    13: 'https://picsum.photos/500/400?random=13', // Sillón Reclinable - Recliner Chair
    17: 'https://picsum.photos/500/400?random=17', // Mesa de Centro - Coffee Table
    22: 'https://picsum.photos/500/400?random=22', // Soporte Monitor - Monitor Stand
    25: 'https://picsum.photos/500/400?random=25', // Reposapiés - Footrest
    
    // ROPA - Ropa específica y coherente
    15: 'https://picsum.photos/500/400?random=15', // Camiseta Algodón - T-shirt
    18: 'https://picsum.photos/500/400?random=18', // Jeans Levis - Jeans
    21: 'https://picsum.photos/500/400?random=21', // Chaqueta Nike - Jacket
    23: 'https://picsum.photos/500/400?random=23', // Converse All Star - Sneakers
    26: 'https://picsum.photos/500/400?random=26', // Vestido Zara - Dress
    27: 'https://picsum.photos/500/400?random=27', // Sudadera con Capucha - Hoodie
    28: 'https://picsum.photos/500/400?random=28', // Pantalón Chino - Chinos
    29: 'https://picsum.photos/500/400?random=29', // Blusa de Seda - Blouse
    30: 'https://picsum.photos/500/400?random=30'  // Sneakers Adidas - Adidas Shoes
  };
  
  // Si tenemos una imagen específica para este producto, la usamos
  if (productImages[productId]) {
    return productImages[productId];
  }
  
  // Fallback por categoría con estilo minimalista
  const categoryImages = {
    'Electrónica': 'https://picsum.photos/500/400?random=100',
    'Muebles': 'https://picsum.photos/500/400?random=200',
    'Ropa': 'https://picsum.photos/500/400?random=300'
  };
  
  return categoryImages[category] || categoryImages['Electrónica'];
};

// Función para generar múltiples imágenes para un producto
const generateProductImages = (productId: number, productName: string, category: string): Array<{url: string, esPrincipal: boolean}> => {
  const baseImages = [
    generateProductImage(productId, productName, category),
    `https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&seed=${productId+100}`,
    `https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&seed=${productId+200}`,
    `https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80&seed=${productId+300}`
  ];

  return baseImages.map((url, index) => ({
    url,
    esPrincipal: index === 0
  }));
};

// Función helper para crear productos mockados con la estructura correcta
const createMockProduct = (
  id: number,
  nombre: string,
  descripcion: string,
  precio: number,
  stockDisponible: number,
  pesoKg: number,
  dimensiones: Dimensiones,
  categoriaNombre: string
): Product => ({
  id,
  nombre,
  descripcion,
  precio,
  stockDisponible,
  pesoKg,
  dimensiones,
  ubicacion: {
    street: 'Av. Vélez Sársfield 123',
    city: 'Resistencia',
    state: 'Chaco',
    postal_code: 'H3500ABC',
    country: 'AR'
  },
  imagenes: generateProductImages(id, nombre, categoriaNombre),
  categorias: [{ id: categoriaNombre === 'Electrónica' ? 1 : categoriaNombre === 'Muebles' ? 2 : 3, nombre: categoriaNombre }]
});

// URL base de la API de Stock
const STOCK_API_BASE_URL = 'https://stock.ds.frre.utn.edu.ar/v1';

// Función helper para hacer requests HTTP con autenticación
async function apiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${STOCK_API_BASE_URL}${endpoint}`;

  const defaultOptions: RequestInit = {
    headers: {
      'Content-Type': 'application/json',
      // Aquí irían los headers de autenticación cuando estén disponibles
    },
  };

  const response = await fetch(url, { ...defaultOptions, ...options });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// Funciones mockadas temporales mientras la API no está disponible
// Productos mockados que siguen la estructura de la API de Stock
const allMockProducts: Product[] = [
  // Tecnología
  createMockProduct(1, 'MacBook Pro 16"', 'Laptop profesional con chip M3 Pro', 2499, 8, 2.1, { largoCm: 35.5, anchoCm: 24.1, altoCm: 1.6 }, 'Electrónica'),
  createMockProduct(2, 'Mouse Logitech MX Master 3', 'Mouse ergonómico para productividad', 99, 50, 0.15, { largoCm: 12.4, anchoCm: 8.4, altoCm: 5.1 }, 'Electrónica'),
  createMockProduct(3, 'Teclado Mecánico Razer', 'Teclado gaming con switches mecánicos', 149, 30, 1.2, { largoCm: 45.0, anchoCm: 15.0, altoCm: 3.5 }, 'Electrónica'),
  { id: 5, nombre: 'Monitor Samsung 4K 27"', precio: 399, precioOriginal: 499, stockDisponible: 20, imagenes: generateProductImages(5, 'Monitor Samsung', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Negro', fechaCreacion: '2024-03-05', popularidad: 90, descripcion: 'Monitor 4K con tecnología HDR', caracteristicas: ['Resolución 4K', 'HDR10', 'Puerto USB-C', 'Altavoces integrados'] },
  { id: 7, nombre: 'AirPods Pro 2da Gen', precio: 249, stockDisponible: 40, imagenes: generateProductImages(7, 'AirPods Pro', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Blanco', fechaCreacion: '2024-02-28', popularidad: 92, descripcion: 'Auriculares inalámbricos con cancelación de ruido', caracteristicas: ['Cancelación activa de ruido', 'Carga inalámbrica', 'Resistencia al agua', 'Audio espacial'] },
  { id: 8, nombre: 'Webcam Logitech C920', precio: 79, stockDisponible: 25, imagenes: generateProductImages(8, 'Webcam Logitech', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Negro', fechaCreacion: '2024-01-12', popularidad: 75, descripcion: 'Webcam HD para videoconferencias', caracteristicas: ['1080p 30fps', 'Autofocus', 'Microfono estéreo', 'Clip universal'] },
  { id: 10, nombre: 'iPad Air 5ta Gen', precio: 599, stockDisponible: 18, imagenes: generateProductImages(10, 'iPad Air', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Azul', fechaCreacion: '2024-03-15', popularidad: 85, descripcion: 'Tablet con chip M1 y pantalla Liquid Retina', caracteristicas: ['Chip M1', 'Pantalla 10.9"', 'Touch ID', 'Soporte Apple Pencil'] },
  { id: 12, nombre: 'Impresora HP LaserJet', precio: 199, stockDisponible: 14, imagenes: generateProductImages(12, 'Impresora HP', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'HP', color: 'Blanco', fechaCreacion: '2024-02-20', popularidad: 70, descripcion: 'Impresora láser multifunción', caracteristicas: ['Impresión láser', 'Escáner', 'Copia', 'WiFi'] },
  { id: 14, nombre: 'Disco Duro WD 2TB', precio: 89, stockDisponible: 35, imagenes: generateProductImages(14, 'Disco Duro', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Western Digital', color: 'Negro', fechaCreacion: '2024-01-08', popularidad: 78, descripcion: 'Disco duro externo USB 3.0', caracteristicas: ['2TB capacidad', 'USB 3.0', 'Compatible Mac/PC', 'Cifrado de hardware'] },
  { id: 16, nombre: 'Router ASUS WiFi 6', precio: 179, stockDisponible: 22, imagenes: generateProductImages(16, 'Router ASUS', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'ASUS', color: 'Negro', fechaCreacion: '2024-03-01', popularidad: 80, descripcion: 'Router WiFi 6 con cobertura extendida', caracteristicas: ['WiFi 6', 'Velocidad hasta 5.4Gbps', '4 antenas', 'App ASUS Router'] },
  { id: 19, nombre: 'Micrófono Blue Yeti', precio: 129, stockDisponible: 28, imagenes: generateProductImages(19, 'Micrófono Blue', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Blue', color: 'Negro', fechaCreacion: '2024-02-05', popularidad: 85, descripcion: 'Micrófono USB para streaming y podcasting', caracteristicas: ['Patrón cardioide', 'USB plug-and-play', 'Control de ganancia', 'Soporte incluido'] },
  { id: 20, nombre: 'Organizador de Cables', precio: 19, stockDisponible: 80, imagenes: generateProductImages(20, 'Organizador Cables', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Generic', color: 'Gris', fechaCreacion: '2024-01-30', popularidad: 60, descripcion: 'Organizador de cables con compartimentos', caracteristicas: ['Material silicona', 'Compartimentos múltiples', 'Fácil limpieza', 'Compatible con todos los cables'] },
  { id: 24, nombre: 'Adaptador USB-C Hub', precio: 39, stockDisponible: 90, imagenes: generateProductImages(24, 'Adaptador USB-C', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Anker', color: 'Gris', fechaCreacion: '2024-02-15', popularidad: 72, descripcion: 'Hub USB-C con múltiples puertos', caracteristicas: ['USB-C', 'HDMI', 'USB 3.0', 'Carga rápida'] },

  // Muebles
  { id: 4, nombre: 'Silla Ergonómica Herman Miller', precio: 899, precioOriginal: 1099, stockDisponible: 15, imagenes: generateProductImages(4, 'Silla Herman Miller', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Herman Miller', color: 'Negro', fechaCreacion: '2024-01-25', popularidad: 88, descripcion: 'Silla ergonómica de oficina premium', caracteristicas: ['Ajuste lumbar', 'Reposabrazos ajustables', 'Material mesh', 'Garantía 12 años'] },
  { id: 6, nombre: 'Escritorio IKEA Bekant', precio: 199, stockDisponible: 8, imagenes: generateProductImages(6, 'Escritorio IKEA', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-12', popularidad: 75, descripcion: 'Escritorio moderno con cajones', caracteristicas: ['160x80cm', '2 cajones', 'Fácil montaje', 'Material MDF'] },
  { id: 9, nombre: 'Lámpara LED de Escritorio', precio: 45, stockDisponible: 60, imagenes: generateProductImages(9, 'Lámpara LED', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Philips', color: 'Blanco', fechaCreacion: '2024-01-18', popularidad: 68, descripcion: 'Lámpara LED ajustable para escritorio', caracteristicas: ['LED regulable', 'Brazo flexible', 'USB de carga', 'Temperatura de color ajustable'] },
  { id: 11, nombre: 'Estantería Modular IKEA', precio: 89, stockDisponible: 12, imagenes: generateProductImages(11, 'Estantería IKEA', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-08', popularidad: 70, descripcion: 'Estantería modular de 5 niveles', caracteristicas: ['Modular', 'Fácil montaje', 'Material MDF', 'Ajustable en altura'] },
  { id: 13, nombre: 'Sillón Reclinable', precio: 599, stockDisponible: 9, imagenes: generateProductImages(13, 'Sillón Reclinable', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'La-Z-Boy', color: 'Marrón', fechaCreacion: '2024-03-10', popularidad: 82, descripcion: 'Sillón reclinable de cuero genuino', caracteristicas: ['Cuero genuino', 'Reclinable', 'Reposapiés', 'Mecanismo suave'] },
  { id: 17, nombre: 'Mesa de Centro Moderna', precio: 299, stockDisponible: 11, imagenes: generateProductImages(17, 'Mesa Centro', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'West Elm', color: 'Marrón', fechaCreacion: '2024-02-25', popularidad: 76, descripcion: 'Mesa de centro de madera maciza', caracteristicas: ['Madera de roble', 'Acabado natural', 'Patas de metal', 'Diseño minimalista'] },
  { id: 22, nombre: 'Soporte para Monitor', precio: 79, stockDisponible: 32, imagenes: generateProductImages(22, 'Soporte Monitor', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'VIVO', color: 'Negro', fechaCreacion: '2024-01-22', popularidad: 74, descripcion: 'Soporte ajustable para monitor', caracteristicas: ['Altura ajustable', 'Inclinación -5° a +15°', 'Base estable', 'Fácil instalación'] },
  { id: 25, nombre: 'Reposapiés Ergonómico', precio: 49, stockDisponible: 38, imagenes: generateProductImages(25, 'Reposapiés', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Humanscale', color: 'Negro', fechaCreacion: '2024-02-18', popularidad: 65, descripcion: 'Reposapiés ajustable para oficina', caracteristicas: ['Altura ajustable', 'Superficie antideslizante', 'Diseño ergonómico', 'Material duradero'] },

  // Ropa
  { id: 15, nombre: 'Camiseta Básica Algodón', precio: 29, stockDisponible: 100, imagenes: generateProductImages(15, 'Camiseta Algodón', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Uniqlo', color: 'Blanco', fechaCreacion: '2024-01-05', popularidad: 85, descripcion: 'Camiseta básica de algodón 100%', caracteristicas: ['Algodón 100%', 'Corte clásico', 'Lavable en máquina', 'Múltiples tallas'] },
  { id: 18, nombre: 'Pantalón Jeans Levis 501', precio: 89, stockDisponible: 75, imagenes: generateProductImages(18, 'Jeans Levis', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Levis', color: 'Azul', fechaCreacion: '2024-02-14', popularidad: 90, descripcion: 'Jeans clásicos corte recto', caracteristicas: ['Denim 100% algodón', 'Corte recto', 'Cintura media', 'Lavado vintage'] },
  { id: 21, nombre: 'Chaqueta Nike Deportiva', precio: 129, stockDisponible: 45, imagenes: generateProductImages(21, 'Chaqueta Nike', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Nike', color: 'Negro', fechaCreacion: '2024-03-08', popularidad: 87, descripcion: 'Chaqueta deportiva con tecnología Dri-FIT', caracteristicas: ['Tecnología Dri-FIT', 'Corte atlético', 'Bolsillos con cremallera', 'Lavable en máquina'] },
  { id: 23, nombre: 'Zapatos Converse All Star', precio: 65, stockDisponible: 55, imagenes: generateProductImages(23, 'Converse All Star', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Converse', color: 'Blanco', fechaCreacion: '2024-01-28', popularidad: 92, descripcion: 'Zapatillas clásicas de lona', caracteristicas: ['Lona de algodón', 'Suela de goma', 'Corte clásico', 'Múltiples colores'] },
  { id: 26, nombre: 'Vestido Elegante Zara', precio: 79, stockDisponible: 30, imagenes: generateProductImages(26, 'Vestido Zara', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Zara', color: 'Negro', fechaCreacion: '2024-03-12', popularidad: 83, descripcion: 'Vestido elegante para ocasiones especiales', caracteristicas: ['Tela de poliéster', 'Corte A-line', 'Largo midi', 'Lavable en máquina'] },
  { id: 27, nombre: 'Sudadera con Capucha', precio: 59, stockDisponible: 40, imagenes: generateProductImages(27, 'Sudadera Capucha', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'H&M', color: 'Gris', fechaCreacion: '2024-02-22', popularidad: 78, descripcion: 'Sudadera cómoda con capucha', caracteristicas: ['Algodón 80%', 'Capucha con cordón', 'Bolsillo canguro', 'Corte relajado'] },
  { id: 28, nombre: 'Pantalón Chino', precio: 45, stockDisponible: 35, imagenes: generateProductImages(28, 'Pantalón Chino', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Gap', color: 'Beige', fechaCreacion: '2024-01-30', popularidad: 72, descripcion: 'Pantalón chino de algodón', caracteristicas: ['Algodón 98%', 'Corte clásico', 'Cintura ajustable', 'Lavable en máquina'] },
  { id: 29, nombre: 'Blusa de Seda', precio: 89, stockDisponible: 25, imagenes: generateProductImages(29, 'Blusa Seda', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Massimo Dutti', color: 'Rosa', fechaCreacion: '2024-03-05', popularidad: 80, descripcion: 'Blusa elegante de seda', caracteristicas: ['Seda 100%', 'Corte clásico', 'Lavado en seco', 'Múltiples colores'] },
  { id: 30, nombre: 'Sneakers Adidas', precio: 95, stockDisponible: 50, imagenes: generateProductImages(30, 'Sneakers Adidas', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Adidas', color: 'Blanco', fechaCreacion: '2024-02-28', popularidad: 88, descripcion: 'Zapatillas deportivas clásicas', caracteristicas: ['Cuero sintético', 'Suela de goma', 'Corte clásico', 'Comfort superior'] },

  // PRODUCTOS ADICIONALES - ELECTRÓNICA (20 productos)
  { id: 31, nombre: 'Smartphone Samsung Galaxy S24', precio: 899, precioOriginal: 999, stockDisponible: 25, imagenes: generateProductImages(31, 'Samsung Galaxy S24', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Negro', fechaCreacion: '2024-03-20', popularidad: 95, descripcion: 'Smartphone Android con cámara de 200MP', caracteristicas: ['Pantalla 6.2"', 'Cámara 200MP', '8GB RAM', '256GB almacenamiento'] },
  { id: 32, nombre: 'Laptop Dell XPS 13', precio: 1299, stockDisponible: 12, imagenes: generateProductImages(32, 'Dell XPS 13', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Dell', color: 'Plata', fechaCreacion: '2024-03-18', popularidad: 88, descripcion: 'Laptop ultrabook con pantalla 4K', caracteristicas: ['Pantalla 13.4" 4K', 'Intel i7', '16GB RAM', '512GB SSD'] },
  { id: 33, nombre: 'Tablet iPad Pro 12.9"', precio: 1099, stockDisponible: 15, imagenes: generateProductImages(33, 'iPad Pro 12.9', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Gris Espacial', fechaCreacion: '2024-03-15', popularidad: 92, descripcion: 'Tablet profesional con chip M2', caracteristicas: ['Pantalla 12.9"', 'Chip M2', 'Soporte Apple Pencil', 'Magic Keyboard'] },
  { id: 34, nombre: 'Auriculares Sony WH-1000XM5', precio: 399, stockDisponible: 30, imagenes: generateProductImages(34, 'Sony WH-1000XM5', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Sony', color: 'Negro', fechaCreacion: '2024-03-10', popularidad: 90, descripcion: 'Auriculares con cancelación de ruido líder', caracteristicas: ['Cancelación de ruido', '30h batería', 'Carga rápida', 'Audio de alta resolución'] },
  { id: 35, nombre: 'Smartwatch Apple Watch Series 9', precio: 399, stockDisponible: 40, imagenes: generateProductImages(35, 'Apple Watch Series 9', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Apple', color: 'Azul', fechaCreacion: '2024-03-08', popularidad: 93, descripcion: 'Smartwatch con GPS y monitor de salud', caracteristicas: ['GPS', 'Monitor ECG', 'Resistente al agua', 'Carga rápida'] },
  { id: 36, nombre: 'Consola PlayStation 5', precio: 499, stockDisponible: 8, imagenes: generateProductImages(36, 'PlayStation 5', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Sony', color: 'Blanco', fechaCreacion: '2024-03-05', popularidad: 98, descripcion: 'Consola de videojuegos de nueva generación', caracteristicas: ['4K 120fps', 'SSD ultra rápido', 'Ray tracing', 'DualSense'] },
  { id: 37, nombre: 'Monitor LG UltraWide 34"', precio: 599, stockDisponible: 18, imagenes: generateProductImages(37, 'LG UltraWide 34', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'LG', color: 'Negro', fechaCreacion: '2024-03-01', popularidad: 85, descripcion: 'Monitor ultrawide para productividad', caracteristicas: ['34" ultrawide', '1440p', 'USB-C', 'HDR10'] },
  { id: 38, nombre: 'Teclado Logitech MX Keys', precio: 99, stockDisponible: 35, imagenes: generateProductImages(38, 'Logitech MX Keys', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Gris', fechaCreacion: '2024-02-28', popularidad: 82, descripcion: 'Teclado inalámbrico para productividad', caracteristicas: ['Inalámbrico', 'Backlight', 'Multi-device', 'Carga USB-C'] },
  { id: 39, nombre: 'Mouse Gaming Razer DeathAdder V3', precio: 69, stockDisponible: 45, imagenes: generateProductImages(39, 'Razer DeathAdder V3', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Razer', color: 'Negro', fechaCreacion: '2024-02-25', popularidad: 87, descripcion: 'Mouse gaming ergonómico', caracteristicas: ['30,000 DPI', '90h batería', 'Cable Speedflex', 'Razer Focus Pro'] },
  { id: 40, nombre: 'Webcam Logitech C922 Pro', precio: 99, stockDisponible: 28, imagenes: generateProductImages(40, 'Logitech C922 Pro', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Negro', fechaCreacion: '2024-02-22', popularidad: 78, descripcion: 'Webcam HD para streaming', caracteristicas: ['1080p 60fps', 'HDR', 'Autofocus', 'Microfono estéreo'] },
  { id: 41, nombre: 'Disco SSD Samsung 1TB', precio: 129, stockDisponible: 50, imagenes: generateProductImages(41, 'Samsung SSD 1TB', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Negro', fechaCreacion: '2024-02-20', popularidad: 80, descripcion: 'SSD NVMe de alta velocidad', caracteristicas: ['1TB capacidad', 'NVMe PCIe 4.0', '7,000 MB/s', 'Garantía 5 años'] },
  { id: 42, nombre: 'Router Netgear WiFi 6E', precio: 299, stockDisponible: 15, imagenes: generateProductImages(42, 'Netgear WiFi 6E', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Netgear', color: 'Negro', fechaCreacion: '2024-02-18', popularidad: 83, descripcion: 'Router WiFi 6E de alta velocidad', caracteristicas: ['WiFi 6E', '10.8Gbps', '8 antenas', 'App Nighthawk'] },
  { id: 43, nombre: 'Altavoces JBL Charge 5', precio: 179, stockDisponible: 60, imagenes: generateProductImages(43, 'JBL Charge 5', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'JBL', color: 'Azul', fechaCreacion: '2024-02-15', popularidad: 85, descripcion: 'Altavoz Bluetooth resistente al agua', caracteristicas: ['20h batería', 'Resistente al agua', 'JBL PartyBoost', 'Carga USB-C'] },
  { id: 44, nombre: 'Cámara Canon EOS R6', precio: 2499, stockDisponible: 5, imagenes: generateProductImages(44, 'Canon EOS R6', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Canon', color: 'Negro', fechaCreacion: '2024-02-12', popularidad: 92, descripcion: 'Cámara mirrorless profesional', caracteristicas: ['20MP full frame', '4K video', 'Stabilización IBIS', 'Dual Pixel AF'] },
  { id: 45, nombre: 'Drone DJI Mini 3', precio: 759, stockDisponible: 12, imagenes: generateProductImages(45, 'DJI Mini 3', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'DJI', color: 'Gris', fechaCreacion: '2024-02-10', popularidad: 88, descripcion: 'Drone compacto para fotografía', caracteristicas: ['4K video', '38min vuelo', 'GPS', 'Obstacle sensing'] },
  { id: 46, nombre: 'Laptop Lenovo ThinkPad X1', precio: 1899, stockDisponible: 10, imagenes: generateProductImages(46, 'Lenovo ThinkPad X1', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Lenovo', color: 'Negro', fechaCreacion: '2024-02-08', popularidad: 86, descripcion: 'Laptop empresarial premium', caracteristicas: ['Pantalla 14"', 'Intel i7', '32GB RAM', '1TB SSD'] },
  { id: 47, nombre: 'Tablet Samsung Galaxy Tab S9', precio: 799, stockDisponible: 20, imagenes: generateProductImages(47, 'Samsung Galaxy Tab S9', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Gris', fechaCreacion: '2024-02-05', popularidad: 84, descripcion: 'Tablet Android con S Pen', caracteristicas: ['Pantalla 11"', 'S Pen incluido', '8GB RAM', '256GB almacenamiento'] },
  { id: 48, nombre: 'Auriculares Bose QuietComfort 45', precio: 329, stockDisponible: 25, imagenes: generateProductImages(48, 'Bose QuietComfort 45', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Bose', color: 'Negro', fechaCreacion: '2024-02-03', popularidad: 89, descripcion: 'Auriculares con cancelación de ruido', caracteristicas: ['Cancelación de ruido', '24h batería', 'Carga rápida', 'Audio espacial'] },
  { id: 49, nombre: 'Smart TV Samsung 55" 4K', precio: 699, stockDisponible: 8, imagenes: generateProductImages(49, 'Samsung TV 55 4K', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Samsung', color: 'Negro', fechaCreacion: '2024-02-01', popularidad: 91, descripcion: 'Smart TV 4K con Tizen OS', caracteristicas: ['55" 4K', 'HDR10+', 'Smart TV', 'Alexa integrado'] },
  { id: 50, nombre: 'Consola Xbox Series X', precio: 499, stockDisponible: 6, imagenes: generateProductImages(50, 'Xbox Series X', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Microsoft', color: 'Negro', fechaCreacion: '2024-01-28', popularidad: 96, descripcion: 'Consola de videojuegos más potente', caracteristicas: ['4K 120fps', 'SSD 1TB', 'Ray tracing', 'Game Pass'] },

  // PRODUCTOS ADICIONALES - MUEBLES (20 productos)
  { id: 51, nombre: 'Sofá 3 Plazas Moderno', precio: 899, stockDisponible: 12, imagenes: generateProductImages(51, 'Sofá 3 Plazas', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Gris', fechaCreacion: '2024-03-20', popularidad: 88, descripcion: 'Sofá moderno de 3 plazas', caracteristicas: ['Tela resistente', 'Cojines desmontables', 'Estructura de madera', 'Fácil montaje'] },
  { id: 52, nombre: 'Mesa de Comedor 6 Personas', precio: 599, stockDisponible: 8, imagenes: generateProductImages(52, 'Mesa Comedor 6', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'West Elm', color: 'Marrón', fechaCreacion: '2024-03-18', popularidad: 85, descripcion: 'Mesa de comedor de madera maciza', caracteristicas: ['Madera de roble', '180x90cm', '6 sillas incluidas', 'Acabado natural'] },
  { id: 53, nombre: 'Cama King Size', precio: 1299, stockDisponible: 5, imagenes: generateProductImages(53, 'Cama King Size', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Tempur', color: 'Blanco', fechaCreacion: '2024-03-15', popularidad: 90, descripcion: 'Cama king size con cabecero', caracteristicas: ['200x200cm', 'Cabecero tapizado', 'Estructura sólida', 'Colchón incluido'] },
  { id: 54, nombre: 'Armario 4 Puertas', precio: 799, stockDisponible: 10, imagenes: generateProductImages(54, 'Armario 4 Puertas', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-03-12', popularidad: 82, descripcion: 'Armario de 4 puertas con espejo', caracteristicas: ['4 puertas', 'Espejo central', 'Barras colgantes', 'Cajones inferiores'] },
  { id: 55, nombre: 'Escritorio Gaming', precio: 399, stockDisponible: 15, imagenes: generateProductImages(55, 'Escritorio Gaming', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Secretlab', color: 'Negro', fechaCreacion: '2024-03-10', popularidad: 87, descripcion: 'Escritorio ergonómico para gaming', caracteristicas: ['160x80cm', 'Altura ajustable', 'Cable management', 'RGB integrado'] },
  { id: 56, nombre: 'Sillón de Lectura', precio: 499, stockDisponible: 18, imagenes: generateProductImages(56, 'Sillón Lectura', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Eames', color: 'Marrón', fechaCreacion: '2024-03-08', popularidad: 84, descripcion: 'Sillón cómodo para lectura', caracteristicas: ['Cuero genuino', 'Reposapiés', 'Mecanismo reclinable', 'Diseño clásico'] },
  { id: 57, nombre: 'Estantería Flotante', precio: 149, stockDisponible: 25, imagenes: generateProductImages(57, 'Estantería Flotante', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-03-05', popularidad: 76, descripcion: 'Estantería flotante de 3 niveles', caracteristicas: ['3 niveles', 'Instalación oculta', 'Madera MDF', 'Soporte 25kg'] },
  { id: 58, nombre: 'Mesa de Centro Vidrio', precio: 299, stockDisponible: 12, imagenes: generateProductImages(58, 'Mesa Centro Vidrio', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'West Elm', color: 'Transparente', fechaCreacion: '2024-03-03', popularidad: 78, descripcion: 'Mesa de centro de vidrio templado', caracteristicas: ['Vidrio templado', 'Base de metal', '120x60cm', 'Fácil limpieza'] },
  { id: 59, nombre: 'Silla de Oficina Ergonómica', precio: 299, stockDisponible: 20, imagenes: generateProductImages(59, 'Silla Oficina Ergonómica', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Steelcase', color: 'Negro', fechaCreacion: '2024-03-01', popularidad: 86, descripcion: 'Silla ergonómica para oficina', caracteristicas: ['Ajuste lumbar', 'Reposabrazos', 'Altura ajustable', 'Material mesh'] },
  { id: 60, nombre: 'Cómoda 6 Cajones', precio: 449, stockDisponible: 14, imagenes: generateProductImages(60, 'Cómoda 6 Cajones', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-28', popularidad: 80, descripcion: 'Cómoda de 6 cajones para dormitorio', caracteristicas: ['6 cajones', 'Guías suaves', 'Estructura sólida', 'Fácil montaje'] },
  { id: 61, nombre: 'Mesa de Noche', precio: 99, stockDisponible: 30, imagenes: generateProductImages(61, 'Mesa de Noche', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Marrón', fechaCreacion: '2024-02-25', popularidad: 74, descripcion: 'Mesa de noche con cajón', caracteristicas: ['Cajón', 'Estante abierto', 'Madera maciza', '2 colores'] },
  { id: 62, nombre: 'Sofá Cama', precio: 699, stockDisponible: 8, imagenes: generateProductImages(62, 'Sofá Cama', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Azul', fechaCreacion: '2024-02-22', popularidad: 83, descripcion: 'Sofá que se convierte en cama', caracteristicas: ['2 plazas', 'Colchón incluido', 'Fácil transformación', 'Almacenamiento'] },
  { id: 63, nombre: 'Mesa de Estudio', precio: 199, stockDisponible: 22, imagenes: generateProductImages(63, 'Mesa de Estudio', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-20', popularidad: 77, descripcion: 'Mesa de estudio con cajones', caracteristicas: ['120x60cm', '2 cajones', 'Estante superior', 'Altura fija'] },
  { id: 64, nombre: 'Sillón de Exterior', precio: 399, stockDisponible: 16, imagenes: generateProductImages(64, 'Sillón Exterior', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Outdoor Living', color: 'Gris', fechaCreacion: '2024-02-18', popularidad: 79, descripcion: 'Sillón resistente para exterior', caracteristicas: ['Resistente al agua', 'Material sintético', 'Cojines incluidos', 'Fácil limpieza'] },
  { id: 65, nombre: 'Estantería de Esquina', precio: 179, stockDisponible: 20, imagenes: generateProductImages(65, 'Estantería Esquina', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Blanco', fechaCreacion: '2024-02-15', popularidad: 75, descripcion: 'Estantería de esquina modular', caracteristicas: ['Diseño de esquina', '5 niveles', 'Modular', 'Fácil montaje'] },
  { id: 66, nombre: 'Mesa de Juego', precio: 599, stockDisponible: 6, imagenes: generateProductImages(66, 'Mesa de Juego', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Game Master', color: 'Marrón', fechaCreacion: '2024-02-12', popularidad: 81, descripcion: 'Mesa especializada para juegos de mesa', caracteristicas: ['120x80cm', 'Bordes elevados', 'Cajones para fichas', 'Tapete incluido'] },
  { id: 67, nombre: 'Silla de Comedor', precio: 89, stockDisponible: 40, imagenes: generateProductImages(67, 'Silla Comedor', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Marrón', fechaCreacion: '2024-02-10', popularidad: 72, descripcion: 'Silla de comedor de madera', caracteristicas: ['Madera maciza', 'Asiento tapizado', '4 patas', 'Fácil limpieza'] },
  { id: 68, nombre: 'Mesa de Centro Rústica', precio: 349, stockDisponible: 10, imagenes: generateProductImages(68, 'Mesa Centro Rústica', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Rustic Living', color: 'Marrón', fechaCreacion: '2024-02-08', popularidad: 76, descripcion: 'Mesa de centro estilo rústico', caracteristicas: ['Madera reciclada', 'Acabado envejecido', 'Patas de metal', 'Diseño único'] },
  { id: 69, nombre: 'Sillón de Cuero', precio: 899, stockDisponible: 7, imagenes: generateProductImages(69, 'Sillón Cuero', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'Leather Craft', color: 'Marrón', fechaCreacion: '2024-02-05', popularidad: 88, descripcion: 'Sillón de cuero genuino', caracteristicas: ['Cuero genuino', 'Estructura sólida', 'Cojines de plumas', 'Garantía 5 años'] },
  { id: 70, nombre: 'Mesa de TV', precio: 249, stockDisponible: 18, imagenes: generateProductImages(70, 'Mesa de TV', 'Muebles'), categorias: [{ id: 2, nombre: 'Muebles' }], marca: 'IKEA', color: 'Negro', fechaCreacion: '2024-02-03', popularidad: 78, descripcion: 'Mesa de TV con estantes', caracteristicas: ['150x40cm', '2 estantes', 'Cable management', 'Altura ajustable'] },

  // PRODUCTOS ADICIONALES - ROPA (20 productos)
  { id: 71, nombre: 'Abrigo de Invierno', precio: 199, stockDisponible: 35, imagenes: generateProductImages(71, 'Abrigo Invierno', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Zara', color: 'Negro', fechaCreacion: '2024-03-20', popularidad: 85, descripcion: 'Abrigo de invierno elegante', caracteristicas: ['Lana 80%', 'Forro interior', 'Bolsillos', 'Cierre de botones'] },
  { id: 72, nombre: 'Vestido de Fiesta', precio: 149, stockDisponible: 20, imagenes: generateProductImages(72, 'Vestido Fiesta', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'H&M', color: 'Rojo', fechaCreacion: '2024-03-18', popularidad: 82, descripcion: 'Vestido elegante para ocasiones especiales', caracteristicas: ['Seda sintética', 'Corte A-line', 'Largo midi', 'Lavado en seco'] },
  { id: 73, nombre: 'Pantalón de Vestir', precio: 79, stockDisponible: 45, imagenes: generateProductImages(73, 'Pantalón Vestir', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Massimo Dutti', color: 'Azul Marino', fechaCreacion: '2024-03-15', popularidad: 78, descripcion: 'Pantalón de vestir clásico', caracteristicas: ['Lana 70%', 'Corte clásico', 'Pliegue frontal', 'Lavado en seco'] },
  { id: 74, nombre: 'Camisa de Lino', precio: 59, stockDisponible: 50, imagenes: generateProductImages(74, 'Camisa Lino', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Uniqlo', color: 'Blanco', fechaCreacion: '2024-03-12', popularidad: 80, descripcion: 'Camisa de lino para verano', caracteristicas: ['Lino 100%', 'Corte relajado', 'Collar clásico', 'Lavable en máquina'] },
  { id: 75, nombre: 'Falda Midi', precio: 45, stockDisponible: 30, imagenes: generateProductImages(75, 'Falda Midi', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Zara', color: 'Negro', fechaCreacion: '2024-03-10', popularidad: 76, descripcion: 'Falda midi versátil', caracteristicas: ['Poliéster 95%', 'Corte A-line', 'Cintura alta', 'Lavable en máquina'] },
  { id: 76, nombre: 'Chaqueta de Cuero', precio: 299, stockDisponible: 15, imagenes: generateProductImages(76, 'Chaqueta Cuero', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'AllSaints', color: 'Negro', fechaCreacion: '2024-03-08', popularidad: 90, descripcion: 'Chaqueta de cuero genuino', caracteristicas: ['Cuero genuino', 'Corte clásico', 'Cremallera frontal', 'Bolsillos laterales'] },
  { id: 77, nombre: 'Top de Seda', precio: 89, stockDisponible: 25, imagenes: generateProductImages(77, 'Top Seda', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'COS', color: 'Rosa', fechaCreacion: '2024-03-05', popularidad: 84, descripcion: 'Top elegante de seda', caracteristicas: ['Seda 100%', 'Corte clásico', 'Mangas cortas', 'Lavado en seco'] },
  { id: 78, nombre: 'Pantalón Cargo', precio: 69, stockDisponible: 40, imagenes: generateProductImages(78, 'Pantalón Cargo', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Nike', color: 'Verde', fechaCreacion: '2024-03-03', popularidad: 77, descripcion: 'Pantalón cargo deportivo', caracteristicas: ['Algodón 65%', 'Bolsillos múltiples', 'Corte relajado', 'Cintura elástica'] },
  { id: 79, nombre: 'Vestido de Verano', precio: 39, stockDisponible: 60, imagenes: generateProductImages(79, 'Vestido Verano', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'H&M', color: 'Floral', fechaCreacion: '2024-03-01', popularidad: 81, descripcion: 'Vestido ligero para verano', caracteristicas: ['Algodón 100%', 'Estampado floral', 'Corte A-line', 'Lavable en máquina'] },
  { id: 80, nombre: 'Sweater de Lana', precio: 89, stockDisponible: 35, imagenes: generateProductImages(80, 'Sweater Lana', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Uniqlo', color: 'Gris', fechaCreacion: '2024-02-28', popularidad: 83, descripcion: 'Sweater de lana merino', caracteristicas: ['Lana merino', 'Corte clásico', 'Mangas largas', 'Lavable en máquina'] },
  { id: 81, nombre: 'Shorts de Denim', precio: 49, stockDisponible: 55, imagenes: generateProductImages(81, 'Shorts Denim', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Levis', color: 'Azul', fechaCreacion: '2024-02-25', popularidad: 79, descripcion: 'Shorts de denim clásicos', caracteristicas: ['Denim 100%', 'Corte clásico', 'Cintura media', 'Lavable en máquina'] },
  { id: 82, nombre: 'Blazer de Oficina', precio: 129, stockDisponible: 28, imagenes: generateProductImages(82, 'Blazer Oficina', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Massimo Dutti', color: 'Azul Marino', fechaCreacion: '2024-02-22', popularidad: 86, descripcion: 'Blazer elegante para oficina', caracteristicas: ['Lana 70%', 'Corte clásico', 'Bolsillos', 'Lavado en seco'] },
  { id: 83, nombre: 'Polo de Algodón', precio: 35, stockDisponible: 70, imagenes: generateProductImages(83, 'Polo Algodón', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Ralph Lauren', color: 'Blanco', fechaCreacion: '2024-02-20', popularidad: 88, descripcion: 'Polo clásico de algodón', caracteristicas: ['Algodón 100%', 'Corte clásico', 'Cuello polo', 'Lavable en máquina'] },
  { id: 84, nombre: 'Falda Lápiz', precio: 59, stockDisponible: 32, imagenes: generateProductImages(84, 'Falda Lápiz', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Zara', color: 'Negro', fechaCreacion: '2024-02-18', popularidad: 82, descripcion: 'Falda lápiz elegante', caracteristicas: ['Poliéster 95%', 'Corte lápiz', 'Cintura alta', 'Lavable en máquina'] },
  { id: 85, nombre: 'Chaqueta Bomber', precio: 79, stockDisponible: 38, imagenes: generateProductImages(85, 'Chaqueta Bomber', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Nike', color: 'Negro', fechaCreacion: '2024-02-15', popularidad: 80, descripcion: 'Chaqueta bomber deportiva', caracteristicas: ['Nylon 100%', 'Corte bomber', 'Cremallera frontal', 'Bolsillos laterales'] },
  { id: 86, nombre: 'Vestido de Noche', precio: 199, stockDisponible: 12, imagenes: generateProductImages(86, 'Vestido Noche', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Reformation', color: 'Negro', fechaCreacion: '2024-02-12', popularidad: 87, descripcion: 'Vestido de noche elegante', caracteristicas: ['Seda 100%', 'Corte clásico', 'Largo largo', 'Lavado en seco'] },
  { id: 87, nombre: 'Pantalón de Yoga', precio: 69, stockDisponible: 65, imagenes: generateProductImages(87, 'Pantalón Yoga', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Lululemon', color: 'Negro', fechaCreacion: '2024-02-10', popularidad: 85, descripcion: 'Pantalón de yoga de alta calidad', caracteristicas: ['Lycra 20%', 'Corte alto', 'Cintura elástica', 'Lavable en máquina'] },
  { id: 88, nombre: 'Camisa de Vestir', precio: 89, stockDisponible: 42, imagenes: generateProductImages(88, 'Camisa Vestir', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Hugo Boss', color: 'Blanco', fechaCreacion: '2024-02-08', popularidad: 84, descripcion: 'Camisa de vestir clásica', caracteristicas: ['Algodón 100%', 'Corte clásico', 'Collar clásico', 'Lavado en seco'] },
  { id: 89, nombre: 'Sudadera Oversized', precio: 79, stockDisponible: 48, imagenes: generateProductImages(89, 'Sudadera Oversized', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'Champion', color: 'Gris', fechaCreacion: '2024-02-05', popularidad: 81, descripcion: 'Sudadera oversized cómoda', caracteristicas: ['Algodón 80%', 'Corte oversized', 'Capucha', 'Lavable en máquina'] },
  { id: 90, nombre: 'Pantalón de Lino', precio: 89, stockDisponible: 33, imagenes: generateProductImages(90, 'Pantalón Lino', 'Ropa'), categorias: [{ id: 3, nombre: 'Ropa' }], marca: 'COS', color: 'Beige', fechaCreacion: '2024-02-03', popularidad: 78, descripcion: 'Pantalón de lino para verano', caracteristicas: ['Lino 100%', 'Corte clásico', 'Cintura alta', 'Lavable en máquina'] },
  
  // Mousepad con variantes (similar a MGMGamers)
  { 
    id: 91, 
    nombre: 'Mousepad Topográfico Gaming', 
    precio: 14375, 
    precioOriginal: 17969, 
    stockDisponible: 100, 
    imagenes: [
      { url: generateProductImage(91, 'Mousepad Topográfico', 'Electrónica'), esPrincipal: true },
      { url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', esPrincipal: false },
      { url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', esPrincipal: false },
      { url: 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80', esPrincipal: false }
    ], 
    categorias: [{ id: 1, nombre: 'Electrónica' }], 
    marca: 'GamingPro', 
    color: 'Negro', 
    fechaCreacion: '2024-03-20', 
    popularidad: 92, 
    descripcion: 'Mousepad gaming de alta calidad con diseño topográfico', 
    caracteristicas: ['Superficie híbrida', 'Base antideslizante', 'Impresión sublimada', 'Resistente al desgaste'],
    variantes: [
      { color: 'Negro', size: '50x40cm', material: 'Classic', precio: 14375, precioOriginal: 17969, stockDisponible: 50, sku: 'MP-TOPO-NEGRO-50-CLASSIC' },
      { color: 'Negro', size: '90x40cm', material: 'Classic', precio: 18900, precioOriginal: 23625, stockDisponible: 30, sku: 'MP-TOPO-NEGRO-90-CLASSIC' },
      { color: 'Blanco', size: '50x40cm', material: 'Classic', precio: 14375, precioOriginal: 17969, stockDisponible: 40, sku: 'MP-TOPO-BLANCO-50-CLASSIC' },
      { color: 'Blanco', size: '90x40cm', material: 'Classic', precio: 18900, precioOriginal: 23625, stockDisponible: 25, sku: 'MP-TOPO-BLANCO-90-CLASSIC' },
      { color: 'Negro', size: '50x40cm', material: 'PRO', precio: 16875, precioOriginal: 21094, stockDisponible: 35, sku: 'MP-TOPO-NEGRO-50-PRO' },
      { color: 'Negro', size: '90x40cm', material: 'PRO', precio: 22050, precioOriginal: 27563, stockDisponible: 20, sku: 'MP-TOPO-NEGRO-90-PRO' },
      { color: 'Blanco', size: '50x40cm', material: 'PRO', precio: 16875, precioOriginal: 21094, stockDisponible: 30, sku: 'MP-TOPO-BLANCO-50-PRO' },
      { color: 'Blanco', size: '90x40cm', material: 'PRO', precio: 22050, precioOriginal: 27563, stockDisponible: 15, sku: 'MP-TOPO-BLANCO-90-PRO' }
    ],
    promociones: {
      transferenciaDescuento: 20,
      cuotasSinInteres: 6,
      envioGratis: 50000
    },
    garantia: '1 año de garantía',
    tiempoFabricacion: '5-7 días hábiles',
    politicas: {
      cambio: false,
      devolucion: false,
      personalizado: true
    }
  },
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

export interface Product {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  stockDisponible: number;
  pesoKg?: number;
  dimensiones?: Dimensiones;
  ubicacion?: UbicacionAlmacen;
  imagenes: ProductImage[];
  categorias?: ProductCategory[];
}

// Interfaces para Reservas
export interface ReservaInput {
  idCompra: string;
  usuarioId: number;
  productos: Array<{
    idProducto: number;
    cantidad: number;
  }>;
}

export interface ReservaOutput {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  expiresAt: string;
  fechaCreacion: string;
}

export interface ReservaCompleta {
  idReserva: number;
  idCompra: string;
  usuarioId: number;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
  expiresAt: string;
  fechaCreacion: string;
  fechaActualizacion: string;
  productos: Array<{
    idProducto: number;
    nombre: string;
    cantidad: number;
    precioUnitario: number;
  }>;
}

export interface ActualizarReservaInput {
  usuarioId: number;
  estado: 'confirmado' | 'pendiente' | 'cancelado';
}

export interface CancelacionReservaInput {
  motivo: string;
}

// Interfaces para Categorías
export interface Categoria {
  id: number;
  nombre: string;
  descripcion?: string;
}

export interface CategoriaInput {
  nombre: string;
  descripcion?: string;
}

export interface PaginatedProducts {
  products: Product[];
  currentPage: number;
  totalPages: number;
}

export async function getProducts(filter: Filter): Promise<PaginatedProducts> {
  try {
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

    // Construir parámetros de query
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (q) params.append('q', q);
    if (categoryId && categoryId !== 'all') params.append('categoriaId', categoryId);

    // Intentar llamada a la API real
    try {
      const data = await apiRequest<{ products: Product[], currentPage: number, totalPages: number }>(`/productos?${params}`);
      return data;
    } catch (apiError) {
      console.warn('API not available, using mock data:', apiError);
      // Fallback a datos mockados si la API no está disponible
      return getProductsMock(filter);
    }
  } catch (error) {
    console.error('Error fetching products:', error);
    // Fallback a datos mockados en caso de error
    return getProductsMock(filter);
  }
}

// Función mockada como fallback
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

  // 1. Filtro de búsqueda (por nombre y descripción)
  let filteredProducts = allMockProducts.filter(p =>
    p.nombre.toLowerCase().includes(q.toLowerCase()) ||
    (p.descripcion && p.descripcion.toLowerCase().includes(q.toLowerCase()))
  );

  // 2. Filtro por categoría
  if (categoryId && categoryId !== 'all') {
    const categoryIdNum = parseInt(categoryId, 10);

    filteredProducts = filteredProducts.filter(p => {
      return p.categorias && p.categorias.some(c => c.id === categoryIdNum);
    });
  }

  // 3. Filtro por marca
  if (marca && marca !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.marca && p.marca.toLowerCase() === marca.toLowerCase()
    );
  }

  // 4. Filtro por color
  if (color && color !== 'all') {
    filteredProducts = filteredProducts.filter(p =>
      p.color && p.color.toLowerCase() === color.toLowerCase()
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
  const sortKey = sortBy || 'popularidad_desc';
  filteredProducts.sort((a, b) => {
    switch (sortKey) {
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

// Obtener categorías (ahora usa la API real con fallback a mock)
export async function getCategories(): Promise<Categoria[]> {
  return listarCategorias();
}

// Obtener marcas únicas de los productos disponibles
export function getBrands() {
  const brands = new Set<string>();

  // Extraer marcas de los productos mockados
  allMockProducts.forEach(product => {
    if (product.marca) {
      brands.add(product.marca);
    }
  });

  // Convertir a array y ordenar alfabéticamente
  return Array.from(brands).sort().map(brand => ({
    nombre: brand
  }));
}

// Obtener colores únicos de los productos disponibles
export function getColors() {
  const colors = new Set<string>();

  // Extraer colores de los productos mockados
  allMockProducts.forEach(product => {
    if (product.color) {
      colors.add(product.color);
    }
  });

  // Convertir a array y ordenar alfabéticamente
  return Array.from(colors).sort().map(color => ({
    nombre: color
  }));
}

// Obtener rango de precios
export function getPriceRange() {
  const prices = allMockProducts.map(p => p.precio);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  };
}

// Obtener un producto específico por ID
export async function getProductById(id: number): Promise<Product | null> {
  try {
    // Intentar llamada a la API real
    const product = await apiRequest<Product>(`/productos/${id}`);
    return product;
  } catch (apiError) {
    console.warn('API not available for product details, using mock data:', apiError);
    // Fallback a datos mockados si la API no está disponible
    const product = allMockProducts.find(p => p.id === id);
    return Promise.resolve(product || null);
  }
}

// Obtener variante específica de un producto
export function getProductVariant(productId: number, color: string, size: string, material: string): ProductVariant | null {
  const product = allMockProducts.find(p => p.id === productId);
  if (!product || !product.variantes) return null;
  
  return product.variantes.find(v => 
    v.color === color && 
    v.size === size && 
    v.material === material
  ) || null;
}

// Obtener productos relacionados
export function getRelatedProducts(productId: number, limit: number = 4): Promise<Product[]> {
  const product = allMockProducts.find(p => p.id === productId);
  if (!product) return Promise.resolve([]);
  
  // Buscar productos de la misma categoría o marca
  const related = allMockProducts
    .filter(p => 
      p.id !== productId && 
      (p.categorias.some(c => product.categorias.some(pc => pc.id === c.id)) || 
       p.marca === product.marca)
    )
    .sort((a, b) => b.popularidad - a.popularidad)
    .slice(0, limit);
  
  return Promise.resolve(related);
}

// ==================== FUNCIONES DE RESERVAS ====================

export async function crearReserva(reservaInput: ReservaInput): Promise<ReservaOutput> {
  try {
    return await apiRequest<ReservaOutput>('/reservas', {
      method: 'POST',
      body: JSON.stringify(reservaInput),
    });
  } catch (error) {
    console.error('Error creating reservation:', error);
    throw error;
  }
}

export async function listarReservas(usuarioId: number, params?: {
  page?: number;
  limit?: number;
  estado?: 'confirmado' | 'pendiente' | 'cancelado';
}): Promise<{ reservas: ReservaCompleta[], currentPage: number, totalPages: number }> {
  try {
    const queryParams = new URLSearchParams({
      usuarioId: usuarioId.toString(),
      ...(params?.page && { page: params.page.toString() }),
      ...(params?.limit && { limit: params.limit.toString() }),
      ...(params?.estado && { estado: params.estado }),
    });

    return await apiRequest<{ reservas: ReservaCompleta[], currentPage: number, totalPages: number }>(`/reservas?${queryParams}`);
  } catch (error) {
    console.error('Error listing reservations:', error);
    throw error;
  }
}

export async function obtenerReservaPorId(idReserva: number, usuarioId: number): Promise<ReservaCompleta> {
  try {
    const queryParams = new URLSearchParams({
      usuarioId: usuarioId.toString(),
    });

    return await apiRequest<ReservaCompleta>(`/reservas/${idReserva}?${queryParams}`);
  } catch (error) {
    console.error('Error getting reservation:', error);
    throw error;
  }
}

export async function actualizarEstadoReserva(idReserva: number, input: ActualizarReservaInput): Promise<ReservaCompleta> {
  try {
    return await apiRequest<ReservaCompleta>(`/reservas/${idReserva}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error('Error updating reservation:', error);
    throw error;
  }
}

export async function cancelarReserva(idReserva: number, input: CancelacionReservaInput): Promise<void> {
  try {
    await apiRequest(`/reservas/${idReserva}`, {
      method: 'DELETE',
      body: JSON.stringify(input),
    });
  } catch (error) {
    console.error('Error canceling reservation:', error);
    throw error;
  }
}

// ==================== FUNCIONES DE CATEGORÍAS ====================

export async function listarCategorias(): Promise<Categoria[]> {
  try {
    return await apiRequest<Categoria[]>('/categorias');
  } catch (error) {
    console.error('Error listing categories:', error);
    // Fallback a categorías mockadas
    return getCategoriesMock();
  }
}

export async function crearCategoria(categoriaInput: CategoriaInput): Promise<Categoria> {
  try {
    return await apiRequest<Categoria>('/categorias', {
      method: 'POST',
      body: JSON.stringify(categoriaInput),
    });
  } catch (error) {
    console.error('Error creating category:', error);
    throw error;
  }
}

export async function obtenerCategoriaPorId(categoriaId: number): Promise<Categoria> {
  try {
    return await apiRequest<Categoria>(`/categorias/${categoriaId}`);
  } catch (error) {
    console.error('Error getting category:', error);
    throw error;
  }
}

export async function actualizarCategoria(categoriaId: number, categoriaInput: CategoriaInput): Promise<Categoria> {
  try {
    return await apiRequest<Categoria>(`/categorias/${categoriaId}`, {
      method: 'PATCH',
      body: JSON.stringify(categoriaInput),
    });
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
}

export async function eliminarCategoria(categoriaId: number): Promise<void> {
  try {
    await apiRequest(`/categorias/${categoriaId}`, {
      method: 'DELETE',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
}

// Función mockada para categorías como fallback
function getCategoriesMock(): Categoria[] {
  return [
    { id: 1, nombre: 'Electrónica', descripcion: 'Dispositivos electrónicos y accesorios' },
    { id: 2, nombre: 'Muebles', descripcion: 'Muebles y decoración del hogar' },
    { id: 3, nombre: 'Ropa', descripcion: 'Ropa y accesorios de vestir' },
  ];
}

// Calcular precio con descuento por transferencia
export function calculateTransferPrice(originalPrice: number, discountPercent: number = 20): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

// Calcular precio de cuotas
export function calculateInstallmentPrice(originalPrice: number, installments: number): number {
  return Math.round(originalPrice / installments);
}