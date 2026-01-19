require('dotenv').config();
const pool = require('../config/bbdd');

async function addIndex() {
    try {
        console.log('Adding index to facturas table...');

        // Check if index exists first to be safe across versions
        const [rows] = await pool.query("SHOW INDEX FROM facturas WHERE Key_name = 'idx_facturas_user_date'");

        if (rows.length === 0) {
            await pool.query('CREATE INDEX idx_facturas_user_date ON facturas(id_usuario, fecha DESC, hora DESC)');
            console.log('✅ Index idx_facturas_user_date created successfully.');
        } else {
            console.log('ℹ️ Index idx_facturas_user_date already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Error creating index:', error);
        process.exit(1);
    }
}

addIndex();
