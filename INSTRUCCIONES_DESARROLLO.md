# 📋 Instrucciones de Desarrollo - MyGasolinera

## 🎯 Separación Frontend/Backend

Este proyecto está dividido en dos partes:

### 1. **Frontend (Flutter)** - Este repositorio
- 📁 Ubicación: `MyGasolineraFlutter/`
- 🌐 Puerto: `http://localhost:5000`
- 💻 Tecnología: Flutter/Dart

### 2. **Backend (Java)** - Repositorio separado
- 📁 Ubicación: `../BackendBBDD/`
- 📡 Puerto: `http://localhost:5001`
- 💻 Tecnología: Java + MariaDB

## 🚀 Cómo iniciar el proyecto completo

### Paso 1: Iniciar el Backend

```bash
cd ..\BackendBBDD
start-server.bat
```

O manualmente:
```bash
cd ..\BackendBBDD\basededatosjava
java -cp ".;mariadb-java-client-3.5.6.jar;json-20250517.jar" BBDD
```

Deberías ver: `Servidor iniciado en http://localhost:5001`

### Paso 2: Iniciar el Frontend (Flutter)

Desde VSCode:
1. Presiona `F5` para iniciar el debugger
2. O usa el comando: `flutter run -d chrome --web-port=5000`

La aplicación se abrirá en: `http://localhost:5000`

## 📝 Flujo de trabajo para desarrolladores

### Si trabajas en el **Frontend** (Flutter/Dart):
1. ✅ Haz commits normalmente en este repositorio
2. ✅ No necesitas tocar el backend
3. ✅ Asegúrate de que el backend esté corriendo antes de probar

### Si trabajas en el **Backend** (Java):
1. ✅ Ve a la carpeta `../BackendBBDD/`
2. ✅ Modifica `BBDD.java`
3. ✅ Compila con: `compile.bat`
4. ✅ Reinicia el servidor con: `start-server.bat`
5. ✅ Haz commits en el repositorio del backend (separado)

## 🔧 Configuración de puertos

| Servicio | Puerto | URL |
|----------|--------|-----|
| Flutter Web | 5000 | http://localhost:5000 |
| Backend Java | 5001 | http://localhost:5001 |
| MariaDB | 3306 | localhost:3306 |

## 📡 Endpoints del Backend

- `POST /register` - Crear cuenta
- `POST /login` - Iniciar sesión

## ⚠️ Importante

- **NO modifiques** archivos `.dart` si estás trabajando en el backend
- **NO modifiques** archivos `.java` si estás trabajando en el frontend
- Asegúrate de que **MariaDB esté corriendo** antes de iniciar el backend
- El backend debe estar corriendo **antes** de usar la aplicación Flutter

## 🐛 Solución de problemas

### Error: "Connection refused" en Flutter
- ✅ Verifica que el backend esté corriendo en el puerto 5001
- ✅ Ejecuta: `netstat -ano | findstr :5001`

### Error: "Port already in use" en Flutter
- ✅ Otro proceso está usando el puerto 5000
- ✅ Cambia el puerto en `.vscode/launch.json`

### Error: "Port already in use" en Backend
- ✅ Otro proceso está usando el puerto 5001
- ✅ Mata el proceso: `taskkill /F /PID <PID>`

## 📚 Documentación adicional

- Frontend: Ver `README.md` en este directorio
- Backend: Ver `../BackendBBDD/README.md`

