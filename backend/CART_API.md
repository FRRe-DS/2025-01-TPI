# API de Carrito de Compras

## Descripción

El carrito de compras permite a los usuarios agregar productos y mantenerlos guardados en la base de datos. El carrito persiste entre sesiones, por lo que cuando un usuario se desloguea y vuelve a loguearse, su carrito se mantiene.

## Endpoints

### Base URL
- Desarrollo: `http://localhost:8081/api/cart`
- Producción: `https://api.compras.ds.frre.utn.edu.ar/api/cart`

### Autenticación

Todos los endpoints requieren autenticación con Bearer Token en el header `Authorization`. El token JWT debe contener el `sub` (userId) del usuario de Keycloak.

---

## GET /api/cart

Obtiene el carrito del usuario autenticado.

**Autenticación:** Requerida

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Ejemplo de solicitud:**
```bash
curl -X GET "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ6dlA0Z0NGTHNqbTBscW0tY3FMRXpRdEpjdDV0LWNmN0xQTkdiMi1veUtvIn0..." \
  -H "Content-Type: application/json"
```

**Ejemplo de respuesta (carrito vacío):**
```json
{
  "items": []
}
```

**Ejemplo de respuesta (carrito con productos):**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    },
    {
      "productId": 5,
      "quantity": 3
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK`: Carrito obtenido exitosamente
- `401 Unauthorized`: Token inválido o faltante
- `500 Internal Server Error`: Error interno del servidor

---

## PUT /api/cart

Actualiza el carrito del usuario autenticado. Reemplaza completamente el carrito anterior con los nuevos items.

**Autenticación:** Requerida

**Headers:**
```
Authorization: Bearer YOUR_JWT_TOKEN
Content-Type: application/json
```

**Body:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Validaciones:**
- `items` debe ser un array (puede estar vacío para vaciar el carrito)
- Cada item debe tener `productId` (number) y `quantity` (number)
- `quantity` debe ser mayor a 0
- No se permiten productos duplicados en el mismo request

**Nota:** Si envías `{items: []}`, el carrito quedará completamente vacío.

**Ejemplo de solicitud:**
```bash
curl -X PUT "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJ6dlA0Z0NGTHNqbTBscW0tY3FMRXpRdEpjdDV0LWNmN0xQTkdiMi1veUtvIn0..." \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "productId": 1,
        "quantity": 2
      },
      {
        "productId": 3,
        "quantity": 1
      }
    ]
  }'
```

**Ejemplo de respuesta:**
```json
{
  "items": [
    {
      "productId": 1,
      "quantity": 2
    },
    {
      "productId": 3,
      "quantity": 1
    }
  ]
}
```

**Códigos de respuesta:**
- `200 OK`: Carrito actualizado exitosamente
- `400 Bad Request`: Datos inválidos (cantidad <= 0, productos duplicados, estructura incorrecta)
- `401 Unauthorized`: Token inválido o faltante
- `500 Internal Server Error`: Error interno del servidor

---

## Ejemplos de Uso

### Agregar productos al carrito

```bash
# Agregar 2 unidades del producto 1 y 1 unidad del producto 3
curl -X PUT "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 2 },
      { "productId": 3, "quantity": 1 }
    ]
  }'
```

### Actualizar cantidad de un producto

```bash
# Cambiar la cantidad del producto 1 a 5 unidades
curl -X PUT "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 1, "quantity": 5 },
      { "productId": 3, "quantity": 1 }
    ]
  }'
```

### Eliminar un producto del carrito

```bash
# Eliminar el producto 1 del carrito (solo dejar el producto 3)
curl -X PUT "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      { "productId": 3, "quantity": 1 }
    ]
  }'
```

### Vaciar el carrito

```bash
# Vaciar completamente el carrito
curl -X PUT "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "items": []
  }'
```

### Obtener el carrito actual

```bash
# Obtener todos los productos en el carrito
curl -X GET "http://localhost:8081/api/cart" \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

---

## Notas Importantes

1. **Persistencia:** El carrito se guarda en la base de datos y persiste entre sesiones. Cuando un usuario se desloguea y vuelve a loguearse, su carrito se mantiene.

2. **Usuario del Token:** El `userId` se extrae automáticamente del token JWT (campo `sub`). No es necesario enviarlo en el body de la petición.

3. **Reemplazo Completo:** El endpoint PUT reemplaza completamente el carrito anterior. Si quieres agregar un producto, debes incluir todos los productos (los anteriores + el nuevo).

4. **Productos Duplicados:** No se permiten productos duplicados en el mismo request. Si envías el mismo `productId` dos veces, recibirás un error 400.

5. **Cantidad Mínima:** La cantidad debe ser mayor a 0. Si envías cantidad 0 o negativa, recibirás un error 400.

6. **Índice Único:** La base de datos tiene un índice único en `(userId, productId)`, lo que garantiza que un usuario no puede tener el mismo producto duplicado en su carrito.

---

## Estructura de la Base de Datos

### Tabla: CartItem

```sql
CREATE TABLE "CartItem" (
    "id" SERIAL PRIMARY KEY,
    "userId" TEXT NOT NULL,           -- UUID de Keycloak
    "productId" INTEGER NOT NULL,      -- ID del producto del backend de stock
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    
    UNIQUE ("userId", "productId"),    -- Evita duplicados
    INDEX ("userId")                   -- Optimiza búsquedas por usuario
);
```

---

## Swagger Documentation

La documentación completa de la API está disponible en Swagger UI:

- Desarrollo: `http://localhost:8081/api/docs`
- Buscar el tag `cart` para ver todos los endpoints relacionados con el carrito.

