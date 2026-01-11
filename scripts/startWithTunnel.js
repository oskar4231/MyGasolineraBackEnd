require('dotenv').config();
const { spawn } = require('child_process');
const ngrokManager = require('./ngrokManager');

const PORT = process.env.PORT || 3000;

async function startWithTunnel() {
    try {
        console.log('=================================');
        console.log('🚀 INICIANDO SERVIDOR CON NGROK');
        console.log('=================================\n');

        // 1. Iniciar el servidor Express
        console.log('📦 Paso 1: Iniciando servidor Express...');
        const serverProcess = spawn('node', ['server.js'], {
            stdio: 'inherit',
            cwd: __dirname + '/..'
        });

        // Esperar un poco para que el servidor inicie
        await new Promise(resolve => setTimeout(resolve, 3000));

        // 2. Iniciar ngrok tunnel
        console.log('\n📦 Paso 2: Iniciando ngrok tunnel...');
        const tunnelUrl = await ngrokManager.startTunnel(PORT);

        console.log('\n=================================');
        console.log('✅ SISTEMA INICIADO CORRECTAMENTE');
        console.log('=================================');
        console.log(`🌐 Backend URL: ${tunnelUrl}`);
        console.log('=================================\n');
        console.log('⚠️  Presiona Ctrl+C para detener el servidor y el tunnel\n');

        // Manejar cierre graceful
        const cleanup = () => {
            console.log('\n🛑 Deteniendo servicios...');
            ngrokManager.stop();
            serverProcess.kill();
            process.exit(0);
        };

        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } catch (error) {
        console.error('\n❌ Error durante el inicio:', error.message);
        ngrokManager.stop();
        process.exit(1);
    }
}

// Iniciar
startWithTunnel();
