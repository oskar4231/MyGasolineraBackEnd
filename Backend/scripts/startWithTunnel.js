require('dotenv').config();

const { spawn, execSync } = require('child_process');
const ngrokManager = require('./ngrokManager');

const usePm2 = process.env.USE_PM2 === 'true';

const PORT = process.env.PORT || 3000;

async function startWithTunnel() {
    try {
        console.log('=================================');
        console.log('🚀 INICIANDO SERVIDOR CON NGROK');
        console.log('=================================\n');

        // 1. Iniciar el servidor Express
        let serverProcess;
        if (usePm2) {
            console.log('📦 Paso 1: Iniciando servidor Express con PM2 (Multinúcleo)...');
            execSync('npx pm2 start server.js -i max --name mygasolinera-api', {
                stdio: 'inherit',
                cwd: __dirname + '/../..'
            });
        } else {
            console.log('📦 Paso 1: Iniciando servidor Express...');
            serverProcess = spawn(/^win/.test(process.platform) ? 'node.cmd' : 'node', ['server.js'], {
                stdio: 'inherit',
                cwd: __dirname + '/../..'
            });
        }

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
            if (usePm2) {
                try {
                    execSync('npx pm2 delete mygasolinera-api', { stdio: 'inherit', cwd: __dirname + '/../..' });
                } catch (e) {
                    console.error('Error al detener PM2:', e.message);
                }
            } else if (serverProcess) {
                serverProcess.kill();
            }
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
async function main() {
    // Leer variable desde el .env (1 = Ngrok, 0 = Local)
    const mode = process.env.USE_NGROK || '1';

    if (mode === '0') {
        console.log('=================================');
        console.log('🏠 MODO: LOCALHOST ONLY (Switch = 0)');
        console.log('=================================\n');

        // Start only server
        let serverProcess;
        if (usePm2) {
            console.log('\n📦 Iniciando servidor Express con PM2 (Multinúcleo)...');
            execSync('npx pm2 start server.js -i max --name mygasolinera-api', {
                stdio: 'inherit',
                cwd: __dirname + '/../..'
            });
        } else {
            serverProcess = spawn(/^win/.test(process.platform) ? 'node.cmd' : 'node', ['server.js'], {
                stdio: 'inherit',
                cwd: __dirname + '/../..'
            });
        }

        console.log(`\n✅ SERVIDOR INICIADO EN LOCAL`);
        console.log(`🌐 Local URL: http://localhost:${PORT}`);
        console.log('=================================\n');

        // Handle cleanup for local mode
        const cleanup = () => {
            console.log('\n🛑 Deteniendo servidor...');
            if (usePm2) {
                try {
                    execSync('npx pm2 delete mygasolinera-api', { stdio: 'inherit', cwd: __dirname + '/../..' });
                } catch (e) {
                    console.error('Error al detener PM2:', e.message);
                }
            } else if (serverProcess) {
                serverProcess.kill();
            }
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
