# Endpoints API - Backend Logística

## Base URL
```
http://localhost:3010/shipping
```

## Autenticación
La mayoría de endpoints requieren un token JWT de Keycloak en el header:
```
Authorization: Bearer {JWT_TOKEN}
```

---

## 1. GET /shipping/test
**Descripción:** Endpoint de prueba (público)

**Método:** `GET`

**Path:** `/shipping/test`

**Autenticación:** ❌ Público (no requiere token)

**Response:**
```json
{
  "message": "Hello World"
}
```

---

## 2. GET /shipping/transport-methods
**Descripción:** Obtiene los métodos de transporte disponibles

**Método:** `GET`

**Path:** `/shipping/transport-methods`

**Autenticación:** ❌ Público (no requiere token)

**Response:**
```json
{
  "transportMethods": [
    {
      "type": "air",
      "name": "Aéreo",
      "estimatedDays": "2-5 días"
    },
    {
      "type": "sea",
      "name": "Marítimo",
      "estimatedDays": "15-30 días"
    },
    {
      "type": "road",
      "name": "Terrestre",
      "estimatedDays": "3-7 días"
    },
    {
      "type": "rail",
      "name": "Ferroviario",
      "estimatedDays": "7-14 días"
    }
  ]
}
```

**Valores posibles para `type`:**
- `air` - Aéreo
- `sea` - Marítimo
- `road` - Terrestre
- `rail` - Ferroviario

---

## 3. POST /shipping/cost
**Descripción:** Calcula el costo de envío sin crear el envío

**Método:** `POST`

**Path:** `/shipping/cost`

**Autenticación:** ✅ Requiere scope `envios:write`

**Request Body:**
```json
{
  "delivery_address": {
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "postal_code": "A1234ABC",
    "country": "Argentina"
  },
  "products": [
    {
      "id": 1,
      "quantity": 2
    },
    {
      "id": 5,
      "quantity": 1
    }
  ]
}
```

**Validaciones:**
- `delivery_address.postal_code` debe seguir el formato: `A1234ABC` (1 letra, 4 dígitos, 3 letras)
- `products` debe ser un array no vacío
- Cada producto debe tener `id` (entero >= 1) y `quantity` (entero >= 1)

**Response:**
```json
{
  "currency": "ARS",
  "total_cost": 1500.00,
  "transport_type": "road",
  "products": [
    {
      "id": 1,
      "cost": 1000.00
    },
    {
      "id": 5,
      "cost": 500.00
    }
  ]
}
```

**Nota:** Este endpoint extrae el token del header `Authorization` para validar disponibilidad de productos con el servicio de Stock.

---

## 4. POST /shipping
**Descripción:** Crea un nuevo envío

**Método:** `POST`

**Path:** `/shipping`

**Autenticación:** ✅ Requiere scope `envios:write`

**Request Body:**
```json
{
  "user_id": 123,
  "order_id": 456,
  "delivery_address": {
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "postal_code": "A1234ABC",
    "country": "Argentina"
  },
  "transport_type": "road",
  "products": [
    {
      "id": 1,
      "quantity": 2
    },
    {
      "id": 5,
      "quantity": 1
    }
  ]
}
```

**Validaciones:**
- `user_id` debe ser un número
- `order_id` debe ser un número
- `delivery_address.postal_code` debe seguir el formato: `A1234ABC`
- `transport_type` debe ser uno de: `air`, `sea`, `road`, `rail`
- `products` debe ser un array no vacío
- Cada producto debe tener `id` (entero) y `quantity` (entero >= 1)

**Response:**
```json
{
  "shipping_id": 789,
  "status": "created",
  "transport_type": "road",
  "estimated_delivery_at": "2025-01-25T10:00:00.000Z"
}
```

**Valores posibles para `status`:**
- `created` - Creado
- `reserved` - Reservado
- `in_transit` - En tránsito
- `arrived` - Llegado
- `in_distribution` - En distribución
- `delivered` - Entregado
- `cancelled` - Cancelado

---

## 5. GET /shipping
**Descripción:** Lista todos los envíos con paginación

**Método:** `GET`

**Path:** `/shipping`

**Autenticación:** ✅ Requiere scope `envios:read`

