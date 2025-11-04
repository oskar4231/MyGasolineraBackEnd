# 🔄 Cómo Reiniciar el Backend

## ⚡ Pasos Rápidos

### 1️⃣ Detén el servidor actual

En la terminal donde está corriendo el backend, presiona:

```
Ctrl + C
```

### 2️⃣ Recompila el código

```bash
cd basededatosjava
javac -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD.java
```

### 3️⃣ Reinicia el servidor

```bash
java -cp ".;postgresql-42.7.8.jar;json-20250517.jar" BBDD
```

Deberías ver:
```
Servidor iniciado en http://localhost:5001
```

### 4️⃣ Recarga la página en Chrome

Presiona `F5` o `Ctrl + R` en Chrome para recargar la aplicación Flutter.

---

## ✅ Ahora debería funcionar

El error de CORS está solucionado. Ahora puedes:

1. Ir a "Crear Cuenta"
2. Ingresar email y contraseña
3. Click en "Crear"
4. ✅ Debería funcionar correctamente

---

## 🔍 Verificar en DBeaver

Después de crear una cuenta, verifica en DBeaver:

```sql
SELECT * FROM clientes;
```

Deberías ver el usuario que acabas de registrar.

