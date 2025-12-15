const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');

router.get('/gasolineras', authenticateToken, async (req, res) => {
    try {
        const { lat, lng } = req.query;
        
        let query = `
            SELECT 
                id_gasolinera as id,
                rotulo,
                direccion,
                municipio,
                provincia,
                latitud,
                longitud,
                horario,
                gasolina_95,
                gasolina_98,
                gasoleo_a,
                glp
            FROM gasolineras 
            WHERE latitud != 0 AND longitud != 0
        `;
        
        const params = [];

        // Si hay coordenadas, obtener las 50 más cercanas
        if (lat && lng) {
            query = `
                SELECT *, 
                    (6371 * acos(cos(radians(?)) * 
                     cos(radians(latitud)) * 
                     cos(radians(longitud) - radians(?)) + 
                     sin(radians(?)) * 
                     sin(radians(latitud)))) as distancia
                FROM (${query}) as gasolineras_filtradas
                ORDER BY distancia
                LIMIT 50
            `;
            params.push(parseFloat(lat), parseFloat(lng), parseFloat(lat));
        } else {
            // Sin coordenadas, obtener todas
            query += ` ORDER BY rotulo`;
        }

        const [gasolineras] = await pool.execute(query, params);

        res.json({
            success: true,
            count: gasolineras.length,
            gasolineras: gasolineras
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

