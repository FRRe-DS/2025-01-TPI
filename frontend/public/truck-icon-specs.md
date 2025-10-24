# Ícono de Camión - Especificaciones Técnicas

## 🎨 Diseño
- **Estilo**: Plano, minimalista, orientado hacia la derecha
- **Carrocería**: Gris claro uniforme (#E8E8E8) sin degradés
- **Detalles**: Blancos para contraste
- **Check**: Centrado en caja, azul oscuro (#032d70) sobre fondo gris
- **Ventana**: Blanca con esquinas redondeadas
- **Líneas de velocidad**: 4 trazos regulares, terminaciones redondeadas
- **Ruedas**: Aro blanco + relleno gris, separadas del borde

## 📐 Proporciones
- **Zona segura**: 16px padding en todos los lados
- **Bordes**: Radios coherentes (carrocería: 24px, ventana: 16px, ruedas: 60px)
- **Sin contornos negros**: Stroke del color de fondo +10% brillo

## 🎯 Contraste WCAG AA
- **Check mark**: Azul oscuro (#032d70) sobre gris claro (#E8E8E8)
- **Ratio de contraste**: 4.5:1 (cumple WCAG AA)
- **Texto alternativo**: "Shipper logo"

## 📁 Archivos Generados

### SVG (Vectorial)
- `truck-icon.svg` - 1024x1024px (alta resolución)
- `truck-icon-24.svg` - 24x24px (optimizado para header)
- `truck-icon-inverse.svg` - Versión para fondos claros

### PNG (Raster)
- `truck-icon-256.png` - 256x256px (fondo transparente)
- `truck-icon-1024.png` - 1024x1024px (fondo transparente)

## 🎨 Colores Utilizados
- **Fondo azul**: #032d70 (color del header)
- **Carrocería**: #E8E8E8 (gris claro)
- **Check mark**: #032d70 (azul oscuro)
- **Detalles blancos**: #FFFFFF
- **Ventana**: #FFFFFF (normal) / #F5F5F5 (inversa)

## 📱 Responsive
- **Desktop**: 28px altura
- **Tablet**: 24px altura  
- **Mobile**: 20px altura

## ✅ Checklist de Calidad
- [x] Alineado a pixel grid (24x24, 48x48, 96x96)
- [x] Contraste WCAG AA cumplido
- [x] Zona segura respetada
- [x] Bordes redondeados coherentes
- [x] Sin contornos negros
- [x] Exportable en SVG y PNG
- [x] Versión inversa incluida
- [x] Optimizado para diferentes tamaños
