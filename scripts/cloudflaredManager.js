const { spawn } = require('child_process');
const path = require('path');

class CloudflaredManager {
    constructor() {
        this.tunnelUrl = null;
        this.process = null;
    }

    /**
     * Inicia cloudflared y captura la URL del tunnel
     * @param {number} port - Puerto del servidor local
     * @param {number} timeout - Tiempo máximo de espera en ms (default: 30000)
     * @returns {Promise<string>} - URL del tunnel HTTPS
     */
    async startTunnel(port = 3000, timeout = 30000) {
        return new Promise((resolve, reject) => {
            console.log('🚇 Iniciando cloudflared tunnel...');

            // Ruta del ejecutable de cloudflared (en carpeta cloudflaredWindowsClase)
            const cloudflaredPath = path.join(__dirname, '..', 'cloudflaredWindowsClase', 'cloudflared.exe');

            // Spawn cloudflared process
            this.process = spawn(cloudflaredPath, ['tunnel', '--url', `http://localhost:${port}`]);

            let output = '';
            const timeoutId = setTimeout(() => {
                if (!this.tunnelUrl) {
                    this.process.kill();
                    reject(new Error('Timeout: No se pudo obtener la URL del tunnel'));
                }
            }, timeout);

            // Capturar output de stderr (cloudflared escribe ahí)
            this.process.stderr.on('data', (data) => {
                output += data.toString();

                // Buscar la URL en el output
                // Formato: https://xxxxx.trycloudflare.com
                const urlMatch = output.match(/https:\/\/[a-zA-Z0-9-]+\.trycloudflare\.com/);

                if (urlMatch && !this.tunnelUrl) {
                    this.tunnelUrl = urlMatch[0];
                    clearTimeout(timeoutId);
                    console.log(`✅ Tunnel activo: ${this.tunnelUrl}`);
                    resolve(this.tunnelUrl);
                }
            });

            this.process.on('error', (error) => {
                clearTimeout(timeoutId);
                console.error('❌ Error al iniciar cloudflared:', error.message);
                reject(new Error(`No se pudo iniciar cloudflared: ${error.message}`));
            });

            this.process.on('exit', (code) => {
                if (code !== 0 && !this.tunnelUrl) {
                    clearTimeout(timeoutId);
                    reject(new Error(`Cloudflared terminó con código ${code}`));
                }
            });
        });
    }

    /**
     * Detiene el tunnel de cloudflared
     */
    stop() {
        if (this.process) {
            console.log('🛑 Deteniendo cloudflared...');
            this.process.kill();
            this.process = null;
            this.tunnelUrl = null;
        }
    }

    /**
     * Obtiene la URL actual del tunnel
     * @returns {string|null}
     */
    getUrl() {
        return this.tunnelUrl;
    }
}

module.exports = new CloudflaredManager();
