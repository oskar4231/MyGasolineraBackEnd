![MyGasolinera Banner](banner.png)

# MyGasolinera Backend 🚗⛽

**Backend API REST para la aplicación MyGasolinera** - Sistema de gestión de gasolineras, precios de combustible y vehículos personales.

---

## 👥 Equipo de Desarrollo

Desarrollado por:
- **Oscar**
- **Cristian**
- **David**
- **Carlos**

---

## 📋 Descripción

MyGasolinera Backend es una **API REST** desarrollada con Node.js y Express que proporciona servicios de autenticación, gestión de usuarios, vehículos y gasolineras. El sistema utiliza MariaDB como base de datos y JWT para la autenticación segura.

> **Nota:** Este es el repositorio del **Backend**. La aplicación móvil Flutter se encuentra en un repositorio separado.

### ✨ Características Principales

- 🔐 **Autenticación segura** con JWT y bcrypt
- 👤 **Gestión de usuarios** (registro, login, perfil)
- 🚙 **Gestión de vehículos** por usuario
- ⛽ **Sistema de gasolineras** con precios y servicios
- ⭐ **Favoritos** para guardar gasolineras preferidas
- 🧾 **Gestión de facturas** de repostajes
- 🔒 **Middleware de autenticación** para rutas protegidas
- 🌐 **CORS habilitado** para integración con aplicaciones móviles

---

## 🛠️ Tecnologías Utilizadas

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | - | Entorno de ejecución |
| **Express** | ^4.21.2 | Framework web |
| **MariaDB** | 12.0.2+ | Base de datos |
| **mysql2** | ^3.15.3 | Cliente MySQL/MariaDB |
| **bcryptjs** | ^2.4.3 | Encriptación de contraseñas |
| **jsonwebtoken** | ^9.0.2 | Autenticación JWT |
| **dotenv** | ^16.6.1 | Variables de entorno |
| **cors** | ^2.8.5 | Cross-Origin Resource Sharing |
| **axios** | ^1.5.0 | Cliente HTTP |

---

## 📦 Instalación

### Prerrequisitos

- **Node.js** (v14 o superior)
- **MariaDB** (v12.0.2 o superior)
- **npm** o **yarn**

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <repository-url>
   cd BackendBBDD
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   # Configuración de Base de Datos MariaDB
   DB_USER=root
   DB_HOST=127.0.0.1
   DB_NAME=mygasolinera
   DB_PASSWORD=
   DB_PORT=3306

   # JWT Secret
   JWT_SECRET=MyGasolinera

   # Servidor
   PORT=3000
   NODE_ENV=development
   ```

4. **Crear la base de datos**
   
   Ejecutar el script SQL incluido:
   ```bash
   # En Windows
   cd crear_bbdd
   crear_bbdd.bat
   ```
   
   O manualmente importar `crear_bbdd/mygasolinera.sql` en MariaDB/HeidiSQL.

5. **Iniciar el servidor**
   ```bash
   # Modo producción
   npm start

   # Modo desarrollo (con auto-reload)
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

---

## 📊 Estructura de la Base de Datos

```mermaid
erDiagram
    USUARIOS ||--o{ COCHES : posee
    USUARIOS ||--o{ FACTURAS : tiene
    USUARIOS ||--o{ FAVORITAS : guarda
    GASOLINERAS ||--o{ FAVORITAS : "es favorita"
    GASOLINERAS ||--o{ PRECIOS : tiene
    GASOLINERAS ||--o{ GASOLINERA_SERVICIOS : ofrece
    SERVICIOS ||--o{ GASOLINERA_SERVICIOS : "se ofrece en"

    USUARIOS {
        int id_usuario PK
        string nombre
        string apellido
        string email UK
        string telefono
        string contraseña
    }

    COCHES {
        int id_coche PK
        int id_usuario FK
        string marca
        string modelo
        string combustible
    }

    GASOLINERAS {
        int id_gasolinera PK
        string nombre
        string direccion
        string municipio
        string provincia
        string codPostal
        decimal latitud
        decimal longitud
        boolean horario_24
    }

    PRECIOS {
        int id_precio PK
        int id_gasolinera FK
        string tipo_combustible
        decimal precio
    }

    FACTURAS {
        int id_factura PK
        int id_usuario FK
        string titulo
        decimal coste
        date fecha
        time hora
        text descripcion
    }

    FAVORITAS {
        int id_usuario FK
        int id_gasolinera FK
        date fecha_agregado
    }

    SERVICIOS {
        int id_servicio PK
        string nombre
    }

    GASOLINERA_SERVICIOS {
        int id_gasolinera FK
        int id_servicio FK
    }
```

---

## 🔌 API Endpoints

### 🔓 Endpoints Públicos

#### Health Check
```http
GET /api/health
```
Verifica el estado del servidor.

**Respuesta:**
```json
{
  "status": "OK",
  "message": "MyGasolinera Backend running",
  "database": "MariaDB"
}
```

#### Test Database
```http
GET /api/test-db
```
Prueba la conexión a la base de datos.

