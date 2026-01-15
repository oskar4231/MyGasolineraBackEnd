require('dotenv').config({ path: '../.env' }); // Ajustar path si lo corro desde scripts/
const pool = require('../config/bbdd');

async function checkDatabase() {
    try {
        console.log('🔌 Intentando conectar a la base de datos...');
        console.log('Host:', process.env.DB_HOST);
        console.log('User:', process.env.DB_USER);
        console.log('DB Name:', process.env.DB_NAME);
        // No mostrar password

        const [rows] = await pool.query('SELECT * FROM usuarios ORDER BY id_usuario DESC LIMIT 5');

        console.log('✅ Conexión exitosa');
        console.log(`📊 Total de usuarios encontrados (mostrando últimos 5): ${rows.length}`);

        if (rows.length > 0) {
            console.table(rows.map(u => ({
                id: u.id_usuario,
                email: u.email,
                nombre: u.nombre,
                activo: u.activo,
                foto_perfil: u.foto_perfil ? 'Sí' : 'No'
            })));
        } else {
            console.log('⚠️ La tabla usuarios está vacía');
        }

        // Verificar si la tabla tiene la columna 'activo'
        const [columns] = await pool.query('SHOW COLUMNS FROM usuarios');
        const activoCol = columns.find(c => c.Field === 'activo');
        if (!activoCol) {
            console.error('❌ CRÍTICO: La columna "activo" NO existe en la tabla usuarios');
        } else {
            console.log('✅ Columna "activo" detectada correctamente');
        }

    } catch (error) {
        console.error('❌ Error fatal de conexión o consulta:', error);
    } finally {
        await pool.end();
    }
}

checkDatabase();
