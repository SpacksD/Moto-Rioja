# 🏍️ MotoTaxi Connect

**Plataforma digital de mototaxis con sistema de negociación de precios en tiempo real**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-20.x-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-blue.svg)](https://www.typescriptlang.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10.x-red.svg)](https://nestjs.com/)
[![React Native](https://img.shields.io/badge/React%20Native-latest-blue.svg)](https://reactnative.dev/)

---

## 📋 Tabla de Contenidos

- [Características](#-características)
- [Arquitectura](#-arquitectura)
- [Tecnologías](#-tecnologías)
- [Instalación](#-instalación)
- [Configuración](#-configuración)
- [Desarrollo](#-desarrollo)
- [API Reference](#-api-reference)
- [Base de Datos](#-base-de-datos)
- [Despliegue](#-despliegue)
- [Contribuir](#-contribuir)
- [Licencia](#-licencia)

---

## ✨ Características

### Para Pasajeros
- ✅ Registro y autenticación con SMS
- ✅ Solicitud de viajes con origen y destino
- ✅ Sistema de negociación de precios
- ✅ Múltiples ofertas de conductores
- ✅ Tracking GPS en tiempo real
- ✅ Calificación y comentarios
- ✅ Historial de viajes
- ✅ Lugares favoritos
- ✅ Compartir viaje con contactos
- ✅ Botón de pánico/emergencia

### Para Conductores
- ✅ Registro con verificación de documentos
- ✅ Gestión de disponibilidad
- ✅ Recepción de solicitudes cercanas
- ✅ Sistema de ofertas competitivas
- ✅ Navegación GPS integrada
- ✅ Dashboard de ganancias
- ✅ Retiros a cuenta bancaria
- ✅ Estadísticas en tiempo real

### Para Administradores
- ✅ Panel de control completo
- ✅ Verificación de conductores
- ✅ Monitoreo de viajes en tiempo real
- ✅ Gestión de disputas
- ✅ Reportes y analytics
- ✅ Control de tarifas por zona

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend Layer                            │
├──────────────┬──────────────┬──────────────┬───────────────────┤
│  App Móvil   │  App Móvil   │  Panel Web   │   WebSocket       │
│  Pasajero    │  Conductor   │  Admin       │   Connection      │
│ (React Native)│(React Native)│  (Next.js)   │   (Socket.io)    │
└──────────────┴──────────────┴──────────────┴───────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API Gateway Layer                           │
│                      (NestJS + Express)                          │
│  - Authentication (JWT)                                          │
│  - Rate Limiting                                                 │
│  - Request Validation                                            │
└─────────────────────────────────────────────────────────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Microservices Layer                           │
├────────────┬────────────┬───────────┬───────────┬──────────────┤
│  Auth      │  Viajes    │  Ofertas  │  Pagos    │  Notif.      │
│  Service   │  Service   │  Service  │  Service  │  Service     │
└────────────┴────────────┴───────────┴───────────┴──────────────┘
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Data Layer                                 │
├──────────────────┬──────────────────┬──────────────────────────┤
│   PostgreSQL     │      Redis       │      File Storage        │
│   (PostGIS)      │   (Cache/Queue)  │      (S3/Local)          │
└──────────────────┴──────────────────┴──────────────────────────┘
```

---

## 🛠️ Tecnologías

### Backend
- **Framework**: NestJS 10 + TypeScript
- **Base de Datos**: PostgreSQL 15 con PostGIS
- **Cache/Queue**: Redis + Bull
- **ORM**: Prisma
- **WebSocket**: Socket.io
- **Autenticación**: JWT + Passport

### Frontend Móvil
- **Framework**: React Native + Expo
- **Estado**: Redux Toolkit + RTK Query
- **Navegación**: React Navigation 6
- **Mapas**: React Native Maps + Google Maps API
- **UI**: NativeBase / Tamagui

### Panel Admin
- **Framework**: Next.js 14 (App Router)
- **UI**: Tailwind CSS + shadcn/ui
- **Gráficos**: Recharts
- **Estado**: Zustand + React Query

### DevOps
- **Contenedores**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Proxy**: Nginx
- **Monitoreo**: PM2

---

## 🚀 Instalación

### Prerrequisitos
```bash
- Node.js 20.x o superior
- PostgreSQL 15 con extensión PostGIS
- Redis 7.x
- Docker y Docker Compose (opcional)
```

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/mototaxi-connect.git
cd mototaxi-connect
```

### 2. Opción A: Con Docker (Recomendado)
```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f backend

# Ejecutar migraciones
docker-compose exec backend npx prisma migrate dev
```

### 3. Opción B: Instalación Manual

#### Backend
```bash
cd backend

# Instalar dependencias
npm install

# Copiar variables de entorno
cp .env.example .env
# Editar .env con tus configuraciones

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Iniciar servidor de desarrollo
npm run start:dev
```

El backend estará disponible en `http://localhost:3000`

#### Frontend Móvil
```bash
cd mobile

# Instalar dependencias
npm install

# Iniciar Expo
npx expo start

# Para Android
npx expo start --android

# Para iOS (solo Mac)
npx expo start --ios
```

#### Panel Admin
```bash
cd admin

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El panel admin estará disponible en `http://localhost:3001`

---

## ⚙️ Configuración

### Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/mototaxi?schema=public"

# JWT
JWT_SECRET="tu-super-secret-key-cambiar-en-produccion"
JWT_REFRESH_SECRET="tu-refresh-secret-key"
JWT_EXPIRATION="1h"
JWT_REFRESH_EXPIRATION="30d"

# Redis
REDIS_HOST="localhost"
REDIS_PORT=6379

# Server
PORT=3000
NODE_ENV="development"

# Twilio (SMS)
TWILIO_ACCOUNT_SID="tu-twilio-sid"
TWILIO_AUTH_TOKEN="tu-twilio-token"
TWILIO_PHONE_NUMBER="+15005550006"

# Google Maps
GOOGLE_MAPS_API_KEY="tu-google-maps-key"

# Encryption
ENCRYPTION_KEY="64-character-hex-string"

# CORS
CORS_ORIGIN="http://localhost:3000,http://localhost:19006"
```

### Base de Datos

#### Crear base de datos
```bash
# Conectar a PostgreSQL
psql -U postgres

# Crear base de datos
CREATE DATABASE mototaxi;

# Conectar a la base de datos
\c mototaxi

# Habilitar PostGIS
CREATE EXTENSION postgis;
```

#### Ejecutar migraciones
```bash
cd backend
npx prisma migrate dev --name init
```

#### Seed de datos (opcional)
```bash
npx prisma db seed
```

---

## 💻 Desarrollo

### Estructura del Proyecto

```
mototaxi-connect/
├── backend/
│   ├── src/
│   │   ├── auth/              # Autenticación y JWT
│   │   ├── users/             # Gestión de usuarios
│   │   ├── conductores/       # Gestión de conductores
│   │   ├── viajes/            # Core - gestión de viajes
│   │   ├── ofertas/           # Sistema de negociación
│   │   ├── notificaciones/    # Push notifications
│   │   ├── pagos/             # Procesamiento de pagos
│   │   ├── geolocation/       # GPS y tracking
│   │   ├── websocket/         # WebSocket para tiempo real
│   │   └── common/            # Utilidades compartidas
│   ├── prisma/
│   │   └── schema.prisma      # Esquema de base de datos
│   ├── package.json
│   └── Dockerfile
├── mobile/
│   ├── src/
│   │   ├── screens/           # Pantallas de la app
│   │   ├── components/        # Componentes reutilizables
│   │   ├── navigation/        # Configuración de navegación
│   │   ├── services/          # API calls
│   │   ├── store/             # Redux store
│   │   └── utils/             # Utilidades
│   └── package.json
├── admin/
│   ├── src/
│   │   ├── app/               # App Router de Next.js
│   │   ├── components/        # Componentes UI
│   │   └── lib/               # Utilidades
│   └── package.json
├── docker-compose.yml
├── .gitignore
└── README.md
```

### Comandos Útiles

#### Backend
```bash
# Desarrollo
npm run start:dev

# Producción
npm run build
npm run start:prod

# Testing
npm run test
npm run test:watch
npm run test:e2e

# Linting
npm run lint

# Prisma
npx prisma studio          # Abrir GUI de base de datos
npx prisma migrate dev     # Crear nueva migración
npx prisma generate        # Generar Prisma Client
```

#### Docker
```bash
# Iniciar servicios
docker-compose up -d

# Detener servicios
docker-compose down

# Ver logs
docker-compose logs -f

# Rebuild
docker-compose up -d --build

# Limpiar volúmenes
docker-compose down -v
```

---

## 📡 API Reference

### Autenticación

#### Registrar Usuario
```http
POST /api/auth/register
Content-Type: application/json

{
  "telefono": "+51999888777",
  "nombre": "Juan",
  "apellidos": "Pérez",
  "tipoUsuario": "pasajero"
}

Response: 200 OK
{
  "message": "Código OTP enviado exitosamente",
  "telefono": "+51999888777",
  "codigo": "123456"  // Solo en desarrollo
}
```

#### Verificar OTP
```http
POST /api/auth/verify-otp
Content-Type: application/json

{
  "telefono": "+51999888777",
  "codigo": "123456"
}

Response: 200 OK
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "usuario": {
    "id": "uuid",
    "nombre": "Juan Pérez",
    "tipoUsuario": "pasajero"
  }
}
```

### Viajes

#### Solicitar Viaje
```http
POST /api/viajes/solicitar
Authorization: Bearer {token}
Content-Type: application/json

{
  "origen": {
    "latitud": -12.0464,
    "longitud": -77.0428,
    "direccion": "Av. Arequipa 1234, Miraflores",
    "referencia": "Edificio azul"
  },
  "destino": {
    "latitud": -12.0864,
    "longitud": -77.0528,
    "direccion": "Plaza de Armas, Lima"
  },
  "precioInicial": 8.50,
  "metodoPago": "efectivo"
}

Response: 201 Created
{
  "id": "uuid",
  "codigoViaje": "MT12AB34CD",
  "estado": "esperando_ofertas",
  "precioSugerido": 9.20,
  "distanciaKm": 5.2,
  "duracionEstimada": 12
}
```

#### Obtener Detalles de Viaje
```http
GET /api/viajes/:id
Authorization: Bearer {token}

Response: 200 OK
{
  "id": "uuid",
  "codigoViaje": "MT12AB34CD",
  "estado": "viaje_iniciado",
  "pasajero": { ... },
  "conductor": { ... },
  "origen": { ... },
  "destino": { ... },
  "precioFinalAcordado": 8.00
}
```

### Ofertas

#### Crear Oferta (Conductor)
```http
POST /api/ofertas
Authorization: Bearer {token}
Content-Type: application/json

{
  "viajeId": "uuid",
  "precioOfertado": 7.50,
  "tiempoLlegadaEstimado": 5,
  "mensaje": "Estoy cerca, puedo llegar en 5 minutos"
}

Response: 201 Created
{
  "id": "uuid",
  "precioOfertado": 7.50,
  "estado": "pendiente",
  "conductor": { ... }
}
```

#### Aceptar Oferta (Pasajero)
```http
PUT /api/ofertas/:id/aceptar
Authorization: Bearer {token}

Response: 200 OK
{
  "viaje": {
    "id": "uuid",
    "estado": "aceptado",
    "conductorId": "uuid",
    "precioFinalAcordado": 7.50
  }
}
```

### WebSocket Events

#### Conectar
```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    userId: 'user-uuid',
    userType: 'pasajero'
  }
});
```

#### Eventos para Pasajeros
```javascript
// Escuchar nueva oferta
socket.on('nueva_oferta', (oferta) => {
  console.log('Nueva oferta recibida:', oferta);
});

// Escuchar ubicación del conductor
socket.on('ubicacion_conductor', (ubicacion) => {
  console.log('Ubicación:', ubicacion);
});

// Unirse a un viaje
socket.emit('unirse_viaje', { viajeId: 'uuid' });
```

#### Eventos para Conductores
```javascript
// Escuchar nueva solicitud
socket.on('nueva_solicitud', (viaje) => {
  console.log('Nueva solicitud cercana:', viaje);
});

// Actualizar ubicación
socket.emit('actualizar_ubicacion', {
  viajeId: 'uuid',
  ubicacion: {
    latitud: -12.0464,
    longitud: -77.0428,
    rumbo: 45,
    velocidad: 30
  }
});
```

[Ver documentación completa de la API →](./docs/API.md)

---

## 💾 Base de Datos

### Esquema Principal

El proyecto utiliza PostgreSQL con PostGIS para funcionalidades geoespaciales. Las tablas principales son:

- **usuarios**: Datos básicos de todos los usuarios
- **conductores**: Información específica de conductores
- **viajes**: Registro de todos los viajes
- **ofertas_viaje**: Sistema de negociación de precios
- **historial_ubicaciones**: Tracking GPS
- **transacciones**: Pagos y comisiones
- **notificaciones**: Sistema de notificaciones

[Ver esquema completo →](./backend/prisma/schema.prisma)

### Diagrama ER

```mermaid
erDiagram
    USUARIO ||--o{ VIAJE : solicita
    USUARIO ||--o| CONDUCTOR : "puede ser"
    CONDUCTOR ||--o{ VIAJE : realiza
    VIAJE ||--o{ OFERTA : "recibe"
    CONDUCTOR ||--o{ OFERTA : "hace"
    VIAJE ||--o{ HISTORIAL_UBICACION : "tiene"
    VIAJE ||--o{ TRANSACCION : "genera"
```

---

## 🚢 Despliegue

### Producción con Docker

```bash
# Build de imágenes de producción
docker-compose -f docker-compose.prod.yml build

# Desplegar
docker-compose -f docker-compose.prod.yml up -d

# Ver logs
docker-compose -f docker-compose.prod.yml logs -f
```

### Despliegue en VPS

1. **Preparar servidor**
```bash
# Actualizar sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Instalar Docker Compose
sudo apt install docker-compose -y
```

2. **Clonar repositorio**
```bash
git clone https://github.com/tu-usuario/mototaxi-connect.git
cd mototaxi-connect
```

3. **Configurar variables de entorno**
```bash
cp backend/.env.example backend/.env
nano backend/.env  # Editar con valores de producción
```

4. **Iniciar servicios**
```bash
docker-compose up -d
```

5. **Configurar Nginx (opcional)**
```nginx
server {
    listen 80;
    server_name api.mototaxi.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /socket.io {
        proxy_pass http://localhost:3000/socket.io;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

---

## 🤝 Contribuir

¡Las contribuciones son bienvenidas! Por favor, sigue estos pasos:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

### Estándares de Código

- Usar TypeScript strict mode
- Seguir guía de estilo de Airbnb
- Tests para nuevas funcionalidades
- Documentar funciones públicas

---

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

---

## 📞 Contacto

**MotoTaxi Connect Team**

- Email: contact@mototaxi.com
- Website: https://mototaxi.com
- GitHub: [@mototaxi-connect](https://github.com/mototaxi-connect)

---

## 🙏 Agradecimientos

- Inspirado en InDriver y otras plataformas de movilidad
- Comunidad de conductores de mototaxi de Perú
- Contribuidores open source

---

**¿Listo para revolucionar el transporte en mototaxi?** 🏍️💨

[Comenzar →](#-instalación)
