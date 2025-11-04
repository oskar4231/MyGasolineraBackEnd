# MyGasolinera

<p align="center">
  <img src="banner.png" alt="MyGasolinera" width="1000">
</p>

## 📱 Sobre el Proyecto

Una aplicación Flutter full-stack para gestionar información de gasolineras, con backend en Java y base de datos MariaDB.

### 🏗️ Arquitectura

- **Frontend**: Flutter/Dart (multiplataforma)
- **Backend**: Java HTTP Server (puerto 5001)
- **Base de datos**: PostgreSQL (puerto 5432)
- **APIs**: REST JSON

---

## 🚀 Inicio Rápido

### 1️⃣ Instalar Dependencias Flutter

```bash
flutter pub get
```

### 2️⃣ Configurar Base de Datos PostgreSQL

```sql
CREATE DATABASE mygasolinera;

-- Conectarse a la base de datos mygasolinera
\c mygasolinera

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    contraseña VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Credenciales por defecto:**
- Usuario: `postgres`
- Contraseña: `MyGasolinera`
- Puerto: `5432`
- Base de datos: `mygasolinera`

### 3️⃣ Compilar el Backend

```bash
cd basededatosjava
javac -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD.java
```

### 4️⃣ Iniciar el Backend

```bash
cd basededatosjava
java -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD
```

El servidor estará disponible en: `http://localhost:5001`

### 5️⃣ Iniciar el Frontend

```bash
flutter run
```

---

## 📚 Documentación Completa

- **[SETUP_COMPLETO.md](SETUP_COMPLETO.md)** - Guía completa de configuración
- **[TROUBLESHOOTING.md](TROUBLESHOOTING.md)** - Solución de problemas comunes
- **[INSTRUCCIONES_DESARROLLO.md](INSTRUCCIONES_DESARROLLO.md)** - Guía de desarrollo

---

## 🛠️ Tecnologías

### Backend
- Java 11+
- HTTP Server (com.sun.net.httpserver)
- PostgreSQL JDBC Driver 42.7.8
- JSON-java (org.json)

### Frontend
- Flutter 3.9.2+
- Dart
- image_picker
- permission_handler

---

## 📡 API Endpoints

### POST /register
Registra un nuevo usuario.

### POST /login
Inicia sesión con email y contraseña.

Ver documentación completa en [SETUP_COMPLETO.md](SETUP_COMPLETO.md)

---

## 📁 Estructura del Proyecto

```
MyGasolinera/
├── basededatosjava/          # Backend Java
│   ├── BBDD.java
│   ├── postgresql-42.7.8.jar
│   └── json-20250517.jar
├── lib/                      # Frontend Flutter
│   ├── main.dart
│   └── Inicio/
├── assets/                   # Recursos
├── .vscode/                  # Configuración IDE
├── pubspec.yaml              # Dependencias Flutter
└── README.md
```

---

## ⚠️ Notas de Seguridad

Este proyecto está en **desarrollo** y tiene limitaciones de seguridad:
- Contraseñas en texto plano (sin hashing)
- Sin autenticación JWT
- CORS abierto

**No usar en producción sin implementar medidas de seguridad adecuadas.**

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

---

## 📞 Soporte

¿Problemas? Consulta:
1. [TROUBLESHOOTING.md](TROUBLESHOOTING.md)
2. [SETUP_COMPLETO.md](SETUP_COMPLETO.md)

---

## 📄 Recursos Flutter

- [Documentación Flutter](https://docs.flutter.dev/)
- [Lab: Primera app Flutter](https://docs.flutter.dev/get-started/codelab)
- [Cookbook: Ejemplos Flutter](https://docs.flutter.dev/cookbook)
