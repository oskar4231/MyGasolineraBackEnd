require('dotenv').config();
const pool = require('../config/bbdd');

async function addActivoColumn() {
    let conn;
    try {
        console.log('Conectando a la base de datos...');
        conn = await pool.getConnection();

        console.log('Agregando columna "activo" a la tabla usuarios...');

        // Add the activo column if it doesn't exist
        await conn.query(`
      ALTER TABLE usuarios 
      ADD COLUMN IF NOT EXISTS activo tinyint(1) DEFAULT 1
    `);

        console.log('✓ Columna "activo" agregada exitosamente');

        // Update existing users to be active
        const [result] = await conn.query(`
      UPDATE usuarios SET activo = 1 WHERE activo IS NULL
    `);

        console.log(`✓ ${result.affectedRows} usuarios actualizados a activo = 1`);

        // Verify the column was added
        const [columns] = await conn.query(`
      DESCRIBE usuarios
    `);

        console.log('\nEstructura de la tabla usuarios:');
        console.table(columns);

        console.log('\n✅ Migración completada exitosamente!');

    } catch (error) {
        console.error('❌ Error durante la migración:', error.message);
        process.exit(1);
    } finally {
        if (conn) conn.release();
        process.exit(0);
    }
}

addActivoColumn();
