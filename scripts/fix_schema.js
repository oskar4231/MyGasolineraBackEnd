const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const pool = require('../config/bbdd');

async function fixSchema() {
    console.log('🔧 Iniciando reparación de esquema...');

    let connection;
    try {
        connection = await pool.getConnection();
        console.log('✅ Conexión a BBDD establecida.');

        // 1. Check if column exists
        // Note: process.env.DB_NAME might be undefined if not loaded correctly, so we default or check
        const dbName = process.env.DB_NAME || 'mygasolinera';

        const [columns] = await connection.query(`
            SELECT COLUMN_NAME 
            FROM INFORMATION_SCHEMA.COLUMNS 
            WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'gasolineras' AND COLUMN_NAME = 'id_provincia'
        `, [dbName]);

        if (columns.length > 0) {
            console.log('ℹ️ La columna "id_provincia" ya existe.');
        } else {
            console.log('⚠️ La columna "id_provincia" NO existe. Creándola...');
            await connection.query(`
                ALTER TABLE gasolineras 
                ADD COLUMN id_provincia VARCHAR(5) NULL AFTER provincia,
                ADD INDEX idx_id_provincia (id_provincia);
            `);
            console.log('✅ Columna "id_provincia" creada correctamente.');
        }

    } catch (error) {
        console.error('❌ Error fatal:', error);
    } finally {
        if (connection) connection.release();
        process.exit(0);
    }
}

fixSchema();
