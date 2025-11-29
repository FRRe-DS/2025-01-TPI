# Endpoints del Backend de Stock

Base URL en Docker: `http://localhost:8000/stock/api`
Base URL en producción: `https://stock.ds.frre.utn.edu.ar/v1`

**Nota:** Todos los endpoints requieren autenticación con Bearer Token en el header `Authorization`, excepto `/api/categorias` y `/api/ping`.

---

## 1. Productos

### GET /api/productos
Lista productos con paginación y filtros.

**Autenticación:** Requerida (scope: `productos:read`)

**Query Parameters:**
- `page` (number, opcional, default: 1): Número de página
- `limit` (number, opcional, default: 20): Cantidad de productos por página
- `q` (string, opcional): Búsqueda de texto (busca en nombre y descripción)
- `categoriaId` (number, opcional): Filtrar por categoría

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/productos?page=1&limit=10&q=laptop&categoriaId=1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "data": [
    {
      "id": 1,
      "nombre": "Laptop Gaming RGB",
      "descripcion": "Laptop para gaming con iluminación RGB",
      "precio": "1299.99",
      "stockDisponible": 15,
      "pesoKg": "2.500",
      "dimensiones": {
        "altoCm": 3,
        "anchoCm": 25,
        "largoCm": 35
      },
      "ubicacion": {
        "city": "Buenos Aires",
        "state": "CABA",
        "street": "Av. Corrientes 1234",
        "country": "AR",
        "postal_code": "C1043AAZ"
      },
      "imagenes": [
        {
          "url": "https://example.com/laptop1.jpg",
          "esPrincipal": true
        }
      ],
      "categorias": [
        {
          "id": 1,
          "nombre": "Electrónicos",
          "descripcion": "Productos electrónicos y tecnológicos"
        }
      ]
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 33,
    "totalPages": 4,
    "previous": null,
    "next": "http://localhost:3000/api/productos?page=2&limit=10"
  }
}
```

---

### GET /api/productos/:productoId
Obtiene un producto específico por ID.

**Autenticación:** Requerida (scope: `productos:read`)

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/productos/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "nombre": "Laptop Gaming RGB",
  "descripcion": "Laptop para gaming con iluminación RGB",
  "precio": 1299.99,
  "stockDisponible": 15,
  "pesoKg": 2.5,
  "dimensiones": {
    "altoCm": 3,
    "anchoCm": 25,
    "largoCm": 35
  },
  "ubicacion": {
    "city": "Buenos Aires",
    "state": "CABA",
    "street": "Av. Corrientes 1234",
    "country": "AR",
    "postal_code": "C1043AAZ"
  },
  "imagenes": [
    {
      "url": "https://example.com/laptop1.jpg",
      "esPrincipal": true
    }
  ],
  "categorias": [
    {
      "id": 1,
      "nombre": "Electrónicos",
      "descripcion": "Productos electrónicos y tecnológicos"
    }
  ]
}
```

---

### POST /api/productos
Crea un nuevo producto.

**Autenticación:** Requerida (scope: `productos:write`)

**Body:**
```json
{
  "nombre": "Nuevo Producto",
  "descripcion": "Descripción del producto",
  "precio": 99.99,
  "stockInicial": 10,
  "pesoKg": 1.5,
  "dimensiones": {
    "altoCm": 10,
    "anchoCm": 20,
    "largoCm": 30
  },
  "ubicacion": {
    "city": "Buenos Aires",
    "state": "CABA",
    "street": "Av. Corrientes 1234",
    "country": "AR",
    "postal_code": "C1043AAZ"
  },
  "imagenes": [
    {
      "url": "https://example.com/image.jpg",
      "esPrincipal": true
    }
  ],
  "categoriaIds": [1, 2]
}
```

**Ejemplo de solicitud:**
```bash
curl -X POST "http://localhost:8000/stock/api/productos" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nuevo Producto",
    "descripcion": "Descripción del producto",
    "precio": 99.99,
    "stockInicial": 10,
    "categoriaIds": [1]
  }'
```

