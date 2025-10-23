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

// (Puedes mover esto a un archivo JSON si crece mucho)
const allMockProducts = [
  // Tecnología
  { 
    id: 1, 
    nombre: 'MacBook Pro 16"', 
    precio: 2499, 
    precioOriginal: 2799, 
    stockDisponible: 8, 
    imagenes: generateProductImages(1, 'MacBook Pro', 'Electrónica'), 
    categorias: [{ id: 1, nombre: 'Electrónica' }], 
    marca: 'Apple', 
    color: 'Gris Espacial', 
    fechaCreacion: '2024-01-15', 
    popularidad: 95, 
    descripcion: 'Laptop profesional con chip M3 Pro', 
    caracteristicas: ['Chip M3 Pro', '16GB RAM', '512GB SSD', 'Pantalla Retina 16"'],
    promociones: {
      transferenciaDescuento: 20,
      cuotasSinInteres: 12,
      envioGratis: 100000
    },
    garantia: '1 año de garantía oficial',
    tiempoFabricacion: 'Disponible inmediatamente',
    politicas: {
      cambio: true,
      devolucion: true,
      personalizado: false
    }
  },
  { id: 2, nombre: 'Mouse Logitech MX Master 3', precio: 99, stockDisponible: 50, imagenes: generateProductImages(2, 'Mouse Logitech', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Logitech', color: 'Negro', fechaCreacion: '2024-02-10', popularidad: 88, descripcion: 'Mouse ergonómico para productividad', caracteristicas: ['Sensor 4000 DPI', 'Batería 70 días', 'Conexión USB-C', 'Scroll infinito'] },
  { id: 3, nombre: 'Teclado Mecánico Razer', precio: 149, stockDisponible: 30, imagenes: generateProductImages(3, 'Teclado Razer', 'Electrónica'), categorias: [{ id: 1, nombre: 'Electrónica' }], marca: 'Razer', color: 'Verde', fechaCreacion: '2024-01-20', popularidad: 82, descripcion: 'Teclado gaming con switches mecánicos', caracteristicas: ['Switches Razer Green', 'RGB Chroma', 'Cable desmontable', 'Reposo de muñeca'] },
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
  
  // Mousepad con variantes (similar a MGMGamers)
  { 
    id: 31, 
    nombre: 'Mousepad Topográfico Gaming', 
    precio: 14375, 
    precioOriginal: 17969, 
    stockDisponible: 100, 
    imagenes: [
      { url: generateProductImage(31, 'Mousepad Topográfico', 'Electrónica'), esPrincipal: true },
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
  variantes?: ProductVariant[];
  promociones?: {
    transferenciaDescuento?: number;
    cuotasSinInteres?: number;
    envioGratis?: number;
  };
  garantia?: string;
  tiempoFabricacion?: string;
  politicas?: {
    cambio: boolean;
    devolucion: boolean;
    personalizado: boolean;
  };
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
    console.log('Filtrando por categoría ID:', categoryId);
    const categoryIdNum = parseInt(categoryId, 10);
    console.log('Categoría ID numérico:', categoryIdNum);
    
    const beforeFilter = filteredProducts.length;
    filteredProducts = filteredProducts.filter(p => {
      const hasCategory = p.categorias.some(c => c.id === categoryIdNum);
      if (hasCategory) {
        console.log('Producto encontrado:', p.nombre, 'categorías:', p.categorias);
      }
      return hasCategory;
    });
    console.log(`Productos antes del filtro: ${beforeFilter}, después: ${filteredProducts.length}`);
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

// Obtener un producto específico por ID
export function getProductById(id: number): Promise<Product | null> {
  const product = allMockProducts.find(p => p.id === id);
  return Promise.resolve(product || null);
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

// Calcular precio con descuento por transferencia
export function calculateTransferPrice(originalPrice: number, discountPercent: number = 20): number {
  return Math.round(originalPrice * (1 - discountPercent / 100));
}

// Calcular precio de cuotas
export function calculateInstallmentPrice(originalPrice: number, installments: number): number {
  return Math.round(originalPrice / installments);
}