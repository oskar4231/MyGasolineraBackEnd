# Guía de Uso: Endpoint de Gasolineras con Bounding Box

## Descripción General

El endpoint `/api/gasolineras` ahora soporta **3 modos de filtrado** optimizados para diferentes casos de uso:

1. **Filtro por Provincia** - Carga inicial rápida
2. **Filtro por Bounding Box** - Óptimo para mapas interactivos (NUEVO ✨)
3. **Filtro por Cercanía** - Búsqueda radial tradicional

---

## 1. Filtro por Bounding Box (NUEVO)

### Descripción
Devuelve solo las gasolineras visibles en el área del mapa mostrado en pantalla. Usa índice espacial para máximo rendimiento.

### Parámetros de Query
```
swLat  - Latitud de la esquina suroeste (inferior izquierda)
swLng  - Longitud de la esquina suroeste (inferior izquierda)
neLat  - Latitud de la esquina noreste (superior derecha)
neLng  - Longitud de la esquina noreste (superior derecha)
```

### Ejemplo de Uso

#### JavaScript (Fetch API)
```javascript
// Coordenadas del viewport del mapa (ejemplo: Madrid centro)
const bounds = {
    swLat: 40.400,  // Esquina inferior izquierda
    swLng: -3.720,
    neLat: 40.430,  // Esquina superior derecha
    neLng: -3.680
};

const url = `http://localhost:3000/api/gasolineras?swLat=${bounds.swLat}&swLng=${bounds.swLng}&neLat=${bounds.neLat}&neLng=${bounds.neLng}`;

const response = await fetch(url);
const data = await response.json();

console.log(`Gasolineras encontradas: ${data.count}`);
console.log(data.gasolineras);
```

#### cURL
```bash
curl "http://localhost:3000/api/gasolineras?swLat=40.400&swLng=-3.720&neLat=40.430&neLng=-3.680"
```

#### Flutter (Google Maps)
```dart
// Obtener bounds del mapa visible
LatLngBounds bounds = await mapController.getVisibleRegion();

final url = Uri.parse('http://tu-servidor.com/api/gasolineras').replace(
  queryParameters: {
    'swLat': bounds.southwest.latitude.toString(),
    'swLng': bounds.southwest.longitude.toString(),
    'neLat': bounds.northeast.latitude.toString(),
    'neLng': bounds.northeast.longitude.toString(),
  },
);

final response = await http.get(url);
final data = jsonDecode(response.body);
```

### Respuesta Esperada
```json
{
  "success": true,
  "count": 45,
  "gasolineras": [
    {
      "id": "10034",
      "rotulo": "GALP - AMERICAN PETROL",
      "direccion": "AVINGUDA COMARQUES DEL PAIS VALENCIA, 103",
      "municipio": "Quart de Poblet",
      "provincia": "VALENCIA / VALÈNCIA",
      "lat": 39.471861,
      "lng": -0.505333,
      "Precio Gasoleo A": 1.479,
      "Precio Gasolina 95 E5": 1.349,
      "Horario": "24H",
      ...
    },
    ...
  ]
}
```

---

## 2. Filtro por Provincia (Sin cambios)

### Parámetros
```
id_provincia - Código de provincia (ej: "28" para Madrid, "46" para Valencia)
```

### Ejemplo
```bash
curl "http://localhost:3000/api/gasolineras?id_provincia=28"
```

---

## 3. Filtro por Cercanía (Sin cambios)

### Parámetros
```
lat - Latitud del punto central
lng - Longitud del punto central
```

### Ejemplo
```bash
curl "http://localhost:3000/api/gasolineras?lat=40.4168&lng=-3.7038"
```

Devuelve gasolineras en un radio de 50km ordenadas por distancia.

---

## Migración de Base de Datos

### Antes de usar el filtro por Bounding Box

**IMPORTANTE**: Debes ejecutar el script de migración SQL primero:

```bash
# Conectar a MariaDB
mysql -u root -p mygasolinera

# Ejecutar el script
source C:/Users/davcabbur/Documents/MyGasolineraBackend/MyGasolineraBackEnd/Importante/BaseDeDatos/migration_add_spatial_column.sql
```

O desde HeidiSQL:
1. Abrir el archivo `migration_add_spatial_column.sql`
2. Ejecutar todo el script (F9)
3. Verificar que el índice `idx_ubicacion` se creó correctamente

---

## Verificación de Rendimiento

### Comprobar que se usa el índice espacial

```sql
EXPLAIN SELECT * FROM gasolineras 
WHERE MBRContains(
    ST_GeomFromText('POLYGON((-3.72 40.40, -3.68 40.40, -3.68 40.43, -3.72 40.43, -3.72 40.40))'), 
    ubicacion
);
```

**Resultado esperado**: La columna `key` debe mostrar `idx_ubicacion`

### Comparación de rendimiento

```sql
-- SIN índice espacial (escaneo completo de tabla)
-- Tiempo: ~500-1000ms con 12,000 registros
SELECT COUNT(*) FROM gasolineras 
WHERE latitud BETWEEN 40.40 AND 40.43 
  AND longitud BETWEEN -3.72 AND -3.68;

-- CON índice espacial (búsqueda optimizada)
-- Tiempo: ~5-20ms con 12,000 registros
SELECT COUNT(*) FROM gasolineras 
WHERE MBRContains(
    ST_GeomFromText('POLYGON((-3.72 40.40, -3.68 40.40, -3.68 40.43, -3.72 40.43, -3.72 40.40))'), 
    ubicacion
);
```

---

## Notas Técnicas

### Orden de Coordenadas en POLYGON
⚠️ **IMPORTANTE**: El formato WKT usa `(longitud latitud)`, NO `(latitud longitud)`

```javascript
// ✅ CORRECTO
const bbox = `POLYGON((${lng} ${lat}, ...))`;

// ❌ INCORRECTO
const bbox = `POLYGON((${lat} ${lng}, ...))`;
```

### Límite de Resultados
- **Bounding Box**: Máximo 500 gasolineras por consulta
- **Cercanía**: Máximo 100 gasolineras en 50km
- **Provincia**: Sin límite (todas las gasolineras de la provincia)

### Compatibilidad
✅ El nuevo filtro NO rompe la API existente
✅ Los clientes que usen `id_provincia` o `lat/lng` siguen funcionando
✅ El formato JSON de respuesta es idéntico
