# 🚀 Cómo Iniciar MyGasolinera

## ⚡ Inicio Rápido

### 1️⃣ Asegúrate de que PostgreSQL esté corriendo

Verifica que PostgreSQL esté activo en el puerto 5432.

### 2️⃣ Compila el backend (solo la primera vez)

```bash
cd basededatosjava
javac -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD.java
cd ..
```

### 3️⃣ Inicia el servidor backend

**Abre una terminal y ejecuta:**

```bash
cd basededatosjava
java -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD
```

**Deberías ver:**
```
Servidor iniciado en http://localhost:5001
```

⚠️ **IMPORTANTE:** Deja esta terminal abierta. El servidor debe estar corriendo todo el tiempo.

### 4️⃣ Inicia Flutter en Chrome

**Abre OTRA terminal y ejecuta:**

```bash
flutter run -d chrome
```

---

## ❌ Error: "ERR_CONNECTION_REFUSED"

### Causa
El backend Java no está corriendo en el puerto 5001.

### Solución

1. **Verifica que el backend esté corriendo:**
   - Debes tener una terminal abierta con el mensaje: `Servidor iniciado en http://localhost:5001`
   - Si no la tienes, ejecuta el paso 3️⃣ de arriba

2. **Verifica que el puerto 5001 esté libre:**
   ```bash
   netstat -ano | findstr :5001
   ```
   - Si ves algo, significa que el puerto está en uso
   - Mata el proceso o cambia el puerto en `BBDD.java`

3. **Prueba la conexión manualmente:**
   - Abre Chrome
   - Ve a: `http://127.0.0.1:5001/register`
   - Deberías ver un error de "Method Not Allowed" (esto es normal, significa que el servidor está corriendo)

---

## 🔧 Verificación Paso a Paso

### ✅ Checklist:

- [ ] PostgreSQL está corriendo (puerto 5432)
- [ ] Base de datos `MyGasolinera` existe (con mayúscula M)
- [ ] Tabla `clientes` con columnas `email` y `contraseña` existe
- [ ] Backend compilado (archivo `BBDD.class` existe en `basededatosjava/`)
- [ ] Backend corriendo (ves el mensaje "Servidor iniciado...")
- [ ] Flutter ejecutándose en Chrome

---

## 📋 Comandos Completos

### Terminal 1 - Backend:
```bash
cd basededatosjava
java -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD
```

### Terminal 2 - Frontend:
```bash
flutter run -d chrome
```

---

## 🐛 Otros Problemas Comunes

### "No se puede conectar a PostgreSQL"
- Verifica que PostgreSQL esté corriendo
- Verifica las credenciales en `BBDD.java` (líneas 41 y 154):
  - Usuario: `postgres`
  - Contraseña: `MyGasolinera`

### "ClassNotFoundException: org.postgresql.Driver"
- Verifica que `postgresql-42.7.8.jar` esté en la carpeta `basededatosjava/`
- Recompila el backend

### "Port 5001 already in use"
- Otro proceso está usando el puerto 5001
- Encuentra el proceso: `netstat -ano | findstr :5001`
- Mátalo: `taskkill /F /PID <número>`

---

## 💡 Tip

Crea dos terminales en VS Code:
1. **Terminal 1:** Backend (siempre corriendo)
2. **Terminal 2:** Flutter (para desarrollo)

Así no tienes que abrir ventanas separadas.

