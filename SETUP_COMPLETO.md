# 🚀 Configuración Completa del Proyecto MyGasolinera

## ✅ Estado de Dependencias

### Backend Java
- ✅ **mariadb-java-client-3.5.6.jar** - Configurado
- ✅ **json-20250517.jar** - Configurado
- ✅ **BBDD.java** - Compila sin errores
- ✅ **.vscode/settings.json** - Configurado para VS Code
- ✅ **.classpath** - Configurado para Eclipse
- ✅ **.project** - Configurado para Eclipse

### Frontend Flutter
- ✅ **Dependencies instaladas** - `flutter pub get` ejecutado
- ✅ **image_picker: ^1.0.4** - Instalado
- ✅ **permission_handler: ^11.0.1** - Instalado
- ✅ **cupertino_icons: ^1.0.8** - Instalado

---

## 📋 Instrucciones para Nuevos Desarrolladores

### 1️⃣ Requisitos Previos

**Para el Backend (Java):**
- Java JDK 11 o superior
- PostgreSQL instalado y corriendo en `localhost:5432`
- Base de datos `MyGasolinera` creada
- Tabla `clientes` con columnas `email` y `contraseña`

**Para el Frontend (Flutter):**
- Flutter SDK instalado
- Chrome (para desarrollo web)
- VS Code con extensiones de Flutter/Dart

### 2️⃣ Clonar el Repositorio

```bash
git clone <URL_DEL_REPOSITORIO>
cd BackendBBDD
```

### 3️⃣ Configurar el Backend

**Windows:**
```bash
# Verificar entorno
check-setup.bat

# Compilar
setup.bat

# Iniciar servidor
start-server.bat
```

**Linux/Mac:**
```bash
# Compilar
chmod +x setup.sh
./setup.sh

# Iniciar servidor
cd basededatosjava
java -cp ".:mariadb-java-client-3.5.6.jar:json-20250517.jar" BBDD
```

El servidor estará en: `http://localhost:5001`

### 4️⃣ Configurar el Frontend

```bash
# Instalar dependencias
flutter pub get

# Ejecutar en modo desarrollo
flutter run

# O compilar para producción
flutter build windows  # Para Windows
flutter build apk      # Para Android
flutter build ios      # Para iOS
```

### 5️⃣ Configurar la Base de Datos PostgreSQL

```sql
CREATE DATABASE "MyGasolinera";
\c "MyGasolinera"

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Credenciales:**
- Usuario: `postgres`
- Contraseña: `MyGasolinera`
- Puerto: `5432`
- Base de datos: `MyGasolinera` (con mayúscula M)

---

## 🔧 Configuración del IDE

### VS Code

**Extensiones necesarias:**
1. Extension Pack for Java
2. Flutter
3. Dart

**Archivos de configuración ya incluidos:**
- `.vscode/settings.json` - Configuración de Java y librerías
- `.vscode/launch.json` - Configuración de debug

### Eclipse

**Importar proyecto:**
1. File → Import → Existing Projects into Workspace
2. Selecciona la carpeta del proyecto
3. Los archivos `.classpath` y `.project` ya están configurados

### IntelliJ IDEA

**Importar proyecto:**
1. File → Open
2. Selecciona la carpeta del proyecto
3. IntelliJ detectará automáticamente las configuraciones

---

## 📡 Endpoints del Backend

### POST /register
Registra un nuevo usuario.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Usuario creado correctamente"
}
```

### POST /login
Inicia sesión.

**Request:**
```json
{
  "email": "usuario@example.com",
  "password": "contraseña123"
}
```

**Response (200 OK):**
```json
{
  "status": "success",
  "message": "Login exitoso",
  "email": "usuario@example.com"
}
```

---

## 🐛 Solución de Problemas

### Error: "The import org.json cannot be resolved"

**Solución:**
1. Presiona `Ctrl+Shift+P` en VS Code
2. Ejecuta: `Java: Clean Java Language Server Workspace`
3. Recarga VS Code

Ver más soluciones en: [TROUBLESHOOTING.md](TROUBLESHOOTING.md)

### Error: "Communications link failure" (Base de datos)

**Solución:**
1. Verifica que MariaDB esté corriendo
2. Verifica las credenciales en `BBDD.java`:
   ```java
   miConexion = DriverManager.getConnection(
       "jdbc:mariadb://127.0.0.1:3306/mygasolinera",
       "root",
       ""
   );
   ```

### Error en Flutter: "Pub get failed"

**Solución:**
```bash
flutter clean
flutter pub get
```

---

## 📦 Estructura del Proyecto

```
BackendBBDD/
├── basededatosjava/          # Backend Java
│   ├── BBDD.java             # Servidor HTTP principal
│   ├── BBDD.class            # Clase compilada
│   ├── mariadb-java-client-3.5.6.jar
│   └── json-20250517.jar
├── lib/                      # Frontend Flutter
│   ├── main.dart             # Punto de entrada
│   ├── Inicio/               # Pantallas de inicio
│   └── assets/               # Assets locales
├── assets/                   # Assets globales
│   └── images/
├── .vscode/                  # Configuración VS Code
│   └── settings.json
├── .classpath                # Configuración Eclipse
├── .project                  # Configuración Eclipse
├── pubspec.yaml              # Dependencias Flutter
├── setup.bat                 # Script de configuración (Windows)
├── setup.sh                  # Script de configuración (Linux/Mac)
├── start-server.bat          # Iniciar servidor (Windows)
├── check-setup.bat           # Verificar entorno (Windows)
└── README.md                 # Documentación principal
```

---

## 🔐 Seguridad

⚠️ **IMPORTANTE:** Este proyecto está en desarrollo y tiene las siguientes limitaciones de seguridad:

1. **Contraseñas en texto plano** - Las contraseñas NO están hasheadas
2. **Sin autenticación JWT** - No hay tokens de sesión
3. **CORS abierto** - Acepta peticiones de cualquier origen

**Para producción, implementa:**
- Hashing de contraseñas (BCrypt, Argon2)
- Autenticación con JWT
- HTTPS/SSL
- Validación de entrada
- Rate limiting
- CORS restrictivo

---

## 📝 Notas Adicionales

- El backend escucha en `0.0.0.0:5001` (todas las interfaces)
- El frontend Flutter se conecta a `http://localhost:5001`
- Los logs del servidor se muestran en la consola
- Las librerías JAR están incluidas en el repositorio (no necesitas descargarlas)

---

## 🤝 Contribuir

1. Haz fork del proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📄 Licencia

Este proyecto es privado y está en desarrollo.

---

## 📞 Soporte

Si tienes problemas:
1. Revisa [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. Ejecuta `check-setup.bat` para verificar tu entorno
3. Revisa los logs del servidor
4. Abre un issue en el repositorio

