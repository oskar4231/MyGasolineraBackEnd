require('dotenv').config({ path: __dirname + '/../.env' });
const mysql = require('mysql2/promise');

async function createAdminUser() {
    console.log('📦 Verificando/Creando usuario de base de datos...');

    const dbConfig = {
        host: process.env.DB_HOST || '127.0.0.1',
        user: 'root', // Asumimos root por defecto para tareas administrativas
        password: process.env.DB_ROOT_PASSWORD || '', // Vacío por defecto en local (XAMPP/HeidiSQL)
        port: process.env.DB_PORT || 3306
    };

    let connection;

    try {
        connection = await mysql.createConnection(dbConfig);

        const targetUser = process.env.DB_USER;
        const targetPass = process.env.DB_PASSWORD;
        const dbName = process.env.DB_NAME;

        if (!targetUser || !targetPass || !dbName) {
            console.warn('⚠️ Faltan variables de entorno (DB_USER, DB_PASSWORD, DB_NAME). Saltando creación de usuario.');
            return;
        }

        // 1. Crear usuario si no existe
        // MariaDB/MySQL syntax: CREATE USER IF NOT EXISTS
        try {
            await connection.query(`CREATE USER IF NOT EXISTS ?@'%' IDENTIFIED BY ?`, [targetUser, targetPass]);
            // Nota: En algunos entornos locales 'localhost' es distinto a '%', creamos ambos por seguridad
            await connection.query(`CREATE USER IF NOT EXISTS ?@'localhost' IDENTIFIED BY ?`, [targetUser, targetPass]);
            console.log(`✅ Usuario '${targetUser}' verificado/creado.`);
        } catch (e) {
            console.log(`ℹ️ Nota sobre creación de usuario: ${e.message}`);
        }

        // 2. Crear base de datos si no existe
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
        console.log(`✅ Base de datos '${dbName}' verificada/creada.`);

        // 3. Dar permisos
        await connection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO ?@'%'`, [targetUser]);
        await connection.query(`GRANT ALL PRIVILEGES ON \`${dbName}\`.* TO ?@'localhost'`, [targetUser]);
        await connection.query('FLUSH PRIVILEGES');
        console.log(`✅ Permisos asignados a '${targetUser}' sobre '${dbName}'.`);

    } catch (error) {
        console.warn('⚠️ No se pudo conectar como root para verificar el usuario Admin.');
        console.warn('   Motivo:', error.message);
        console.warn('   Si ya tienes el usuario creado, puedes ignorar este mensaje.');
        console.warn('   Si necesitas configurar la pass de root, añade DB_ROOT_PASSWORD al .env');
    } finally {
        if (connection) await connection.end();
    }
}

createAdminUser();
