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

MyGasolinera Backend es una **API REST** desarrollada con Node.js y Express que proporciona servicios de autenticación, gestión de usuarios, vehículos y gasolineras. 

El sistema ha sido modernizado para incluir **acceso remoto seguro** mediante Cloudflare Tunnel/Ngrok, **sincronización automática de precios** con el Ministerio de Transición Ecológica, y **descubrimiento dinámico de URL**.

> **Nota:** Este es el repositorio del **Backend**. La aplicación móvil Flutter se encuentra en un repositorio separado.

### ✨ Características Principales

- 🔐 **Autenticación segura** con JWT y bcrypt
- 👤 **Gestión de usuarios** (registro, login, recuperación de contraseña por email)
- 🚙 **Gestión de vehículos** por usuario
- ⛽ **Sistema de gasolineras** con sincronización automática de precios
- 🌐 **Acceso Remoto Automático** via Ngrok
- ⭐ **Favoritos** para guardar gasolineras preferidas
- 🧾 **Gestión de facturas** con subida de imágenes (Multer)
- 🔒 **Middleware de autenticación** para rutas protegidas

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
| **multer** | ^2.0.2 | Subida de archivos |

---

## 📦 Instalación

### Prerrequisitos

- **Node.js** (v14 o superior)
- **MariaDB** (v12.0.2 o superior)
- **npm** o **yarn**
- **Ngrok** (Opcional, para acceso remoto)

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

3. **Configurar variables de entorno (.env)**
   
   Crear un archivo `.env` en la raíz con la siguiente configuración:

   ```env
   # Base de Datos
   DB_USER=root
   DB_HOST=127.0.0.1
   DB_NAME=mygasolinera
   DB_PASSWORD=
   DB_PORT=3306

   # Servidor
   PORT=3000
   NODE_ENV=development

   # Seguridad
   JWT_SECRET=MyGasolinera

   # Email (Recuperación de contraseñas)
   EMAIL_HOST=smtp.gmail.com
   EMAIL_PORT=587
   EMAIL_USER=tu_correo@gmail.com
   EMAIL_PASS=tu_contraseña_de_aplicacion
   
   # Interruptor de Entorno (0 = Localhost, 1 = Ngrok)
   USE_NGROK=1
   ```

4. **Crear la base de datos**
   
   Ejecutar el script SQL incluido en base de datos.

5. **Iniciar el servidor**
   ```bash
   # Modo desarrollo (con auto-reload)
   npm run dev
   ```

El servidor estará disponible en `http://localhost:3000`

---

## 🚀 Scripts y Ejecución

El proyecto incluye scripts avanzados para facilitar el desarrollo y despliegue local accesible públicamente.

### 1. Iniciar con Tunneling (Ngrok)
Este script inicia el servidor y levanta un túnel de Ngrok dependiendo del valor de la variable de entorno `USE_NGROK` que hayas especificado en el archivo `.env`. Este es el comportamiento recomendado para probar con la app móvil.

```bash
npm run start:tunnel
```

**Flujo:**
1. Lee `USE_NGROK` de tu `.env`.
2. Si es 0: Inicia Express en puerto local (3000) de forma normal.
3. Si es 1: Inicia Ngrok apuntando al puerto 3000 exponiendo la URL.

### 2. Sincronizar Gasolineras
Descarga los precios actualizados de todas las gasolineras de España desde la API del Ministerio y actualiza la base de datos local.

```bash
npm run sinc-gasolineras
```

### 3. Tests
Asegúrate de que no haya roto nada:
```bash
npm run test
```

---

## 📊 Estructura de la Base de Datos

```mermaid
    USER ||--o{ CAR : posee
    USER ||--o{ BILL : tiene
    USER ||--o{ FAV : guarda
    
    FAV ||--o{ GAS : "es favorita"
    GAS ||--o{ PRICE : tiene
    GAS ||--o{ SERV : ofrece
```

---

## 🔌 API Endpoints Principales

### 🔐 Autenticación y Usuario
- `POST /register`: Registro de nuevos usuarios.
- `POST /login`: Inicio de sesión (Retorna JWT). El login permite iniciar sesión con correo o con username. El token siempre incrustará el correo del usuario para evitar bugs.
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

## 📝 Changelog (Último Sprint)

### Mejoras de Arquitectura
- **Simplificación del Entorno:** Se ha migrado y centralizado toda la configuración del sistema a un único archivo `.env` maestro (Base de datos, Email, e Interruptores), eliminando lecturas innecesarias en el sistema de archivos (ej. `switch.txt`).
- **Sistema Ngrok optimizado:** El script `startWithTunnel.js` ha sido reescrito para no depender del File System y reaccionar directamente al modificador `USE_NGROK` integrado de la configuración de Node, haciendo que iniciar el modo local o remoto sea tan simple como encender un switch en el `.env`.
- **Integración para Tests:** Se ha modificado el `package.json` para inyectar automáticamente la variable `NODE_ENV=test` al correr los scripts de tests de Jest, maximizando la velocidad de ejecución y previniendo colisiones de BD a través de Express.
- **Servidor de Correos:** La recuperación de cuenta se ha actualizado para basarse en el servidor **Gmail/SMTP**, dejando detrás Mailtrap para avanzar hacia una implementación en producción real.

---

## 📄 Licencia

Este proyecto está bajo la licencia **MIT**.

---

## 🔗 Repositorios Relacionados

Este proyecto forma parte del ecosistema **MyGasolinera**:

- **🎨 Frontend (Flutter):** Aplicación móvil multiplataforma
- **⚙️ Backend (Node.js):** Este repositorio - API REST y servicios

---

## 📧 Contacto

Para preguntas o sugerencias sobre el proyecto, contacta con el equipo de desarrollo:
- Oscar
- Cristian
- David
- Carlos

---

<div align="center">
  <b>MyGasolinera Backend</b> - 2026
</div>