**Ejemplo de respuesta:**
```json
{
  "id": 34,
  "mensaje": "Producto creado exitosamente"
}
```

---

### PATCH /api/productos/:productoId
Actualiza un producto existente.

**Autenticación:** Requerida (scope: `productos:write`)

**Body (todos los campos son opcionales):**
```json
{
  "nombre": "Producto Actualizado",
  "descripcion": "Nueva descripción",
  "precio": 149.99,
  "stockInicial": 20,
  "pesoKg": 2.0,
  "dimensiones": {
    "altoCm": 15,
    "anchoCm": 25,
    "largoCm": 35
  },
  "ubicacion": {
    "city": "Buenos Aires",
    "state": "CABA",
    "street": "Av. Corrientes 1234",
    "country": "AR",
    "postal_code": "C1043AAZ"
  },
  "imagenes": [
    {
      "url": "https://example.com/new-image.jpg",
      "esPrincipal": true
    }
  ],
  "categoriaIds": [1, 3]
}
```

**Ejemplo de solicitud:**
```bash
curl -X PATCH "http://localhost:8000/stock/api/productos/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Producto Actualizado",
    "precio": 149.99
  }'
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "nombre": "Producto Actualizado",
  "descripcion": "Descripción del producto",
  "precio": 149.99,
  "stockDisponible": 20,
  "pesoKg": 2.0,
  "dimensiones": {
    "altoCm": 15,
    "anchoCm": 25,
    "largoCm": 35
  },
  "ubicacion": {
    "city": "Buenos Aires",
    "state": "CABA",
    "street": "Av. Corrientes 1234",
    "country": "AR",
    "postal_code": "C1043AAZ"
  },
  "imagenes": [
    {
      "url": "https://example.com/new-image.jpg",
      "esPrincipal": true
    }
  ],
  "categorias": [
    {
      "id": 1,
      "nombre": "Electrónicos",
      "descripcion": "Productos electrónicos y tecnológicos"
    }
  ]
}
```

---

### DELETE /api/productos/:productoId
Elimina un producto.

**Autenticación:** Requerida (scope: `productos:write`)

**Ejemplo de solicitud:**
```bash
curl -X DELETE "http://localhost:8000/stock/api/productos/1" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```
Status: 204 No Content
```

---

## 2. Categorías

### GET /api/categorias
Lista todas las categorías.

**Autenticación:** No requerida

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/categorias" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
[
  {
    "id": 1,
    "nombre": "Electrónicos",
    "descripcion": "Productos electrónicos y tecnológicos"
  },
  {
    "id": 2,
    "nombre": "Ropa",
    "descripcion": "Vestimenta y accesorios"
  },
  {
    "id": 3,
    "nombre": "Hogar",
    "descripcion": "Artículos para el hogar y decoración"
  }
]
```

---

### GET /api/categorias/:categoriaId
Obtiene una categoría específica por ID.

**Autenticación:** No requerida

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/categorias/1" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "nombre": "Electrónicos",
  "descripcion": "Productos electrónicos y tecnológicos"
}
```

---

### POST /api/categorias
Crea una nueva categoría.

**Autenticación:** No requerida

**Body:**
```json
{
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción de la categoría"
}
```

**Ejemplo de solicitud:**
```bash
curl -X POST "http://localhost:8000/stock/api/categorias" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Nueva Categoría",
    "descripcion": "Descripción de la categoría"
  }'
```

**Ejemplo de respuesta:**
```json
{
  "id": 4,
  "nombre": "Nueva Categoría",
  "descripcion": "Descripción de la categoría"
}
```

---

### PATCH /api/categorias/:categoriaId
Actualiza una categoría existente.

**Autenticación:** No requerida

**Body (todos los campos son opcionales):**
```json
{
  "nombre": "Categoría Actualizada",
  "descripcion": "Nueva descripción"
}
```

**Ejemplo de solicitud:**
```bash
curl -X PATCH "http://localhost:8000/stock/api/categorias/1" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Categoría Actualizada",
    "descripcion": "Nueva descripción"
  }'
