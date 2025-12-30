const axios = require('axios');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuración DB igual que server.js
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
        this.estadisticas = { total: 0, nuevos: 0, actualizados: 0, errores: 0, duracion: 0 };
    }

    async conectarBD() {
        this.connection = await mysql.createConnection(dbConfig);
        console.log('✅ Conectado a la BD');
    }

    async desconectarBD() {
        if (this.connection) await this.connection.end();
    }

    parsearPrecio(str) {
        if (!str) return 0.0;
        return parseFloat(str.toString().replace(',', '.')) || 0.0;
    }

    normalizarHorario(str) {
        if (!str) return '';
        const h = str.toString().trim();
        return (h.includes('24H') || h === '1') ? '24H' : h;
    }

    async ejecutar() {
        const start = Date.now();
        console.log('🚀 Iniciando sincronización optimizada...');
        
        try {
            await this.conectarBD();
            const { data } = await axios.get(API_URL);
            const lista = data.ListaEESSPrecio || [];
            console.log(`📥 Descargadas ${lista.length} gasolineras. Procesando...`);

            // Preparar datos para inserción masiva (Batch)
            const valores = [];
            
            for (const item of lista) {
                const id = item.IDEESS;
                if (!id) continue;

                valores.push([
                    id,
                    item.Rótulo || 'Sin Nombre',
                    item.Dirección || '',
                    item.Municipio || '',
                    item.Provincia || '',
                    item.IDProvincia || '', // Nuevo campo ID Provincia
                    item.C_P || '',
                    this.parsearPrecio(item.Latitud),
                    this.parsearPrecio(item['Longitud (WGS84)']),
                    this.normalizarHorario(item.Horario),
                    this.parsearPrecio(item['Precio Gasolina 95 E5']),
                    this.parsearPrecio(item['Precio Gasolina 95 E10']),
                    this.parsearPrecio(item['Precio Gasolina 98 E5']),
                    this.parsearPrecio(item['Precio Gasoleo A']),
                    this.parsearPrecio(item['Precio Gasoleo Premium']),
                    this.parsearPrecio(item['Precio Gases licuados del petróleo']),
                    this.parsearPrecio(item['Precio Biodiesel']),
                    this.parsearPrecio(item['Precio Bioetanol']),
                    this.parsearPrecio(item['Precio Éster metílico']),
                    this.parsearPrecio(item['Precio Hidrogeno'])
                ]);
            }

            // Usar INSERT ... ON DUPLICATE KEY UPDATE para rendimiento masivo
            const sql = `
                INSERT INTO gasolineras (
                    id_gasolinera, rotulo, direccion, municipio, provincia, id_provincia,
                    cod_postal, latitud, longitud, horario,
                    gasolina_95, gasolina_95_e10, gasolina_98, gasoleo_a,
                    gasoleo_premium, glp, biodiesel, bioetanol, 
                    ester_metilico, hidrogeno
                ) VALUES ?
                ON DUPLICATE KEY UPDATE
                    rotulo = VALUES(rotulo), direccion = VALUES(direccion), 
                    municipio = VALUES(municipio), provincia = VALUES(provincia), id_provincia = VALUES(id_provincia),
                    cod_postal = VALUES(cod_postal), latitud = VALUES(latitud), longitud = VALUES(longitud),
                    horario = VALUES(horario), gasolina_95 = VALUES(gasolina_95),
                    gasolina_95_e10 = VALUES(gasolina_95_e10), gasolina_98 = VALUES(gasolina_98),
                    gasoleo_a = VALUES(gasoleo_a), gasoleo_premium = VALUES(gasoleo_premium),
                    glp = VALUES(glp), biodiesel = VALUES(biodiesel), bioetanol = VALUES(bioetanol),
                    ester_metilico = VALUES(ester_metilico), hidrogeno = VALUES(hidrogeno),
                    fecha_actualizacion = NOW()
            `;

            // Ejecutar en lotes de 1000 para no saturar memoria
            const loteSize = 1000;
            for (let i = 0; i < valores.length; i += loteSize) {
                const lote = valores.slice(i, i + loteSize);
                await this.connection.query(sql, [lote]);
                process.stdout.write(`.` ); // Progreso visual
            }

            this.estadisticas.total = valores.length;
            this.estadisticas.duracion = (Date.now() - start) / 1000;
            console.log(`\n✅ Sincronización terminada en ${this.estadisticas.duracion}s.`);

            // Log simple en DB
            await this.connection.execute(
                'INSERT INTO logs_sincronizacion (total_gasolineras, estado, duracion_segundos) VALUES (?, ?, ?)',
                [this.estadisticas.total, 'exito', this.estadisticas.duracion]
            );

        } catch (error) {
            console.error('\n❌ Error fatal:', error);
        } finally {
            await this.desconectarBD();
        }
    }
}

new SincronizadorGasolineras().ejecutar();