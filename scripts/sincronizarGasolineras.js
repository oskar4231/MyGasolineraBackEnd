const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos (usa la misma que en server.js)
const dbConfig = {
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'mygasolinera',
    charset: 'utf8mb4'
};

const API_URL = 'https://sedeaplicaciones.minetur.gob.es/ServiciosRESTCarburantes/PreciosCarburantes/EstacionesTerrestres/';

class SincronizadorGasolineras {
    constructor() {
        this.connection = null;
        this.estadisticas = {
            total: 0,
            insertadas: 0,
            actualizadas: 0,
            errores: 0,
            duracion: 0
        };
    }

    async conectarBD() {
        try {
            this.connection = await mysql.createConnection(dbConfig);
            console.log('✅ Conectado a la base de datos');
        } catch (error) {
            console.error('❌ Error conectando a la BD:', error.message);
            throw error;
        }
    }

    async desconectarBD() {
        if (this.connection) {
            await this.connection.end();
            console.log('✅ Desconectado de la base de datos');
        }
    }

    parsearPrecio(precioStr) {
        if (!precioStr || precioStr.trim() === '' || precioStr.toUpperCase() === 'N/A') {
            return 0;
        }
        const precioLimpio = precioStr.toString().replace(',', '.');
        return parseFloat(precioLimpio) || 0;
    }

    extraerCodigoPostal(direccion, municipio) {
        if (!direccion) return '';
        
        const cpMatch = direccion.match(/\b\d{5}\b/);
        if (cpMatch) return cpMatch[0];
        
        if (municipio) {
            const cpMunicipio = municipio.match(/\b\d{5}\b/);
            if (cpMunicipio) return cpMunicipio[0];
        }
        
        return '';
    }

    normalizarHorario(horarioStr) {
        if (!horarioStr) return '';
        const horario = horarioStr.toString().trim();
        return horario.toUpperCase().includes('24H') || horario === '1' ? '24H' : horario;
    }

    async obtenerDatosAPI() {
        try {
            console.log('🌐 Conectando a la API del Ministerio...');
            const response = await axios.get(API_URL, { timeout: 30000 });
            
            if (response.status !== 200) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            console.log('✅ Datos obtenidos de la API');
            return response.data;
        } catch (error) {
            console.error('❌ Error obteniendo datos de la API:', error.message);
            throw error;
        }
    }

    procesarDatos(datosAPI) {
        const listaEESS = datosAPI.ListaEESSPrecio || [];
        console.log(`📊 Procesando ${listaEESS.length} gasolineras...`);

        return listaEESS.map(item => {
            const id = item.IDEESS?.toString() || '';
            const rotulo = item.Rótulo?.toString() || 'Sin Nombre';
            const direccion = item.Dirección?.toString() || '';
            const municipio = item.Municipio?.toString() || '';
            const provincia = item.Provincia?.toString() || '';
            
            return {
                id: id,
                rotulo: rotulo,
                direccion: direccion,
                municipio: municipio,
                provincia: provincia,
                cod_postal: this.extraerCodigoPostal(direccion, municipio),
                latitud: this.parsearPrecio(item.Latitud),
                longitud: this.parsearPrecio(item['Longitud (WGS84)']),
                horario: this.normalizarHorario(item.Horario),
                gasolina_95: this.parsearPrecio(item['Precio Gasolina 95 E5']),
                gasolina_95_e10: this.parsearPrecio(item['Precio Gasolina 95 E10']),
                gasolina_98: this.parsearPrecio(item['Precio Gasolina 98 E5']),
                gasoleo_a: this.parsearPrecio(item['Precio Gasoleo A']),
                gasoleo_premium: this.parsearPrecio(item['Precio Gasoleo Premium']),
                glp: this.parsearPrecio(item['Precio Gases licuados del petróleo']),
                biodiesel: this.parsearPrecio(item['Precio Biodiesel']),
                bioetanol: this.parsearPrecio(item['Precio Bioetanol']),
                ester_metilico: this.parsearPrecio(item['Precio Éster metílico']),
                hidrogeno: this.parsearPrecio(item['Precio Hidrogeno'])
            };
        }).filter(gasolinera => 
            gasolinera.id && 
            gasolinera.latitud !== 0 && 
            gasolinera.longitud !== 0
        );
    }

