# 🔧 Solución de Problemas

## Error: "The import org.json cannot be resolved"

### Causa
El IDE no encuentra las librerías JAR necesarias.

### Solución para VS Code

1. **Verifica que tengas instalada la extensión de Java**:
   - Abre VS Code
   - Ve a Extensiones (Ctrl+Shift+X)
   - Busca e instala: "Extension Pack for Java"

2. **Limpia el workspace de Java**:
   - Presiona `Ctrl+Shift+P`
   - Escribe: `Java: Clean Java Language Server Workspace`
   - Selecciona la opción y confirma
   - Recarga VS Code cuando se te pida

3. **Verifica la configuración**:
   - Abre `.vscode/settings.json`
   - Debe contener:
   ```json
   {
       "java.project.sourcePaths": ["basededatosjava"],
       "java.project.referencedLibraries": [
           "basededatosjava/mariadb-java-client-3.5.6.jar",
           "basededatosjava/json-20250517.jar"
       ]
   }
   ```

4. **Recarga la ventana**:
   - Presiona `Ctrl+Shift+P`
   - Escribe: `Developer: Reload Window`

### Solución para Eclipse

1. Click derecho en el proyecto → `Properties`
2. Ve a `Java Build Path` → `Libraries`
3. Click en `Add JARs...`
4. Selecciona:
   - `basededatosjava/mariadb-java-client-3.5.6.jar`
   - `basededatosjava/json-20250517.jar`
5. Click `Apply and Close`

### Solución para IntelliJ IDEA

1. `File` → `Project Structure` → `Modules`
2. Selecciona tu módulo
3. Ve a la pestaña `Dependencies`
4. Click en `+` → `JARs or directories`
5. Selecciona ambos archivos JAR de la carpeta `basededatosjava/`
6. Click `OK`

---

## Error al compilar desde línea de comandos

### Windows

Asegúrate de usar punto y coma (`;`) como separador:
```bash
javac -cp ".;mariadb-java-client-3.5.6.jar;json-20250517.jar" BBDD.java
```

### Linux/Mac

Usa dos puntos (`:`) como separador:
```bash
javac -cp ".:mariadb-java-client-3.5.6.jar:json-20250517.jar" BBDD.java
```

---

## Error: "java: package com.sun.net.httpserver does not exist"

### Causa
Estás usando una versión de Java que no incluye `com.sun.net.httpserver` o estás usando un JRE en lugar de un JDK.

### Solución
1. Instala Java JDK (no JRE) versión 11 o superior
2. Descarga desde: https://www.oracle.com/java/technologies/downloads/
3. Verifica la instalación:
   ```bash
   java -version
   javac -version
   ```

---

## Error de conexión a la base de datos

### Error: "Communications link failure"

**Causa**: MariaDB no está corriendo o no está accesible.

**Solución**:
1. Verifica que MariaDB esté corriendo:
   - Windows: Abre "Servicios" y busca "MariaDB"
   - O ejecuta: `mysql -u root -p`

2. Verifica la configuración en `BBDD.java`:
   ```java
   miConexion = DriverManager.getConnection(
       "jdbc:mariadb://127.0.0.1:3306/mygasolinera",
       "root",
       ""
   );
   ```

### Error: "Unknown database 'mygasolinera'"

**Solución**: Crea la base de datos:
```sql
CREATE DATABASE mygasolinera;
USE mygasolinera;

CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## El servidor no inicia

### Error: "Address already in use"

**Causa**: El puerto 5001 ya está siendo usado por otro proceso.

**Solución**:

**Windows**:
```bash
# Ver qué proceso usa el puerto 5001
netstat -ano | findstr :5001

# Matar el proceso (reemplaza PID con el número que aparece)
taskkill /PID <PID> /F
```

**Linux/Mac**:
```bash
# Ver qué proceso usa el puerto 5001
lsof -i :5001

# Matar el proceso
kill -9 <PID>
```

---

## Las librerías JAR no están en el repositorio

Si por alguna razón las librerías no se clonaron:

### Descargar manualmente

1. **MariaDB Connector/J**:
   - URL: https://mariadb.com/downloads/connectors/connectors-data-access/java8-connector/
   - Versión: 3.5.6
   - Coloca el JAR en: `basededatosjava/mariadb-java-client-3.5.6.jar`

2. **JSON-java (org.json)**:
   - URL: https://github.com/stleary/JSON-java
   - O desde Maven Central: https://repo1.maven.org/maven2/org/json/json/
   - Versión: 20250517
   - Coloca el JAR en: `basededatosjava/json-20250517.jar`

---

## Otros problemas

Si ninguna de estas soluciones funciona:

1. Ejecuta `setup.bat` para verificar la configuración
2. Revisa los logs en la consola cuando ejecutes el servidor
3. Verifica que tienes permisos de lectura en la carpeta del proyecto
4. Asegúrate de que no hay antivirus bloqueando Java

Si el problema persiste, abre un issue en el repositorio con:
- Sistema operativo
- Versión de Java (`java -version`)
- IDE que estás usando
- Mensaje de error completo

