const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');

router.get('/api/gasolineras', async (req, res) => {
    try {
        const { lat, lng, id_provincia } = req.query;

        // Base query
        let query = `
            SELECT 
                id_gasolinera as id,
                rotulo,
                direccion,
                municipio,
                provincia,
                id_provincia as idProvincia,
                latitud,
                longitud,
                horario,
                gasolina_95,
                gasolina_98,
                gasoleo_a,
                glp,
                gasoleo_premium,
                gasolina_95_e10,
                horario,
                (gasoleo_a > 0) as abierto_ahora
            FROM gasolineras 
            WHERE latitud != 0 AND longitud != 0
        `;

        const params = [];

        // 1. Filtro por Provincia (MÁS RÁPIDO PARA CARGA INICIAL)
        if (id_provincia) {
            query += ` AND id_provincia = ?`;
            params.push(id_provincia);
            // Ordenar por precio gasoleo (baratas primero) o rotulo
            query += ` ORDER BY gasoleo_a ASC`;
        }
        // 2. Filtro Geográfico (Cercanía)
        else if (lat && lng) {
            query = `
                SELECT *, 
                    (6371 * acos(cos(radians(?)) * 
                     cos(radians(latitud)) * 
                     cos(radians(longitud) - radians(?)) + 
                     sin(radians(?)) * 
                     sin(radians(latitud)))) as distancia
                FROM (${query}) as gasolineras_filtradas
                HAVING distancia < 50 -- Solo en 50km a la redonda
                ORDER BY distancia ASC
                LIMIT 100
            `;
            // Los params de la subquery (si hubiera) van antes, aquí no hay.
            // Params de la fórmula Haversine: lat, lng, lat
            params.unshift(parseFloat(lat), parseFloat(lng), parseFloat(lat));
        }
        else {
            // Fallback: devolver muestra representativa de todas las provincias
            query += ` ORDER BY provincia, gasoleo_a ASC LIMIT 1000`;
        }

        const [rows] = await pool.execute(query, params);

        res.json({
            success: true,
            count: rows.length,
            gasolineras: rows.map(g => ({
                ...g,
                // Mapeo para compatibilidad con el modelo de Flutter
                lat: parseFloat(g.latitud),
                lng: parseFloat(g.longitud),
                "Precio Gasoleo A": g.gasoleo_a,
                "Precio Gasolina 95 E5": g.gasolina_95,
                "Precio Gasolina 98 E5": g.gasolina_98,
                "Precio Gasoleo Premium": g.gasoleo_premium,
                "Precio Gases licuados del petróleo": g.glp,
                "Rótulo": g.rotulo,
                "Dirección": g.direccion,
                "Horario": g.horario,
                "IDProvincia": g.idProvincia,
                "Provincia": g.provincia
            }))
        });

    } catch (error) {
        console.error('Error obteniendo gasolineras:', error);
        res.status(500).json({
            success: false,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;