```

**Ejemplo de respuesta:**
```json
{
  "id": 1,
  "nombre": "Categoría Actualizada",
  "descripcion": "Nueva descripción"
}
```

---

### DELETE /api/categorias/:categoriaId
Elimina una categoría.

**Autenticación:** No requerida

**Ejemplo de solicitud:**
```bash
curl -X DELETE "http://localhost:8000/stock/api/categorias/1" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```
Status: 204 No Content
```

---

## 3. Reservas

### GET /api/reservas
Lista reservas de un usuario con paginación.

**Autenticación:** No requerida

**Query Parameters:**
- `usuarioId` (number, requerido): ID del usuario
- `page` (number, opcional, default: 1): Número de página
- `limit` (number, opcional, default: 20): Cantidad de reservas por página
- `estado` (string, opcional): Filtrar por estado (`confirmado`, `pendiente`, `cancelado`)

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/reservas?usuarioId=1&page=1&limit=10&estado=pendiente" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "reservas": [
    {
      "idReserva": 1,
      "idCompra": "compra-123",
      "usuarioId": 1,
      "estado": "pendiente",
      "expiresAt": "2025-12-01T12:00:00Z",
      "fechaCreacion": "2025-11-29T10:00:00Z",
      "fechaActualizacion": "2025-11-29T10:00:00Z",
      "productos": [
        {
          "idProducto": 1,
          "nombre": "Laptop Gaming RGB",
          "cantidad": 2,
          "precioUnitario": 1299.99
        }
      ]
    }
  ],
  "currentPage": 1,
  "totalPages": 1,
  "total": 1
}
```

---

### GET /api/reservas/:idReserva
Obtiene una reserva específica por ID.

**Autenticación:** No requerida

**Query Parameters:**
- `usuarioId` (number, requerido): ID del usuario

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/reservas/1?usuarioId=1" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "idReserva": 1,
  "idCompra": "compra-123",
  "usuarioId": 1,
  "estado": "pendiente",
  "expiresAt": "2025-12-01T12:00:00Z",
  "fechaCreacion": "2025-11-29T10:00:00Z",
  "fechaActualizacion": "2025-11-29T10:00:00Z",
  "productos": [
    {
      "idProducto": 1,
      "nombre": "Laptop Gaming RGB",
      "cantidad": 2,
      "precioUnitario": 1299.99
    }
  ]
}
```

---

### POST /api/reservas
Crea una nueva reserva.

**Autenticación:** No requerida

**Body:**
```json
{
  "idCompra": "compra-123",
  "usuarioId": 1,
  "productos": [
    {
      "idProducto": 1,
      "cantidad": 2
    },
    {
      "idProducto": 2,
      "cantidad": 1
    }
  ]
}
```

**Ejemplo de solicitud:**
```bash
curl -X POST "http://localhost:8000/stock/api/reservas" \
  -H "Content-Type: application/json" \
  -d '{
    "idCompra": "compra-123",
    "usuarioId": 1,
    "productos": [
      {
        "idProducto": 1,
        "cantidad": 2
      }
    ]
  }'
```

**Ejemplo de respuesta (éxito):**
```json
{
  "idReserva": 1,
  "idCompra": "compra-123",
  "usuarioId": 1,
  "estado": "pendiente",
  "expiresAt": "2025-12-01T12:00:00Z",
  "fechaCreacion": "2025-11-29T10:00:00Z"
}
```

**Ejemplo de respuesta (error - stock insuficiente):**
```json
{
  "code": "INSUFFICIENT_STOCK",
  "message": "Stock insuficiente para el producto con ID 1"
}
```

---

### PATCH /api/reservas/:idReserva
Actualiza el estado de una reserva.

**Autenticación:** No requerida

**Body:**
```json
{
  "usuarioId": 1,
  "estado": "confirmado"
}
```

**Ejemplo de solicitud:**
```bash
curl -X PATCH "http://localhost:8000/stock/api/reservas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "usuarioId": 1,
    "estado": "confirmado"
  }'
```