**Query Parameters:**
- `page` (opcional): Número de página (default: 1, mínimo: 1)
- `items_per_page` (opcional): Items por página (default: 20, mínimo: 1, máximo: 200)

**Ejemplo:**
```
GET /shipping?page=1&items_per_page=10
```

**Response:**
```json
{
  "shipments": [
    {
      "shipping_id": 789,
      "order_id": 456,
      "user_id": 123,
      "products": [
        {
          "id": 1,
          "quantity": 2
        }
      ],
      "status": "created",
      "transport_type": "road",
      "estimated_delivery_at": "2025-01-25T10:00:00.000Z",
      "created_at": "2025-01-20T10:00:00.000Z"
    }
  ],
  "pagination": {
    "current_page": 1,
    "total_pages": 5,
    "total_items": 50,
    "items_per_page": 10
  }
}
```

---

## 6. GET /shipping/:id
**Descripción:** Obtiene los detalles completos de un envío por ID

**Método:** `GET`

**Path:** `/shipping/:id`

**Autenticación:** ✅ Requiere scope `envios:read`

**Path Parameters:**
- `id`: ID del envío (número)

**Ejemplo:**
```
GET /shipping/789
```

**Response:**
```json
{
  "shipping_id": 789,
  "order_id": 456,
  "user_id": 123,
  "delivery_Address": {
    "street": "Av. Corrientes 1234",
    "city": "Buenos Aires",
    "state": "CABA",
    "postal_code": "A1234ABC",
    "country": "Argentina"
  },
  "departure_Address": {
    "street": "Av. 9 de Julio 1000",
    "city": "Buenos Aires",
    "state": "CABA",
    "postal_code": "B5678XYZ",
    "country": "Argentina"
  },
  "products": [
    {
      "id": 1,
      "quantity": 2
    }
  ],
  "status": "in_transit",
  "transport_type": {
    "type": "road"
  },
  "tracking_number": "TRK123456789",
  "carrier_name": "Transportes ABC",
  "total_cost": 1500.00,
  "currency": "ARS",
  "estimated_delivery_at": "2025-01-25T10:00:00.000Z",
  "created_at": "2025-01-20T10:00:00.000Z",
  "updated_at": "2025-01-22T14:30:00.000Z",
  "logs": [
    {
      "timestamp": "2025-01-20T10:00:00.000Z",
      "status": "created",
      "message": "Envío creado"
    },
    {
      "timestamp": "2025-01-21T08:00:00.000Z",
      "status": "reserved",
      "message": "Stock reservado"
    },
    {
      "timestamp": "2025-01-22T14:30:00.000Z",
      "status": "in_transit",
      "message": "En tránsito hacia destino"
    }
  ]
}
```

---

## 7. POST /shipping/:id/cancel
**Descripción:** Cancela un envío

**Método:** `POST`

**Path:** `/shipping/:id/cancel`

**Autenticación:** ✅ Requiere scope `envios:write`

**Path Parameters:**
- `id`: ID del envío (número)

**Ejemplo:**
```
POST /shipping/789/cancel
```

**Response:**
```json
{
  "shipping_id": 789,
  "status": "cancelled",
  "cancelled_at": "2025-01-23T10:00:00.000Z"
}
```

**Nota:** Solo se pueden cancelar envíos que estén en estado `created` o `reserved`.

---

## 8. PATCH /shipping/:id/status
**Descripción:** Actualiza el estado de un envío

**Método:** `PATCH`

**Path:** `/shipping/:id/status`

**Autenticación:** ✅ Requiere scope `envios:write`

**Path Parameters:**
- `id`: ID del envío (número)

**Request Body:**
```json
{
  "newStatus": "in_transit",
  "notes": "Envío recogido por el transportista"
}
```

**Validaciones:**
- `newStatus` debe ser uno de los valores válidos de `ShippingStatus`
- `notes` es opcional (string)

**Valores posibles para `newStatus`:**
- `created` - Creado
- `reserved` - Reservado
- `in_transit` - En tránsito
- `arrived` - Llegado
- `in_distribution` - En distribución
- `delivered` - Entregado
- `cancelled` - Cancelado

