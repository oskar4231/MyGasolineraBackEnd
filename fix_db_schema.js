require('dotenv').config();
const pool = require('./config/bbdd');

async function fixSchema() {
    let conn;
    try {
        console.log('Conectando a la base de datos...');
        conn = await pool.getConnection();
        console.log('Conexión exitosa.');

        console.log('Añadiendo columna "activo" a la tabla "usuarios"...');
        // Usamos ADD COLUMN IF NOT EXISTS para evitar errores si ya existe (MariaDB 10.2+)
        // Si la versión es antigua, fallará si ya existe, lo cual también es aceptable como confirmación.
        await conn.query('ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS activo boolean DEFAULT 1');

        console.log('¡Columna "activo" añadida correctamente!');

    } catch (error) {
        if (error.code === 'ER_DUP_FIELDNAME') {
            console.log('La columna "activo" ya existe. No se necesitan cambios.');
        } else {
            console.error('Error al actualizar el esquema:', error);
        }
    } finally {
        if (conn) conn.release();
        // Cerrar el pool para terminar el script
        await pool.end();
    }
}

fixSchema();