**Ejemplo de respuesta:**
```json
{
  "idReserva": 1,
  "idCompra": "compra-123",
  "usuarioId": 1,
  "estado": "confirmado",
  "expiresAt": "2025-12-01T12:00:00Z",
  "fechaCreacion": "2025-11-29T10:00:00Z",
  "fechaActualizacion": "2025-11-29T11:00:00Z",
  "productos": [
    {
      "idProducto": 1,
      "nombre": "Laptop Gaming RGB",
      "cantidad": 2,
      "precioUnitario": 1299.99
    }
  ]
}
```

---

### DELETE /api/reservas/:idReserva
Cancela una reserva.

**Autenticación:** No requerida

**Body:**
```json
{
  "motivo": "Cliente canceló la compra"
}
```

**Ejemplo de solicitud:**
```bash
curl -X DELETE "http://localhost:8000/stock/api/reservas/1" \
  -H "Content-Type: application/json" \
  -d '{
    "motivo": "Cliente canceló la compra"
  }'
```

**Ejemplo de respuesta:**
```
Status: 204 No Content
```

---

## 4. Stock (Reservar/Liberar)

### POST /api/stock/reservar
Reserva stock de productos (endpoint alternativo para reservas).

**Autenticación:** No requerida

**Body:**
```json
{
  "idCompra": "compra-123",
  "usuarioId": 1,
  "productos": [
    {
      "idProducto": 1,
      "cantidad": 2
    }
  ]
}
```

**Ejemplo de solicitud:**
```bash
curl -X POST "http://localhost:8000/stock/api/stock/reservar" \
  -H "Content-Type: application/json" \
  -d '{
    "idCompra": "compra-123",
    "usuarioId": 1,
    "productos": [
      {
        "idProducto": 1,
        "cantidad": 2
      }
    ]
  }'
```

**Ejemplo de respuesta:**
```json
{
  "idReserva": 1,
  "idCompra": "compra-123",
  "usuarioId": 1,
  "estado": "pendiente",
  "expiresAt": "2025-12-01T12:00:00Z",
  "fechaCreacion": "2025-11-29T10:00:00Z"
}
```

---

### POST /api/stock/liberar
Libera stock de una reserva.

**Autenticación:** No requerida

**Body:**
```json
{
  "idReserva": 1,
  "usuarioId": 1,
  "motivo": "Reserva expirada"
}
```

**Ejemplo de solicitud:**
```bash
curl -X POST "http://localhost:8000/stock/api/stock/liberar" \
  -H "Content-Type: application/json" \
  -d '{
    "idReserva": 1,
    "usuarioId": 1,
    "motivo": "Reserva expirada"
  }'
```

**Ejemplo de respuesta:**
```json
{
  "mensaje": "Stock liberado exitosamente",
  "idReserva": 1,
  "estado": "liberado"
}
```

---

## 5. Ping (Health Check)

### GET /api/ping
Verifica que el servicio esté funcionando.

**Autenticación:** No requerida

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8000/stock/api/ping" \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta:**
```json
{
  "ok": true,
  "message": "pong",
  "timestamp": "2025-11-29T12:00:00.000Z",
  "auth": "Keycloak authentication configured ✅"
}
```

---

## Notas Importantes

1. **Autenticación:** Los endpoints de productos requieren un token JWT válido de Keycloak con los scopes apropiados:
   - `productos:read` para GET
   - `productos:write` para POST, PATCH, DELETE

2. **CORS:** Todos los endpoints incluyen headers CORS para permitir peticiones desde el frontend.

3. **Formato de fechas:** Las fechas se devuelven en formato ISO 8601 (date-time).

4. **Paginación:** Los endpoints que soportan paginación devuelven información de paginación con `previous` y `next` URLs.

5. **Errores:** Los errores se devuelven con el siguiente formato:
   ```json
   {
     "code": "ERROR_CODE",
     "message": "Mensaje de error",
     "details": "Detalles adicionales (opcional)"
   }
   ```

6. **Base URL en Docker:** Cuando se accede desde el frontend en Docker, usar `http://localhost:8000/stock/api` (a través del API Gateway).

7. **Base URL en producción:** Cuando se accede desde producción, usar `https://stock.ds.frre.utn.edu.ar/v1`.

