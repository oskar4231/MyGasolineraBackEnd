const pool = require('../../../Importante/BaseDeDatos/bbdd');
const logger = require('../../../Backend/Logger/LoggerLogica/logger');
const QUERIES = require('../../../Importante/BaseDeDatos/queries');
const NodeCache = require('node-cache');

// Caché en RAM: stdTTL 900 segundos (15 minutos coincidiendo con el CronJob)
const cache = new NodeCache({ stdTTL: 900 });

exports.getGasolineras = async (req, res) => {
    try {
        const { lat, lng, id_provincia, swLat, swLng, neLat, neLng } = req.query;

        // Generar clave única para la caché
        const cacheKey = `gasolineras_${lat || ''}_${lng || ''}_${id_provincia || ''}_${swLat || ''}_${swLng || ''}_${neLat || ''}_${neLng || ''}`;

        const cachedResponse = cache.get(cacheKey);
        if (cachedResponse) {
            // Devolver desde RAM (saltando MySQL)
            return res.json(cachedResponse);
        }

        // Base query (sin horario duplicado)
        let query = QUERIES.GASOLINERAS.BASE_SELECT;
        const params = [];

        // 1. Filtro por Provincia (más rápido para carga inicial)
        if (id_provincia) {
            query += QUERIES.GASOLINERAS.FILTER_PROVINCIA;
            params.push(String(id_provincia).trim());
        }
        // 2. Filtro por Bounding Box (óptimo para mapas)
        else if (swLat && swLng && neLat && neLng) {
            query += QUERIES.GASOLINERAS.FILTER_BBOX;
            params.push(parseFloat(swLat), parseFloat(neLat), parseFloat(swLng), parseFloat(neLng));
        }
        // 3. Filtro Geográfico por Cercanía (búsqueda radial Haversine)
        else if (lat && lng) {
            query = QUERIES.GASOLINERAS.FILTER_HAVERSINE(query);
            params.unshift(parseFloat(lat), parseFloat(lng), parseFloat(lat));
        }
        // 4. Fallback: muestra representativa
        else {
            query += QUERIES.GASOLINERAS.FILTER_FALLBACK;
        }

        const [rows] = await pool.execute(query, params);

        const responseData = {
            success: true,
            count: rows.length,
            gasolineras: rows.map(g => ({
                ...g,
                lat: parseFloat(g.latitud),
                lng: parseFloat(g.longitud),
                'Precio Gasoleo A': g.gasoleo_a,
                'Precio Gasolina 95 E5': g.gasolina_95,
                'Precio Gasolina 98 E5': g.gasolina_98,
                'Precio Gasoleo Premium': g.gasoleo_premium,
                'Precio Gases licuados del petróleo': g.glp,
                'Rótulo': g.rotulo,
                'Dirección': g.direccion,
                'Horario': g.horario,
                'IDProvincia': g.idProvincia,
                'Provincia': g.provincia,
            }))
        };

        // Guardar la respuesta cocinada en Caché
        cache.set(cacheKey, responseData);

        res.json(responseData);

    } catch (error) {
        logger.error('Error obteniendo gasolineras:', { error: error.message, stack: error.stack });
        res.status(500).json({ success: false, message: 'Error interno del servidor' });
    }
};