#### Registro de Usuario
```http
POST /register
```

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123",
  "nombre": "Juan Pérez"
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Usuario creado correctamente",
  "user": {
    "email": "usuario@example.com",
    "nombre": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### Login
```http
POST /login
```

**Body:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Respuesta exitosa:**
```json
{
  "status": "success",
  "message": "Login exitoso",
  "user": {
    "email": "usuario@example.com",
    "nombre": "Juan Pérez"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 🔒 Endpoints Protegidos

> **Nota:** Todos los endpoints protegidos requieren el header de autorización:
> ```
> Authorization: Bearer <token>
> ```

#### Obtener Perfil
```http
GET /profile
```

**Respuesta:**
```json
{
  "user": {
    "email": "usuario@example.com",
    "nombre": "Juan Pérez"
  }
}
```

#### Insertar Vehículo
```http
POST /insertCar
```

**Body:**
```json
{
  "marca": "Toyota",
  "modelo": "Corolla",
  "combustible": "Gasolina 95"
}
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Coche creado correctamente",
  "carId": 1
}
```

#### Obtener Vehículos del Usuario
```http
GET /coches
```

**Respuesta:**
```json
[
  {
    "id_coche": 1,
    "marca": "Toyota",
    "modelo": "Corolla",
    "combustible": "Gasolina 95"
  }
]
```

#### Eliminar Vehículo
```http
DELETE /coches/:id_coche
```

**Respuesta:**
```json
{
  "status": "success",
  "message": "Coche eliminado correctamente"
}
```

---

## 🔐 Autenticación

El sistema utiliza **JSON Web Tokens (JWT)** para la autenticación. 

### Flujo de Autenticación

1. El usuario se registra o inicia sesión
2. El servidor devuelve un token JWT válido por 24 horas
3. El cliente incluye el token en el header `Authorization` de cada petición:
   ```
   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```
4. El middleware `authenticateToken` valida el token antes de procesar la petición

### Seguridad

- Las contraseñas se encriptan con **bcrypt** (10 salt rounds)
- Los tokens JWT expiran después de 24 horas
- Las rutas protegidas verifican la autenticidad del token
- CORS configurado para aceptar credenciales

---

## 📁 Estructura del Proyecto

```
BackendBBDD/
├── crear_bbdd/
│   ├── crear_bbdd.bat          # Script para crear la BD en Windows
│   └── mygasolinera.sql        # Schema de la base de datos
├── node_modules/               # Dependencias
├── .env                        # Variables de entorno (no incluir en git)
├── .git/                       # Control de versiones
├── banner.png                  # Banner del proyecto
├── package.json                # Configuración del proyecto
├── package-lock.json           # Lock de dependencias
├── server.js                   # Servidor principal
└── README.md                   # Este archivo
```

---

## 🚀 Scripts Disponibles

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia el servidor en modo producción |
| `npm run dev` | Inicia el servidor en modo desarrollo con auto-reload |

---

## 🧪 Testing

### Probar la API con curl

**Health Check:**
```bash
curl http://localhost:3000/api/health
```

**Registro:**
```bash
curl -X POST http://localhost:3000/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","nombre":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3000/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Obtener coches (requiere token):**
```bash
curl http://localhost:3000/coches \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## 🐛 Solución de Problemas

### Error de conexión a la base de datos

**Problema:** `Error conectando a MariaDB`

**Solución:**
1. Verificar que MariaDB esté ejecutándose
2. Comprobar las credenciales en el archivo `.env`
3. Usar `127.0.0.1` en lugar de `localhost` en `DB_HOST`
4. Verificar que el puerto 3306 esté disponible

### Error "Token inválido"

**Problema:** `403 - Token inválido`

**Solución:**
1. Verificar que el token no haya expirado (válido por 24h)
2. Asegurarse de incluir el prefijo `Bearer ` en el header
3. Verificar que `JWT_SECRET` sea el mismo que se usó para generar el token

### Puerto en uso

**Problema:** `Error: listen EADDRINUSE: address already in use :::3000`

**Solución:**
1. Cambiar el puerto en `.env` (ej: `PORT=3001`)
2. O detener el proceso que está usando el puerto 3000

---

## 📝 Notas de Desarrollo

- El servidor escucha en `0.0.0.0` para permitir conexiones desde la red local
- El login acepta tanto email como nombre de usuario
- Las contraseñas nunca se devuelven en las respuestas de la API
- Todos los errores se registran en la consola del servidor
- CORS está configurado para aceptar cualquier origen en desarrollo

---

## 🔄 Próximas Funcionalidades

- [ ] Endpoints para gestión de gasolineras
- [ ] Endpoints para gestión de precios de combustible
- [ ] Sistema de favoritos
- [ ] Gestión de facturas
- [ ] Búsqueda de gasolineras por ubicación
- [ ] Filtrado de gasolineras por servicios
- [ ] Estadísticas de consumo
- [ ] Notificaciones de cambios de precio

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

## � Repositorios Relacionados

Este proyecto forma parte del ecosistema **MyGasolinera**:

- **🎨 Frontend (Flutter):** Aplicación móvil multiplataforma
- **⚙️ Backend (Node.js):** Este repositorio - API REST y servicios

---

## �📧 Contacto

Para preguntas o sugerencias sobre el proyecto, contacta con el equipo de desarrollo:
- Oscar
- Cristian
- David
- Carlos

---

<div align="center">

**MyGasolinera Backend** - Desarrollado con ❤️ por el equipo MyGasolinera

</div>