**Response:**
```json
{
  "orderId": "789",
  "currentStatus": "in_transit",
  "statusHistory": [
    {
      "timestamp": "2025-01-20T10:00:00.000Z",
      "status": "created",
      "message": "Envío creado"
    },
    {
      "timestamp": "2025-01-21T08:00:00.000Z",
      "status": "reserved",
      "message": "Stock reservado"
    },
    {
      "timestamp": "2025-01-22T14:30:00.000Z",
      "status": "in_transit",
      "message": "En tránsito hacia destino"
    }
  ],
  "allowedNextStatuses": ["arrived", "cancelled"]
}
```

---

## Tipos de Datos

### AddressDto
```typescript
{
  street: string;           // Requerido
  city: string;             // Requerido
  state: string;            // Requerido
  postal_code: string;      // Requerido, formato: A1234ABC
  country: string;          // Requerido
}
```

### ProductQtyDto / ProductRequestDto
```typescript
{
  id: number;        // Requerido, entero >= 1
  quantity: number;  // Requerido, entero >= 1
}
```

### TransportMethods (Enum)
- `air` - Aéreo
- `sea` - Marítimo
- `road` - Terrestre
- `rail` - Ferroviario

### ShippingStatus (Enum)
- `created` - Creado
- `reserved` - Reservado
- `in_transit` - En tránsito
- `arrived` - Llegado
- `in_distribution` - En distribución
- `delivered` - Entregado
- `cancelled` - Cancelado

---

## Códigos de Estado HTTP

- `200 OK` - Operación exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Error de validación en los datos
- `401 Unauthorized` - Token faltante o inválido
- `403 Forbidden` - Scope insuficiente
- `404 Not Found` - Recurso no encontrado
- `422 Unprocessable Entity` - Error de validación específico del negocio
- `500 Internal Server Error` - Error interno del servidor

---

## Ejemplos de cURL

### 1. Obtener métodos de transporte (público)
```bash
curl -X GET "http://localhost:3010/shipping/transport-methods"
```

### 2. Crear un envío
```bash
curl -X POST "http://localhost:3010/shipping" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": 123,
    "order_id": 456,
    "delivery_address": {
      "street": "Av. Corrientes 1234",
      "city": "Buenos Aires",
      "state": "CABA",
      "postal_code": "A1234ABC",
      "country": "Argentina"
    },
    "transport_type": "road",
    "products": [
      {"id": 1, "quantity": 2}
    ]
  }'
```

### 3. Listar envíos con paginación
```bash
curl -X GET "http://localhost:3010/shipping?page=1&items_per_page=10" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```

### 4. Obtener envío por ID
```bash
curl -X GET "http://localhost:3010/shipping/789" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```

### 5. Calcular costo
```bash
curl -X POST "http://localhost:3010/shipping/cost" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "delivery_address": {
      "street": "Av. Corrientes 1234",
      "city": "Buenos Aires",
      "state": "CABA",
      "postal_code": "A1234ABC",
      "country": "Argentina"
    },
    "products": [
      {"id": 1, "quantity": 2}
    ]
  }'
```

### 6. Cancelar envío
```bash
curl -X POST "http://localhost:3010/shipping/789/cancel" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI"
```

### 7. Actualizar estado de envío
```bash
curl -X PATCH "http://localhost:3010/shipping/789/status" \
  -H "Authorization: Bearer TU_TOKEN_JWT_AQUI" \
  -H "Content-Type: application/json" \
  -d '{
    "newStatus": "in_transit",
    "notes": "En tránsito"
  }'
```

---

## Scopes Requeridos

- `envios:read` - Para consultar envíos (GET)
- `envios:write` - Para crear, cancelar o actualizar envíos (POST, PATCH)

---

## Notas Importantes

1. **Formato de código postal:** El campo `postal_code` debe seguir el formato `A1234ABC` (1 letra mayúscula, 4 dígitos, 3 letras mayúsculas).

2. **Token en cálculo de costo:** El endpoint `/shipping/cost` extrae el token del header `Authorization` para validar la disponibilidad de productos con el servicio de Stock.

3. **Estados permitidos:** Los cambios de estado deben seguir un flujo válido. El endpoint `/shipping/:id/status` devuelve los estados permitidos siguientes en `allowedNextStatuses`.

4. **Cancelación:** Solo se pueden cancelar envíos en estado `created` o `reserved`.

