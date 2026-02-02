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
            cwd: __dirname + '/../..'
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
        if (ngrokManager.stop) ngrokManager.stop();
        process.exit(1);
    }
}

// Iniciar
const fs = require('fs');
const path = require('path');

async function main() {
    const switchPath = path.join(__dirname, '..', '..', 'Importante', 'Sistema', 'switch.txt');
    let mode = '1'; // Default to Ngrok

    if (fs.existsSync(switchPath)) {
        const content = fs.readFileSync(switchPath, 'utf8');
        // Get first line, remove comments (# or //), and trim whitespace
        mode = content.split('\n')[0]
            .split('#')[0]
            .split('//')[0]
            .trim();
    } else {
        console.warn('⚠️ No se encontró Importante/switch.txt, creando uno por defecto (1 - Ngrok)...');
        // Ensure Importante dir exists
        const importanteDir = path.dirname(switchPath);
        if (!fs.existsSync(importanteDir)) {
            fs.mkdirSync(importanteDir, { recursive: true });
        }
        fs.writeFileSync(switchPath, '1');
    }

    if (mode === '0') {
        console.log('=================================');
        console.log('🏠 MODO: LOCALHOST ONLY (Switch = 0)');
        console.log('=================================\n');

        // Start only server
        const serverProcess = spawn('node', ['server.js'], {
            stdio: 'inherit',
            cwd: __dirname + '/../..'
        });

        console.log(`\n✅ SERVIDOR INICIADO EN LOCAL`);
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log('=================================\n');

        // Handle cleanup for local mode
        const cleanup = () => {
            console.log('\n🛑 Deteniendo servidor...');
            serverProcess.kill();
            process.exit(0);
        };
        process.on('SIGINT', cleanup);
        process.on('SIGTERM', cleanup);

    } else {
        console.log('=================================');
        console.log('☁️ MODO: NGROK TUNNEL (Switch = 1)');
        console.log('=================================\n');
        await startWithTunnel();
    }
}

main();
