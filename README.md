# 🛒 ShopFlow - E-commerce Platform

Una plataforma de e-commerce moderna construida con React y NestJS, diseñada para ser desplegada en Northflank y desarrollada localmente por equipos distribuidos.

## 🏗️ Arquitectura del Proyecto

```
ShopFlow/
├── frontend/          # Aplicación React + Vite
├── backend/           # API NestJS + Prisma + PostgreSQL
└── README.md         # Este archivo
```

## 🚀 Tecnologías Utilizadas

### Frontend
- **React 19** - Framework de UI
- **Vite** - Build tool y dev server
- **ESLint** - Linting y formateo de código

### Backend
- **NestJS** - Framework de Node.js
- **TypeScript** - Lenguaje de programación
- **Prisma** - ORM para base de datos
- **PostgreSQL** - Base de datos
- **Swagger** - Documentación de API

### DevOps
- **Docker** - Containerización
- **Northflank** - Plataforma de despliegue
- **Nginx** - Servidor web para frontend

## 🛠️ Desarrollo Local

### Prerrequisitos
- Node.js 22+
- npm o yarn
- Docker (opcional)
- PostgreSQL (para desarrollo local)

### Configuración del Backend

1. **Instalar dependencias:**
```bash
cd backend
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env` en la carpeta `backend/`:
```env
DATABASE_URL="postgresql://usuario:password@localhost:5432/shopflow"
NODE_ENV="development"
PORT=3000
SECRET_KEY="your_secret_key"
```

3. **Configurar base de datos:**
```bash
# Generar cliente de Prisma
npm run prisma:generate

# Ejecutar migraciones
npm run prisma:migrate

# Poblar base de datos (opcional)
npm run prisma:seed
```

4. **Ejecutar en modo desarrollo:**
```bash
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

### Configuración del Frontend

1. **Instalar dependencias:**
```bash
cd frontend
npm install
```

2. **Configurar variables de entorno:**
Crear archivo `.env` en la carpeta `frontend/`:
```env
VITE_API_BASE_URL=http://localhost:3000
```

3. **Ejecutar en modo desarrollo:**
```bash
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

## 🐳 Docker

### Ejecutar con Docker

**Backend:**
```bash
cd backend
docker build -t shopflow-backend .
docker run -p 3000:3000 --env-file .env shopflow-backend
```

**Frontend:**
```bash
cd frontend
docker build -t shopflow-frontend .
docker run -p 80:80 shopflow-frontend
```

## 🌐 Despliegue en Northflank

### Configuración de Servicios

1. **Backend Service:**
   - Source: Git repository
   - Path: `/backend`
   - Build: Docker
   - Port: 3000
   - Environment Variables:
     - `DATABASE_URL`: URL de la base de datos
     - `NODE_ENV`: production

2. **Frontend Service:**
   - Source: Git repository
   - Path: `/frontend`
   - Build: Docker
   - Port: 80
   - Environment Variables:
     - `VITE_API_BASE_URL`: URL del backend en Northflank

### Variables de Entorno Requeridas

**Backend:**
- `DATABASE_URL`: Conexión a PostgreSQL
- `NODE_ENV`: Entorno de ejecución
- `PORT`: Puerto del servidor (opcional, default: 3000)

**Frontend:**
- `VITE_API_BASE_URL`: URL base del API backend

## 📚 API Documentation

Una vez que el backend esté ejecutándose, la documentación de Swagger estará disponible en:
- Local: `http://localhost:3000/api`
- Producción: `{BACKEND_URL}/api`

## 🧪 Testing

### Backend
```bash
cd backend
npm run test          # Tests unitarios
npm run test:e2e      # Tests end-to-end
npm run test:cov      # Coverage
```

### Frontend
```bash
cd frontend
npm run lint          # Linting
```

## 📁 Estructura del Proyecto

### Backend (`/backend`)
```
src/
├── modules/          # Módulos de la aplicación
│   └── portal/       # Módulo principal del portal
│       ├── products/ # Gestión de productos
│       ├── cart/     # Carrito de compras
│       ├── orders/   # Gestión de pedidos
│       ├── users/    # Gestión de usuarios
│       └── tracking/ # Seguimiento de pedidos
├── shared/           # Código compartido
├── core/             # Configuraciones core
└── database/         # Configuración de base de datos
```

### Frontend (`/frontend`)
```
src/
├── apps/             # Aplicaciones específicas
│   ├── auth/         # Autenticación
│   ├── shopping/     # Compra de productos
│   ├── cart/         # Carrito de compras
│   ├── orders/       # Gestión de pedidos
│   └── profile/      # Perfil de usuario
├── components/       # Componentes compartidos
├── shared/           # Utilidades compartidas
└── services/         # Servicios de API
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Scripts Disponibles

### Backend
- `npm run start:dev` - Desarrollo con hot reload
- `npm run build` - Build de producción
- `npm run start:prod` - Ejecutar build de producción
- `npm run prisma:generate` - Generar cliente Prisma
- `npm run prisma:migrate` - Ejecutar migraciones
- `npm run prisma:seed` - Poblar base de datos

### Frontend
- `npm run dev` - Servidor de desarrollo
- `npm run build` - Build de producción
- `npm run preview` - Preview del build
- `npm run lint` - Linting del código

## 🔧 Configuración de IDE

Recomendamos usar VS Code con las siguientes extensiones:
- ES7+ React/Redux/React-Native snippets
- Prisma
- TypeScript Importer
- ESLint
- Prettier

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

---

**Desarrollado con ❤️ para equipos distribuidos**