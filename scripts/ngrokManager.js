const { spawn } = require('child_process');
const path = require('path');

class NgrokManager {
    constructor() {
        this.process = null;
        this.domain = 'rectricial-dewayne-collusive.ngrok-free.dev';
        this.url = `https://${this.domain}`;
    }

    /**
     * Inicia ngrok usando el binario portable
     * @param {number} port - Puerto del servidor local
     * @returns {Promise<string>} - URL del tunnel
     */
    async startTunnel(port = 3000) {
        return new Promise((resolve, reject) => {
            console.log('🚇 Iniciando ngrok tunnel...');

            let ngrokExecutable;

            if (process.env.PLATFORM === 'linux') {
                ngrokExecutable = path.join(__dirname, '..', 'NgrokLinux', 'ngrok');
                console.log('🐧 Modo Linux: Usando binario en NgrokLinux/ngrok');
            } else {
                ngrokExecutable = path.join(__dirname, '..', 'NgrokWindows', 'ngrok.exe');
                console.log('🪟 Modo Windows: Usando binario en NgrokWindows/ngrok.exe');
            }

            // El comando para usar un dominio estático
            // ngrok http --domain=rectricial-dewayne-collusive.ngrok-free.dev 3000
            const args = ['http', `--domain=${this.domain}`, port.toString()];

            this.process = spawn(ngrokExecutable, args);

            this.process.stdout.on('data', (data) => {
                // Ngrok no suele soltar la URL por stdout de forma limpia en modo terminal
                // Pero como es permanente, ya la sabemos.
            });

            this.process.on('error', (error) => {
                console.error('❌ Error al iniciar ngrok:', error.message);
                reject(error);
            });

            // Pequeña espera para asegurar que inicia
            setTimeout(() => {
                console.log(`✅ Tunnel solicitado para: ${this.url}`);
                resolve(this.url);
            }, 2000);
        });
    }

    stop() {
        if (this.process) {
            console.log('🛑 Deteniendo ngrok...');
            this.process.kill();
            this.process = null;
        }
    }
}

module.exports = new NgrokManager();
