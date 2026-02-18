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

<<<<<<< HEAD
MyGasolinera Backend es una **API REST** desarrollada con Node.js y Express que proporciona servicios de autenticación, gestión de usuarios, vehículos y gasolineras. El sistema utiliza MariaDB como base de datos y JWT para la autenticación segura.
=======
MyGasolinera Backend es una **API REST** desarrollada con Node.js y Express que proporciona servicios de autenticación, gestión de usuarios, vehículos y gasolineras. 

El sistema ha sido modernizado para incluir **acceso remoto seguro** mediante Cloudflare Tunnel, **sincronización automática de precios** con el Ministerio de Transición Ecológica, y **descubrimiento dinámico de URL** mediante GitHub Gists.
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de

> **Nota:** Este es el repositorio del **Backend**. La aplicación móvil Flutter se encuentra en un repositorio separado.

### ✨ Características Principales

- 🔐 **Autenticación segura** con JWT y bcrypt
<<<<<<< HEAD
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
=======
- 👤 **Gestión de usuarios** (registro, login, recuperación de contraseña por email)
- 🚙 **Gestión de vehículos** por usuario
- ⛽ **Sistema de gasolineras** con sincronización automática de precios
- 🌐 **Acceso Remoto Automático** via Cloudflare Tunnel
- 🔄 **URL Dinámica** compartida via GitHub Gist para el frontend
- ⭐ **Favoritos** para guardar gasolineras preferidas
- 🧾 **Gestión de facturas** con subida de imágenes (Multer)
- 🔒 **Middleware de autenticación** para rutas protegidas

---

## 🛠️ Tecnologías y Frameworks

Stack tecnológico del proyecto:

| Tecnología | Versión | Propósito |
|------------|---------|-----------|
| **Node.js** | - | Motor para ejecutar el backend |
| **Express** | ^4.21.2 | Framework para crear la API |
| **MariaDB** | 12.0.2+ | Base de datos principal |
| **mysql2** | ^3.15.3 | Conector con la base de datos |
| **bcryptjs** | ^2.4.3 | Encriptar contraseñas de usuarios |
| **jsonwebtoken** | ^9.0.2 | Autenticación segura y rápida |
| **nodemailer** | ^7.0.11 | Enviar correos de recuperación |
| **multer** | ^2.0.2 | Subir imágenes de facturas |
| **axios** | ^1.5.0 | Peticiones a APIs externas |
| **cloudflared** | - | Acceso remoto sin abrir puertos |

---

## 📦 Instalación y Configuración
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de

### Prerrequisitos

- **Node.js** (v14 o superior)
- **MariaDB** (v12.0.2 o superior)
<<<<<<< HEAD
- **npm** o **yarn**
=======
- **Cloudflared** (instalado y en el PATH del sistema)
- **Cuenta de GitHub** (para integración con Gist)
- **Servidor SMTP** (para recuperación de contraseñas)
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de

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

<<<<<<< HEAD
3. **Configurar variables de entorno**
   
   Crear un archivo `.env` en la raíz del proyecto:
   ```env
   # Configuración de Base de Datos MariaDB
=======
3. **Configurar variables de entorno (.env)**
   
   Crear un archivo `.env` en la raíz con la siguiente configuración:

   ```env
   # Base de Datos
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de
   DB_USER=root
   DB_HOST=127.0.0.1
   DB_NAME=mygasolinera
   DB_PASSWORD=
   DB_PORT=3306

<<<<<<< HEAD
   # JWT Secret
   JWT_SECRET=MyGasolinera

   # Servidor
   PORT=3000
   NODE_ENV=development
