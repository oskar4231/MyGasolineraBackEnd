const axios = require('axios');
const fs = require('fs');
const path = require('path');

class GistService {
    constructor() {
        this.token = process.env.GITHUB_TOKEN;
        this.gistId = process.env.GIST_ID || null;
        this.apiUrl = 'https://api.github.com';
    }

    /**
     * Actualiza o crea un Gist con la URL del backend
     * @param {string} backendUrl - URL del backend (cloudflared)
     * @returns {Promise<string>} - URL del Gist
     */
    async updateBackendUrl(backendUrl) {
        if (!this.token) {
            throw new Error('GITHUB_TOKEN no está configurado en .env');
        }

        const gistContent = {
            backend_url: backendUrl,
            updated_at: new Date().toISOString()
        };

        const gistData = {
            description: 'MyGasolinera Backend URL',
            public: true,
            files: {
                'backend-url.json': {
                    content: JSON.stringify(gistContent, null, 2)
                }
            }
        };

        try {
            let response;

            if (this.gistId) {
                // Actualizar Gist existente
                console.log('📝 Actualizando Gist existente...');
                response = await axios.patch(
                    `${this.apiUrl}/gists/${this.gistId}`,
                    gistData,
                    {
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );
            } else {
                // Crear nuevo Gist
                console.log('📝 Creando nuevo Gist...');
                response = await axios.post(
                    `${this.apiUrl}/gists`,
                    gistData,
                    {
                        headers: {
                            'Authorization': `token ${this.token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }
                );

                // Guardar el ID del Gist en .env
                this.gistId = response.data.id;
                await this.saveGistIdToEnv(this.gistId);
            }

            const gistUrl = response.data.html_url;
            const rawUrl = response.data.files['backend-url.json'].raw_url;

            console.log('✅ Gist actualizado correctamente');
            console.log(`🔗 Gist URL: ${gistUrl}`);
            console.log(`🔗 Raw URL: ${rawUrl}`);

            return rawUrl;
        } catch (error) {
            console.error('❌ Error actualizando Gist:', error.response?.data || error.message);
            throw error;
        }
    }

    /**
     * Obtiene la URL actual del backend desde el Gist
     * @returns {Promise<string>} - URL del backend
     */
    async getCurrentUrl() {
        if (!this.gistId) {
            throw new Error('No hay GIST_ID configurado');
        }

        try {
            const response = await axios.get(
                `${this.apiUrl}/gists/${this.gistId}`,
                {
                    headers: {
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );

            const content = JSON.parse(response.data.files['backend-url.json'].content);
            return content.backend_url;
        } catch (error) {
            console.error('❌ Error obteniendo URL del Gist:', error.message);
            throw error;
        }
    }

    /**
     * Guarda el GIST_ID en el archivo .env
     * @param {string} gistId - ID del Gist
     */
    async saveGistIdToEnv(gistId) {
        const envPath = path.join(__dirname, '..', '.env');

        try {
            let envContent = fs.readFileSync(envPath, 'utf8');

            if (envContent.includes('GIST_ID=')) {
                // Reemplazar GIST_ID existente
                envContent = envContent.replace(/GIST_ID=.*/, `GIST_ID=${gistId}`);
            } else {
                // Añadir GIST_ID al final
                envContent += `\nGIST_ID=${gistId}\n`;
            }

            fs.writeFileSync(envPath, envContent);
            console.log(`✅ GIST_ID guardado en .env: ${gistId}`);
        } catch (error) {
            console.error('⚠️  No se pudo guardar GIST_ID en .env:', error.message);
            console.log(`ℹ️  Añade manualmente a .env: GIST_ID=${gistId}`);
        }
    }
}

module.exports = new GistService();
