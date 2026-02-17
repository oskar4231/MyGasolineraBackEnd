# Documentación Técnica: Lógica del Mapa y Controlador de Gasolineras

Este documento detalla la lógica implementada en el backend (Node.js + MariaDB) para el filtrado, geolocalización y optimización de las consultas de gasolineras. 

## 1. Jerarquía de Filtros y Rendimiento

En el controlador `getGasolineras`, implementamos una estrategia de filtrado en cascada para priorizar el rendimiento según el contexto de uso (carga inicial vs. navegación).

### Nivel 1: Filtro por Provincia (Carga Rápida)
*   **Contexto**: Carga inicial de la app o selección manual de provincia.
*   **Lógica**: `WHERE id_provincia = ?`
*   **Por qué**: Es la consulta más rápida y ligera. Evita cálculos geométricos complejos cuando el usuario solo necesita una lista general.
*   **Ordenación**: Por precio (`gasoleo_a ASC`) para mostrar las más baratas primero.

### Nivel 2: Filtro por Bounding Box (Navegación en Mapa)
*   **Contexto**: Cuando el usuario mueve o hace zoom en el mapa.
*   **Trigger**: Se activa cuando recibimos `swLat`, `swLng`, `neLat`, `neLng`.
*   **Tecnología**: Uso de índices espaciales (R-Tree) mediante la función `MBRContains`.
*   **Ventaja**: Es **extremadamente eficiente** para grandes volúmenes de datos geoespaciales comparado con filtrar por latitud/longitud numérica (`WHERE lat > x AND lat < y`).
*   **Límite**: `LIMIT 500` para evitar saturar el mapa con demasiados marcadores.

### Nivel 3: Filtro Geográfico Radial (Fórmula de Haversine)
*   **Contexto**: Búsqueda "Cerca de mí" o ubicación específica sin contexto de mapa.
*   **Lógica**: Cálculo de distancia trigonométrica "al vuelo" para cada fila.
*   **Fórmula**: 
    ```sql
    (6371 * acos(cos(radians(?)) * cos(radians(latitud)) * cos(radians(longitud) - radians(?)) + sin(radians(?)) * sin(radians(latitud))))
    ```
*   **Desventaja**: Es costosa computacionalmente (Full Table Scan relativo) ya que debe calcular la distancia para todos los registros antes de filtrar (`HAVING distancia < 50`).
*   **Uso**: Se mantiene como alternativa cuando no hay Bounding Box definido.

---

## 2. El Sistema de Coordenadas (El Bug de Lat/Lng)

### El Problema
Durante el desarrollo, nos encontramos con que las consultas espaciales devolvían resultados vacíos o incorrectos. Esto se debió a una **incompatibilidad de estándares**:

*   **Google Maps / Frontend**: Usa el estándar coloquial `Latitud, Longitud` (Y, X).
*   **MariaDB / GIS / OGC**: Usa el estándar matemático cartesiano `X, Y` -> `Longitud, Latitud`.

### La Solución
Al construir los objetos geométricos en el backend, fue imperativo **invertir el orden de las coordenadas**.

```javascript
// INCORRECTO (Causa del bug):
// POINT(lat lng) -> MariaDB interpreta Latitud como X (Longitud)

// CORRECTO (Implementado):
// POINT(lng lat) -> X=Longitud, Y=Latitud
```

Esta inversión asegura que los puntos se proyecten correctamente en el plano espacial de la base de datos.

---

## 3. Construcción del Polígono WKT (Well-Known Text)

Para realizar la búsqueda espacial eficiente, construimos un polígono rectangular (Bounding Box) usando el formato WKT.

### Regla de Oro: El Polígono Cerrado
Un polígono WKT debe "cerrarse" sobre sí mismo. El último punto debe ser **idéntico** al primer punto.

### Construcción del String
La función construye el rectángulo uniendo las 4 esquinas en orden antihorario (o horario, pero secuencial) y cerrando el ciclo:

```javascript
// Variables recibidas del frontend:
// sw (SouthWest - SurOeste), ne (NorthEast - NorEste)

const bbox = `POLYGON((
    ${swLng} ${swLat},  // Punto 1: Esquina Inferior Izquierda
    ${neLng} ${swLat},  // Punto 2: Esquina Inferior Derecha
    ${neLng} ${neLat},  // Punto 3: Esquina Superior Derecha
    ${swLng} ${neLat},  // Punto 4: Esquina Superior Izquierda
    ${swLng} ${swLat}   // Punto 5: Cierre (Vuelta al inicio)
))`;
```

**Nota**: Observar que siempre usamos el orden `${lng} ${lat}`.

---

## 4. Índices Espaciales (MBRContains)

En lugar de usar operadores de comparación simples (`> <`), utilizamos `MBRContains` (Minimum Bounding Rectangle Contains).

*   **Query**: `AND MBRContains(ST_GeomFromText(?), ubicacion)`
*   **Funcionamiento**: MariaDB utiliza el índice espacial de la columna `ubicacion` para descartar rápidamente ramas enteras del árbol de búsqueda que no intersectan con el rectángulo solicitado. Esto convierte una búsqueda O(N) en algo mucho más cercano a O(log N).

---

## 5. Mapeo de Datos (Compatibilidad Frontend)

Para garantizar la estabilidad de la aplicación móvil (Flutter), el backend realiza un mapeo estricto de las columnas de la base de datos a los nombres de claves JSON esperados por el modelo `Gasolinera.fromJson`.

```javascript
// Fragmento del mapeo en el controlador
gasolineras: rows.map(g => ({
    ...g,
    // Convertimos a float para evitar strings numéricos
    lat: parseFloat(g.latitud),
    lng: parseFloat(g.longitud),

    // Mapeo EXACTO a claves esperadas por Flutter
    "Precio Gasoleo A": g.gasoleo_a,
    "Precio Gasolina 95 E5": g.gasolina_95,
    "Precio Gasolina 98 E5": g.gasolina_98,
    "Precio Gasoleo Premium": g.gasoleo_premium,
    "Precio Gases licuados del petróleo": g.glp,
    "Rótulo": g.rotulo,
    "Dirección": g.direccion,
    "Horario": g.horario,
    "IDProvincia": g.idProvincia, // camelCase para consistencia interna
    "Provincia": g.provincia
}))
```

### Por qué hacemos esto:
1.  **Evitar Nulls**: Si la base de datos devuelve `null`, el mapeo nos permite controlar el valor por defecto (aunque aquí pasamos el valor directo, el modelo de Flutter centraliza la gestión de nulls gracias a que las claves coinciden).
2.  **Desacoplamiento**: Si cambiamos los nombres de las columnas en la BBDD (`gasoleo_a` -> `diesel_price`), solo tocamos este mapeo y el frontend no se entera.
3.  **Parsers Específicos**: El método `_parsePrecio` en Flutter busca claves específicas como `"Precio Gasoleo A"`. Si enviamos `gasoleo_a`, el precio aparecería como 0 o null en la app.
