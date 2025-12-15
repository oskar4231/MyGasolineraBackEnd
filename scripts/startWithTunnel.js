require('dotenv').config();
const { spawn } = require('child_process');
const cloudflaredManager = require('./cloudflaredManager');
const gistService = require('../services/gistService');

const PORT = process.env.PORT || 3000;

async function startWithTunnel() {
    try {
        console.log('=================================');
        console.log('🚀 INICIANDO SERVIDOR CON TUNNEL');
        console.log('=================================\n');

        // 1. Iniciar el servidor Express
        console.log('📦 Paso 1: Iniciando servidor Express...');
        const serverProcess = spawn('node', ['server.js'], {
            stdio: 'inherit',
            cwd: __dirname + '/..'
        });

        // Esperar un poco para que el servidor inicie
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 2. Iniciar cloudflared tunnel
        console.log('\n📦 Paso 2: Iniciando cloudflared tunnel...');
        const tunnelUrl = await cloudflaredManager.startTunnel(PORT);

        // 3. Actualizar Gist con la URL
        console.log('\n📦 Paso 3: Actualizando GitHub Gist...');
        const gistUrl = await gistService.updateBackendUrl(tunnelUrl);

        console.log('\n=================================');
        console.log('✅ SISTEMA INICIADO CORRECTAMENTE');
        console.log('=================================');
        console.log(`🌐 Backend URL: ${tunnelUrl}`);
        console.log(`📝 Gist URL: ${gistUrl}`);
        console.log('=================================\n');
        console.log('ℹ️  El frontend puede obtener la URL desde:');
        console.log(`   ${gistUrl}\n`);
        console.log('⚠️  Presiona Ctrl+C para detener el servidor y el tunnel\n');

        // Manejar cierre graceful
        process.on('SIGINT', () => {
            console.log('\n🛑 Deteniendo servicios...');
            cloudflaredManager.stop();
            serverProcess.kill();
            process.exit(0);
        });

        process.on('SIGTERM', () => {
            console.log('\n🛑 Deteniendo servicios...');
            cloudflaredManager.stop();
            serverProcess.kill();
            process.exit(0);
        });

    } catch (error) {
        console.error('\n❌ Error durante el inicio:', error.message);
        cloudflaredManager.stop();
        process.exit(1);
    }
}

// Iniciar
startWithTunnel();