=======
   # Servidor
   PORT=3000
   NODE_ENV=development

   # Seguridad
   JWT_SECRET=MyGasolineraSecretKey

   # GitHub Gist (Para compartir URL pública)
   GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
   GIST_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxx # Se autogenera si no existe

   # Email (Recuperación de contraseñas)
   EMAIL_HOST=smtp.mailtrap.io
   EMAIL_PORT=2525
   EMAIL_USER=tu_usuario
   EMAIL_PASS=tu_password
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de
   ```

4. **Crear la base de datos**
   
<<<<<<< HEAD
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
=======
   Usar importar `crear_bbdd/mygasolinera.sql` en tu gestor de base de datos favorito.

---

## 🚀 Scripts y Ejecución

El proyecto incluye scripts avanzados para facilitar el desarrollo y despliegue local accesible públicamente.

### 1. Iniciar con Tunneling (Recomendado)
Este script inicia el servidor, levanta un túnel de Cloudflare, y actualiza automáticamente un Gist privado con la nueva URL pública. Esto permite que la APP móvil siempre sepa a dónde conectarse.

```bash
npm run start:tunnel
```

**Flujo:**
1. Inicia Express en puerto local (3000).
2. Inicia Cloudflared Tunnel apuntando al puerto 3000.
3. Obtiene la URL pública (`https://....trycloudflare.com`).
4. Actualiza el Gist de GitHub con esta URL.

### 2. Sincronizar Gasolineras
Descarga los precios actualizados de todas las gasolineras de España desde la API del Ministerio y actualiza la base de datos local.

```bash
npm run sinc-gasolineras
```

### 3. Otros Comandos

| Comando | Descripción |
|---------|-------------|
| `npm start` | Inicia solo el servidor Express (local) |
| `npm run dev` | Inicia servidor en modo desarrollo (watch) |
| `npm run start-with-sync` | Sincroniza gasolineras y luego inicia el servidor |
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de

---

## 📊 Estructura de la Base de Datos

```mermaid
<<<<<<< HEAD
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
=======
graph LR
    %% Clases de Estilo (Colores)
    classDef usuarioStyle fill:#e0f7fa,stroke:#006064,stroke-width:2px,color:#000
    classDef datoStyle fill:#e8f5e9,stroke:#1b5e20,stroke-width:2px,color:#000
    classDef relacionStyle stroke:#999,stroke-width:1px,stroke-dasharray: 5 5

    %% Nodos (Tablas)
    User(👤 USUARIOS):::usuarioStyle
    Car(🚙 COCHES):::usuarioStyle
    Bill(🧾 FACTURAS):::usuarioStyle
    Fav(⭐ FAVORITOS):::usuarioStyle

    Gas(⛽ GASOLINERAS):::datoStyle
    Price(💰 PRECIOS):::datoStyle
    Serv(🛠️ SERVICIOS):::datoStyle

    %% Relaciones
    User -->|Posee| Car
    User -->|Tiene| Bill
    User -->|Guarda| Fav
    
    Fav -->|Referencia| Gas
    Gas -->|Tiene| Price
    Gas -->|Ofrece| Serv
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de
```

---

<<<<<<< HEAD
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
=======
## 🔌 API Endpoints Principales

### 🔐 Autenticación y Usuario
- `POST /register`: Registro de nuevos usuarios.
- `POST /login`: Inicio de sesión (Retorna JWT).
- `POST /forgot-password`: Solicitar email de recuperación.
- `GET /profile`: Obtener datos del usuario actual.

### ⛽ Gasolineras
- `GET /gasolineras`: Listado de gasolineras (soporta filtros).
- `GET /gasolineras/cercanas`: Buscar por lat/long.

### 🚙 Vehículos
- `GET /coches`: Listar vehículos del usuario.
- `POST /insertCar`: Añadir nuevo vehículo.
- `DELETE /coches/:id`: Eliminar vehículo.

### 🧾 Facturas
- `POST /facturas`: Subir nueva factura (con imagen).
- `GET /facturas`: Listar facturas del usuario.

---

##  Solución de Problemas Comunes

### Error de "Cloudflared no encontrado"
Asegúrate de haber instalado `cloudflared` y que esté accesible en la terminal (PATH). En Windows, puedes instalarlo con `winget install Cloudflare.cloudflared`.

### Error actualizando Gist
Verifica que tu `GITHUB_TOKEN` tenga permisos de **"gists"**. Si es la primera vez, deja `GIST_ID` vacío en el `.env` y el script creará uno nuevo y guardará su ID.

### No se envían correos
Revisa la configuración SMTP en `.env`. Para desarrollo, se recomienda usar **Mailtrap**.
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

<<<<<<< HEAD
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

=======
<div align="center">
  <b>MyGasolinera Backend</b> - 2025
>>>>>>> 01da53e92f4065f94d8fcd4a3e842d0bc8b469de
</div>
