const express = require('express');
const router = express.Router();
const pool = require('../config/bbdd');
const authenticateToken = require('../middleware/auth');

router.get('gasolineras', authenticateToken, async (req, res) =>{

});

router.post('/gasolineras/sincronizar', authenticateToken, async (req, res) => {
    const connection = await pool.getConnection();
    
    try {
        const { gasolineras } = req.body;
        
        if (!gasolineras || !Array.isArray(gasolineras)) {
            return res.status(400).json({
                success: false,
                message: 'Se requiere un array de gasolineras'
            });
        }

        await connection.beginTransaction();
        
        let nuevas = 0;
        let actualizadas = 0;
        const startTime = Date.now();

        for (const gasolinera of gasolineras) {
            // Verificar si existe
            const [existing] = await connection.execute(
                'SELECT id_gasolinera FROM gasolineras WHERE id_gasolinera = ?',
                [gasolinera.id]
            );

            if (existing.length === 0) {
                // Insertar nueva gasolinera
                await connection.execute(`
                    INSERT INTO gasolineras (
                        id_gasolinera, rotulo, direccion, municipio, provincia, 
                        latitud, longitud, horario,
                        gasolina_95, gasolina_95_e10, gasolina_98, gasoleo_a,
                        gasoleo_premium, glp, biodiesel, bioetanol, 
                        ester_metilico, hidrogeno
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                `, [
                    gasolinera.id,
                    gasolinera.rotulo,
                    gasolinera.direccion,
                    gasolinera.municipio || '',
                    gasolinera.provincia || '',
                    gasolinera.lat,
                    gasolinera.lng,
                    gasolinera.horario || '',
                    gasolinera.gasolina95 || 0,
                    gasolinera.gasolina95E10 || 0,
                    gasolinera.gasolina98 || 0,
                    gasolinera.gasoleoA || 0,
                    gasolinera.gasoleoPremium || 0,
                    gasolinera.glp || 0,
                    gasolinera.biodiesel || 0,
                    gasolinera.bioetanol || 0,
                    gasolinera.esterMetilico || 0,
                    gasolinera.hidrogeno || 0
                ]);
                nuevas++;
            } else {
                // Actualizar gasolinera existente
                await connection.execute(`
                    UPDATE gasolineras SET
                        rotulo = ?, direccion = ?, municipio = ?, provincia = ?,
                        latitud = ?, longitud = ?, horario = ?,
                        gasolina_95 = ?, gasolina_95_e10 = ?, gasolina_98 = ?,
                        gasoleo_a = ?, gasoleo_premium = ?, glp = ?,
                        biodiesel = ?, bioetanol = ?, ester_metilico = ?, hidrogeno = ?,
                        fecha_actualizacion = CURRENT_TIMESTAMP
                    WHERE id_gasolinera = ?
                `, [
                    gasolinera.rotulo,
                    gasolinera.direccion,
                    gasolinera.municipio || '',
                    gasolinera.provincia || '',
                    gasolinera.lat,
                    gasolinera.lng,
                    gasolinera.horario || '',
                    gasolinera.gasolina95 || 0,
                    gasolinera.gasolina95E10 || 0,
                    gasolinera.gasolina98 || 0,
                    gasolinera.gasoleoA || 0,
                    gasolinera.gasoleoPremium || 0,
                    gasolinera.glp || 0,
                    gasolinera.biodiesel || 0,
                    gasolinera.bioetanol || 0,
                    gasolinera.esterMetilico || 0,
                    gasolinera.hidrogeno || 0,
                    gasolinera.id
                ]);
                actualizadas++;
            }
        }

        await connection.commit();
        
        const duracion = (Date.now() - startTime) / 1000;
        
        // Registrar log de sincronización
        await connection.execute(`
            INSERT INTO logs_sincronizacion 
            (total_gasolineras, nuevas_gasolineras, gasolineras_actualizadas, duracion_segundos, estado)
            VALUES (?, ?, ?, ?, ?)
        `, [gasolineras.length, nuevas, actualizadas, duracion, 'exito']);

        res.json({
            success: true,
            message: `Sincronización completada: ${nuevas} nuevas, ${actualizadas} actualizadas`,
            nuevas,
            actualizadas,
            total: gasolineras.length,
            duracion: `${duracion.toFixed(2)}s`
        });

    } catch (error) {
        await connection.rollback();
        console.error('Error sincronizando gasolineras:', error);
        
        res.status(500).json({
            success: false,
            message: 'Error sincronizando gasolineras'
        });
    } finally {
        connection.release();
    }
});

module.exports = router;

