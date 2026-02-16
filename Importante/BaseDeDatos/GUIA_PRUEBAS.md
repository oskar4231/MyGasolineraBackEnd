# Guía de Pruebas: Endpoint con Bounding Box

## Paso 1: Reiniciar el Servidor

```bash
# Detener el servidor actual (Ctrl+C)
# Luego ejecutar:
npm run start:tunnel
```

Espera a que veas la URL de ngrok en la consola (ej: `https://xxxx-xxxx.ngrok.io`)

---

## Paso 2: Pruebas del Endpoint

Reemplaza `TU_URL_NGROK` con la URL que te muestra ngrok.

### Test 1: Bounding Box - Valencia Centro ✨ NUEVO
```bash
curl "TU_URL_NGROK/api/gasolineras?swLat=39.45&swLng=-0.40&neLat=39.48&neLng=-0.35"
```

**Resultado esperado:**
- ✅ Solo gasolineras en el centro de Valencia
- ✅ Respuesta rápida (~10-50ms)
- ✅ Entre 10-30 gasolineras

### Test 2: Bounding Box - Madrid Centro ✨ NUEVO
```bash
curl "TU_URL_NGROK/api/gasolineras?swLat=40.40&swLng=-3.72&neLat=40.43&neLng=-3.68"
```

**Resultado esperado:**
- ✅ Solo gasolineras en el centro de Madrid
- ✅ Entre 15-50 gasolineras

### Test 3: Compatibilidad - Filtro por Provincia
```bash
curl "TU_URL_NGROK/api/gasolineras?id_provincia=46"
```

**Resultado esperado:**
- ✅ Todas las gasolineras de Valencia
- ✅ Comportamiento sin cambios

### Test 4: Compatibilidad - Filtro por Cercanía
```bash
curl "TU_URL_NGROK/api/gasolineras?lat=39.4699&lng=-0.3763"
```

**Resultado esperado:**
- ✅ Gasolineras en 50km a la redonda de Valencia
- ✅ Ordenadas por distancia
- ✅ Comportamiento sin cambios

---

## Paso 3: Verificar Rendimiento en Base de Datos

Ejecuta en HeidiSQL para confirmar que usa el índice espacial:

```sql
EXPLAIN SELECT * FROM gasolineras 
WHERE MBRContains(
    ST_GeomFromText('POLYGON((-0.40 39.45, -0.35 39.45, -0.35 39.48, -0.40 39.48, -0.40 39.45))'), 
    ubicacion
);
```

**Buscar en resultado:** `key: idx_ubicacion` ✅

---

## Formato de Respuesta JSON

Todos los endpoints devuelven el mismo formato:

```json
{
  "success": true,
  "count": 25,
  "gasolineras": [
    {
      "id": "10034",
      "rotulo": "GALP",
      "lat": 39.471861,
      "lng": -0.505333,
      "Precio Gasoleo A": 1.479,
      "Precio Gasolina 95 E5": 1.349,
      ...
    }
  ]
}
```

---

## Integración con Flutter

```dart
// Al mover/hacer zoom en el mapa
void _onCameraMove(CameraPosition position) async {
  LatLngBounds bounds = await mapController.getVisibleRegion();
  
  final response = await http.get(
    Uri.parse('$baseUrl/api/gasolineras').replace(
      queryParameters: {
        'swLat': bounds.southwest.latitude.toString(),
        'swLng': bounds.southwest.longitude.toString(),
        'neLat': bounds.northeast.latitude.toString(),
        'neLng': bounds.northeast.longitude.toString(),
      },
    ),
  );
  
  if (response.statusCode == 200) {
    final data = jsonDecode(response.body);
    setState(() {
      gasolineras = data['gasolineras'];
    });
  }
}
```

---

## Troubleshooting

### Error: "Column 'ubicacion' not found"
→ El script SQL no se ejecutó. Vuelve a ejecutar `migration_add_spatial_column.sql`

### Error: "MBRContains not recognized"
→ Verifica versión de MariaDB: `SELECT VERSION();` (debe ser ≥ 5.0)

### Respuesta vacía con Bounding Box
→ Verifica el orden de coordenadas: `POLYGON((lng lat, ...))` no `(lat lng, ...)`

### Servidor no reinicia
→ Detén con Ctrl+C y ejecuta: `npm run start:tunnel`
