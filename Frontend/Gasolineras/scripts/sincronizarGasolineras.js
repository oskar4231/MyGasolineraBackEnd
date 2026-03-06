const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración de la base de datos
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

    // Función para parsear precios (maneja comas decimales)
    parsearPrecio(precioStr) {
        if (!precioStr || precioStr.trim() === '' || precioStr.toUpperCase() === 'N/A') {
            return 0;
        }
        // Reemplazar coma por punto y convertir a número
        const precioLimpio = precioStr.toString().replace(',', '.');
        return parseFloat(precioLimpio) || 0;
    }

    // Función para extraer código postal de la dirección
    extraerCodigoPostal(direccion, municipio) {
        if (!direccion) return '';
        
        // Buscar patrón de código postal (5 dígitos)
        const cpMatch = direccion.match(/\b\d{5}\b/);
        if (cpMatch) {
            return cpMatch[0];
        }
        
        // Si no se encuentra en la dirección, intentar en el municipio
        if (municipio) {
            const cpMunicipio = municipio.match(/\b\d{5}\b/);
            if (cpMunicipio) {
                return cpMunicipio[0];
            }
        }
        
        return '';
    }

    // Función para normalizar horario
    normalizarHorario(horarioStr) {
        if (!horarioStr) return '';
        
        const horario = horarioStr.toString().trim();
        if (horario.toUpperCase().includes('24H') || horario === '1') {
            return '24H';
        }
        
        return horario;
    }

    // Obtener datos de la API del Ministerio
    async obtenerDatosAPI() {
        try {
            console.log('🌐 Conectando a la API del Ministerio...');
            
            const response = await axios.get(API_URL, {
                timeout: 30000,
                headers: {
                    'User-Agent': 'MyGasolineraApp/1.0',
                    'Accept': 'application/json'
                }
            });

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

    // Procesar y transformar los datos
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
                // Precios
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

    // Sincronizar con la base de datos
    async sincronizarConBD(gasolineras) {
        const startTime = Date.now();
        
        try {
            await this.connection.beginTransaction();
            
            for (const gasolinera of gasolineras) {
                try {
                    // Verificar si existe
                    const [rows] = await this.connection.execute(
                        'SELECT id_gasolinera FROM gasolineras WHERE id_gasolinera = ?',
                        [gasolinera.id]
                    );

                    if (rows.length === 0) {
                        // INSERTAR NUEVA
                        await this.connection.execute(`
                            INSERT INTO gasolineras (
                                id_gasolinera, rotulo, direccion, municipio, provincia, 
                                cod_postal, latitud, longitud, horario,
                                gasolina_95, gasolina_95_e10, gasolina_98, gasoleo_a,
                                gasoleo_premium, glp, biodiesel, bioetanol, 
                                ester_metilico, hidrogeno
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        `, [
                            gasolinera.id,
                            gasolinera.rotulo,
                            gasolinera.direccion,
                            gasolinera.municipio,
                            gasolinera.provincia,
                            gasolinera.cod_postal,
                            gasolinera.latitud,
                            gasolinera.longitud,
                            gasolinera.horario,
                            gasolinera.gasolina_95,
                            gasolinera.gasolina_95_e10,
                            gasolinera.gasolina_98,
                            gasolinera.gasoleo_a,
                            gasolinera.gasoleo_premium,
                            gasolinera.glp,
                            gasolinera.biodiesel,
                            gasolinera.bioetanol,
                            gasolinera.ester_metilico,
                            gasolinera.hidrogeno
                        ]);
                        this.estadisticas.insertadas++;
                    } else {
                        // ACTUALIZAR EXISTENTE
                        await this.connection.execute(`
                            UPDATE gasolineras SET
                                rotulo = ?, direccion = ?, municipio = ?, provincia = ?,
                                cod_postal = ?, latitud = ?, longitud = ?, horario = ?,
                                gasolina_95 = ?, gasolina_95_e10 = ?, gasolina_98 = ?,
                                gasoleo_a = ?, gasoleo_premium = ?, glp = ?,
                                biodiesel = ?, bioetanol = ?, ester_metilico = ?, hidrogeno = ?,
                                fecha_actualizacion = CURRENT_TIMESTAMP
                            WHERE id_gasolinera = ?
                        `, [
                            gasolinera.rotulo,
                            gasolinera.direccion,
                            gasolinera.municipio,
                            gasolinera.provincia,
                            gasolinera.cod_postal,
                            gasolinera.latitud,
                            gasolinera.longitud,
                            gasolinera.horario,
                            gasolinera.gasolina_95,
                            gasolinera.gasolina_95_e10,
                            gasolinera.gasolina_98,
                            gasolinera.gasoleo_a,
                            gasolinera.gasoleo_premium,
                            gasolinera.glp,
                            gasolinera.biodiesel,
                            gasolinera.bioetanol,
                            gasolinera.ester_metilico,
                            gasolinera.hidrogeno,
                            gasolinera.id
                        ]);
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

    // Registrar log de sincronización
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

    // Mostrar estadísticas
    mostrarEstadisticas() {
        console.log('\n📈 ===== ESTADÍSTICAS DE SINCRONIZACIÓN =====');
        console.log(`🕒 Duración: ${this.estadisticas.duracion.toFixed(2)} segundos`);
        console.log(`📊 Total procesadas: ${this.estadisticas.total}`);
        console.log(`🆕 Nuevas insertadas: ${this.estadisticas.insertadas}`);
        console.log(`🔄 Actualizadas: ${this.estadisticas.actualizadas}`);
        console.log(`❌ Errores: ${this.estadisticas.errores}`);
        console.log('==========================================\n');
    }

    // Método principal
    async ejecutar() {
        const startTime = Date.now();
        
        try {
            console.log('🚀 Iniciando sincronización de gasolineras...');
            
            await this.conectarBD();
            
            // 1. Obtener datos de la API
            const datosAPI = await this.obtenerDatosAPI();
            
            // 2. Procesar datos
            const gasolineras = this.procesarDatos(datosAPI);
            
            // 3. Sincronizar con BD
            await this.sincronizarConBD(gasolineras);
            
            // 4. Registrar log
            await this.registrarLog();
            
            // 5. Mostrar estadísticas
            this.mostrarEstadisticas();
            
            console.log('✅ Sincronización completada exitosamente!');
            
        } catch (error) {
            console.error('❌ Error en la sincronización:', error.message);
        } finally {
            await this.desconectarBD();
        }
    }
}

module.exports = SincronizadorGasolineras;

// Ejecutar el script solo si se llama directamente (ej. node sincronizarGasolineras.js)
if (require.main === module) {
    const sincronizador = new SincronizadorGasolineras();
    sincronizador.ejecutar().then(() => {
        // Asegurarse de que el proceso cierra al acabar
        process.exit(0);
    }).catch(err => {
        console.error(err);
        process.exit(1);
    });
}