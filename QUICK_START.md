# 🚀 Guía de Inicio Rápido - MotoTaxi Connect

## ⚡ Iniciar el proyecto en 5 minutos

### Opción 1: Con Docker (Más fácil)

```bash
# 1. Iniciar todos los servicios
docker-compose up -d

# 2. Esperar a que PostgreSQL esté listo (30 segundos)
sleep 30

# 3. Ejecutar migraciones de base de datos
docker-compose exec backend npx prisma migrate dev --name init

# 4. Generar Prisma Client
docker-compose exec backend npx prisma generate

# 5. Ver logs
docker-compose logs -f backend
```

✅ **¡Listo!** El backend está corriendo en http://localhost:3000

### Opción 2: Sin Docker (Manual)

```bash
# 1. Instalar PostgreSQL y Redis
# macOS:
brew install postgresql redis
brew services start postgresql redis

# Ubuntu/Debian:
sudo apt install postgresql redis-server
sudo systemctl start postgresql redis-server

# 2. Crear base de datos
psql -U postgres
CREATE DATABASE mototaxi;
\c mototaxi
CREATE EXTENSION postgis;
\q

# 3. Configurar backend
cd backend
npm install
cp .env.example .env
# Editar .env con tus configuraciones

# 4. Ejecutar migraciones
npx prisma migrate dev --name init
npx prisma generate

# 5. Iniciar servidor
npm run start:dev
```

## 🧪 Probar la API

### 1. Registrar Usuario

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+51999888777",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "tipoUsuario": "pasajero"
  }'
```

Respuesta (en desarrollo, el código OTP se muestra):
```json
{
  "message": "Código OTP enviado exitosamente",
  "telefono": "+51999888777",
  "codigo": "123456"
}
```

### 2. Verificar OTP

```bash
curl -X POST http://localhost:3000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{
    "telefono": "+51999888777",
    "codigo": "123456",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "tipoUsuario": "pasajero"
  }'
```

Respuesta:
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "usuario": {
    "id": "uuid-here",
    "telefono": "+51999888777",
    "nombre": "Juan",
    "apellidos": "Pérez",
    "tipoUsuario": "pasajero",
    "estado": "activo"
  }
}
```

### 3. Solicitar Viaje

```bash
TOKEN="tu-access-token-aqui"

curl -X POST http://localhost:3000/api/viajes/solicitar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
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
  }'
```

## 🔍 Explorar la Base de Datos

```bash
# Abrir Prisma Studio (GUI para la base de datos)
cd backend
npx prisma studio
```

Se abrirá en http://localhost:5555

## 📱 WebSocket (Tiempo Real)

### Conectar con Socket.io Client

```javascript
import { io } from 'socket.io-client';

const socket = io('http://localhost:3000', {
  auth: {
    userId: 'tu-user-id',
    userType: 'pasajero'
  }
});

socket.on('connect', () => {
  console.log('✅ Conectado al servidor WebSocket');
});

// Escuchar eventos
socket.on('nueva_oferta', (oferta) => {
  console.log('Nueva oferta:', oferta);
});

socket.on('ubicacion_conductor', (ubicacion) => {
  console.log('Ubicación:', ubicacion);
});

// Unirse a un viaje
socket.emit('unirse_viaje', { viajeId: 'uuid-del-viaje' });
```

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

```bash
# Verificar que PostgreSQL está corriendo
# macOS:
brew services list

# Linux:
sudo systemctl status postgresql

# Docker:
docker-compose ps
```

### Error: "Redis connection failed"

```bash
# Verificar que Redis está corriendo
# macOS:
brew services list

# Linux:
sudo systemctl status redis-server

# Docker:
docker-compose ps
```

### Error: "Port 3000 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :3000

# Matar el proceso
kill -9 <PID>

# O cambiar el puerto en .env
PORT=3001
```

## 📚 Siguientes Pasos

1. ✅ Explorar las rutas de la API en http://localhost:3000/api
2. ✅ Revisar el esquema de base de datos en Prisma Studio
3. ✅ Probar WebSocket con Socket.io client
4. ✅ Implementar el frontend móvil con React Native
5. ✅ Implementar el panel de administración con Next.js

## 🎯 Estructura de la API

```
GET    /api/users/profile              # Obtener perfil
PUT    /api/users/profile              # Actualizar perfil
GET    /api/users/viajes               # Historial de viajes
GET    /api/users/estadisticas         # Estadísticas

POST   /api/auth/register              # Registrar usuario
POST   /api/auth/verify-otp            # Verificar OTP
POST   /api/auth/login                 # Login (enviar OTP)
POST   /api/auth/refresh-token         # Refrescar token

POST   /api/viajes/solicitar           # Solicitar viaje
GET    /api/viajes/:id                 # Obtener viaje
POST   /api/viajes/:id/iniciar         # Iniciar viaje
POST   /api/viajes/:id/finalizar       # Finalizar viaje
POST   /api/viajes/:id/calificar       # Calificar viaje
POST   /api/viajes/:id/cancelar        # Cancelar viaje

POST   /api/ofertas                    # Crear oferta
PUT    /api/ofertas/:id/aceptar        # Aceptar oferta
PUT    /api/ofertas/:id/rechazar       # Rechazar oferta
PUT    /api/ofertas/:id/contraoferta   # Hacer contraoferta
GET    /api/ofertas/viaje/:viajeId     # Obtener ofertas

POST   /api/conductores/registrar      # Registrar conductor
PUT    /api/conductores/disponibilidad # Actualizar disponibilidad
GET    /api/conductores/cercanos       # Obtener conductores cercanos

POST   /api/pagos/procesar             # Procesar pago
```

## 💡 Tips de Desarrollo

1. **Modo Desarrollo**: Los códigos OTP se muestran en la respuesta
2. **Logs**: Ver logs con `docker-compose logs -f backend`
3. **Rebuild**: Si cambias dependencias, ejecuta `docker-compose up -d --build`
4. **Base de Datos**: Usa Prisma Studio para explorar y editar datos
5. **Hot Reload**: Los cambios en el código se reflejan automáticamente

## 🎨 Frontend (Próximamente)

### Mobile App

```bash
cd mobile
npm install
npx expo start
```

### Panel Admin

```bash
cd admin
npm install
npm run dev
```

---

**¿Necesitas ayuda?** Revisa el [README.md](./README.md) completo o abre un issue en GitHub.