    async sincronizarConBD(gasolineras) {
        const startTime = Date.now();
        
        try {
            await this.connection.beginTransaction();
            
            for (const gasolinera of gasolineras) {
                try {
                    const [rows] = await this.connection.execute(
                        'SELECT id_gasolinera FROM gasolineras WHERE id_gasolinera = ?',
                        [gasolinera.id]
                    );

                    if (rows.length === 0) {
                        await this.connection.execute(`
                            INSERT INTO gasolineras (
                                id_gasolinera, rotulo, direccion, municipio, provincia, 
                                cod_postal, latitud, longitud, horario,
                                gasolina_95, gasolina_95_e10, gasolina_98, gasoleo_a,
                                gasoleo_premium, glp, biodiesel, bioetanol, 
                                ester_metilico, hidrogeno
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, Object.values(gasolinera));
                        this.estadisticas.insertadas++;
                    } else {
                        await this.connection.execute(`
                            UPDATE gasolineras SET
                                rotulo = ?, direccion = ?, municipio = ?, provincia = ?,
                                cod_postal = ?, latitud = ?, longitud = ?, horario = ?,
                                gasolina_95 = ?, gasolina_95_e10 = ?, gasolina_98 = ?,
                                gasoleo_a = ?, gasoleo_premium = ?, glp = ?,
                                biodiesel = ?, bioetanol = ?, ester_metilico = ?, hidrogeno = ?,
                                fecha_actualizacion = CURRENT_TIMESTAMP
                            WHERE id_gasolinera = ?
                        `, [...Object.values(gasolinera).slice(1), gasolinera.id]);
                        this.estadisticas.actualizadas++;
                    }
                } catch (error) {
                    console.error(`❌ Error con gasolinera ${gasolinera.id}:`, error.message);
                    this.estadisticas.errores++;
                }
            }

            await this.connection.commit();
            this.estadisticas.duracion = (Date.now() - startTime) / 1000;
            this.estadisticas.total = gasolineras.length;

        } catch (error) {
            await this.connection.rollback();
            throw error;
        }
    }

    async registrarLog() {
        try {
            await this.connection.execute(`
                INSERT INTO logs_sincronizacion 
                (total_gasolineras, nuevas_gasolineras, gasolineras_actualizadas, duracion_segundos, estado)
                VALUES (?, ?, ?, ?, ?)
            `, [
                this.estadisticas.total,
                this.estadisticas.insertadas,
                this.estadisticas.actualizadas,
                this.estadisticas.duracion,
                this.estadisticas.errores === 0 ? 'exito' : 'parcial'
            ]);
        } catch (error) {
            console.error('❌ Error registrando log:', error.message);
        }
    }

    mostrarEstadisticas() {
        console.log('\n📈 ===== ESTADÍSTICAS DE SINCRONIZACIÓN =====');
        console.log(`🕒 Duración: ${this.estadisticas.duracion.toFixed(2)}s`);
        console.log(`📊 Total: ${this.estadisticas.total}`);
        console.log(`🆕 Nuevas: ${this.estadisticas.insertadas}`);
        console.log(`🔄 Actualizadas: ${this.estadisticas.actualizadas}`);
        console.log(`❌ Errores: ${this.estadisticas.errores}`);
        console.log('==========================================\n');
    }

    async ejecutar() {
        try {
            console.log('🚀 Iniciando sincronización de gasolineras...');
            await this.conectarBD();
            
            const datosAPI = await this.obtenerDatosAPI();
            const gasolineras = this.procesarDatos(datosAPI);
            await this.sincronizarConBD(gasolineras);
            await this.registrarLog();
            
            this.mostrarEstadisticas();
            console.log('✅ Sincronización completada!');
            
        } catch (error) {
            console.error('❌ Error en la sincronización:', error.message);
        } finally {
            await this.desconectarBD();
        }
    }
}

// Ejecutar el script
const sincronizador = new SincronizadorGasolineras();
sincronizador.ejecutar();