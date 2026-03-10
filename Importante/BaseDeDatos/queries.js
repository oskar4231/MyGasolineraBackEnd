// =============================================================
// MÓDULO CENTRALIZADO DE QUERIES SQL
// Organizado por sección. Importar en los controladores con:
//   const QUERIES = require('../../../Importante/BaseDeDatos/queries');
//   pool.query(QUERIES.AUTH.FIND_BY_EMAIL, [email])
// =============================================================

const QUERIES = {

  // ─────────────────────────────────────────────────────────────
  // AUTH — Usuarios, registro, login, recuperación de contraseña
  // ─────────────────────────────────────────────────────────────
  AUTH: {
    CHECK_EMAIL_EXISTS:
      'SELECT email FROM usuarios WHERE email = ?',

    INSERT_USUARIO:
      'INSERT INTO usuarios (email, contraseña, nombre) VALUES (?, ?, ?)',

    // Fix: paréntesis para correcta precedencia OR/AND
    LOGIN_BY_EMAIL_OR_NOMBRE:
      'SELECT * FROM usuarios WHERE (email = ? OR nombre = ?) AND activo = 1',

    DEACTIVATE_USER:
      'UPDATE usuarios SET activo = 0 WHERE id_usuario = ?',

    CHECK_USER_ACTIVE:
      'SELECT id_usuario, activo FROM usuarios WHERE id_usuario = ?',

    GET_EMAIL_BY_NOMBRE:
      'SELECT email FROM usuarios WHERE nombre = ?',

    GET_FOTO_PERFIL:
      'SELECT foto_perfil FROM usuarios WHERE email = ?',

    GET_PERFIL:
      'SELECT nombre, email FROM usuarios WHERE (email = ? OR nombre = ?) AND activo = 1',

    INSERT_RESET_TOKEN:
      'INSERT INTO token_reiniciar_contraseña (email, token, expires_at) VALUES (?, ?, ?)',

    VERIFY_RESET_TOKEN:
      'SELECT * FROM token_reiniciar_contraseña WHERE token = ? AND used = FALSE AND expires_at > NOW()',

    UPDATE_PASSWORD:
      'UPDATE usuarios SET contraseña = ? WHERE email = ?',

    MARK_TOKEN_USED:
      'UPDATE token_reiniciar_contraseña SET used = TRUE WHERE token = ?',
  },

  // ─────────────────────────────────────────────────────────────
  // PERFIL — Datos de perfil y foto
  // ─────────────────────────────────────────────────────────────
  PERFIL: {
    GET_PROFILE:
      'SELECT email, nombre, foto_perfil FROM usuarios WHERE id_usuario = ?',

    GET_OLD_PHOTO:
      'SELECT foto_perfil FROM usuarios WHERE id_usuario = ?',

    UPDATE_PHOTO:
      'UPDATE usuarios SET foto_perfil = ? WHERE id_usuario = ?',
  },

  // ─────────────────────────────────────────────────────────────
  // COCHES — CRUD de vehículos y combustibles
  // ─────────────────────────────────────────────────────────────
  COCHES: {
    GET_USUARIO_ID:
      'SELECT id_usuario FROM usuarios WHERE email = ?',

    CHECK_COCHE_EXISTS:
      'SELECT id_coche FROM coches WHERE id_usuario = ? AND marca = ? AND modelo = ?',

    INSERT_COCHE: `
      INSERT INTO coches
        (id_usuario, marca, modelo, combustible, kilometraje_inicial, capacidad_tanque,
         consumo_teorico, fecha_ultimo_cambio_aceite, km_ultimo_cambio_aceite,
         intervalo_cambio_aceite_km, intervalo_cambio_aceite_meses)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    GET_COCHES: `
      SELECT id_coche, marca, modelo, combustible, kilometraje_inicial,
             capacidad_tanque, consumo_teorico
      FROM coches WHERE id_usuario = ?`,

    GET_COCHE_OWNER:
      'SELECT id_usuario FROM coches WHERE id_coche = ?',

    DELETE_COCHE:
      'DELETE FROM coches WHERE id_coche = ?',

    GET_COMBUSTIBLE_BY_COCHE:
      'SELECT combustible FROM coches WHERE id_coche = ?',
  },

  // ─────────────────────────────────────────────────────────────
  // FACTURAS — CRUD con soporte de paginación e imagen
  // ─────────────────────────────────────────────────────────────
  FACTURAS: {
    GET_ALL: `
      SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath
      FROM facturas WHERE id_usuario = ?
      ORDER BY fecha DESC, hora DESC`,

    GET_COUNT:
      'SELECT COUNT(*) as total FROM facturas WHERE id_usuario = ?',

    GET_PAGINATED: `
      SELECT id_factura, titulo, coste, fecha, hora, descripcion, imagenPath
      FROM facturas WHERE id_usuario = ?
      ORDER BY fecha DESC, hora DESC
      LIMIT ? OFFSET ?`,

    INSERT: `
      INSERT INTO facturas
        (id_usuario, titulo, coste, fecha, hora, descripcion, imagenPath,
         litros_repostados, precio_por_litro, kilometraje_actual, tipo_combustible, id_coche)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,

    GET_OWNER_AND_PATH:
      'SELECT id_usuario, imagenPath FROM facturas WHERE id_factura = ?',

    DELETE:
      'DELETE FROM facturas WHERE id_factura = ?',
  },

  // ─────────────────────────────────────────────────────────────
  // ESTADISTICAS — Consultas analíticas sobre facturas y coches
  // ─────────────────────────────────────────────────────────────
  ESTADISTICAS: {
    GET_USUARIO_ID:
      'SELECT id_usuario FROM usuarios WHERE email = ?',

    GASTO_TOTAL: `
      SELECT COALESCE(SUM(coste), 0) AS gasto_total, COUNT(*) AS total_facturas
      FROM facturas WHERE id_usuario = ?`,

    GASTO_MES_ACTUAL: `
      SELECT COALESCE(SUM(coste), 0) AS gasto_mes_actual, COUNT(*) AS facturas_mes_actual
      FROM facturas
      WHERE id_usuario = ?
        AND YEAR(fecha)  = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())`,

    PROMEDIO_MENSUAL: `
      SELECT COALESCE(AVG(gasto_mensual), 0) AS promedio_mensual
      FROM (
        SELECT YEAR(fecha) AS anio, MONTH(fecha) AS mes, SUM(coste) AS gasto_mensual
        FROM facturas
        WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY YEAR(fecha), MONTH(fecha)
      ) AS gastos_mensuales`,

    GASTO_ANUAL: `
      SELECT COALESCE(SUM(coste), 0) AS gasto_anual, COUNT(*) AS facturas_anual
      FROM facturas
      WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)`,

    MES_COMPARACION: `
      SELECT
        COALESCE(SUM(CASE
          WHEN YEAR(fecha) = YEAR(CURDATE()) AND MONTH(fecha) = MONTH(CURDATE())
          THEN coste ELSE 0 END), 0) AS gasto_mes_actual,
        COALESCE(SUM(CASE
          WHEN fecha >= DATE_SUB(DATE_FORMAT(CURDATE(), '%Y-%m-01'), INTERVAL 1 MONTH)
           AND fecha <  DATE_FORMAT(CURDATE(), '%Y-%m-01')
          THEN coste ELSE 0 END), 0) AS gasto_mes_anterior
      FROM facturas WHERE id_usuario = ?`,

    GASTO_POR_MES: `
      SELECT
        DATE_FORMAT(fecha, '%Y-%m')   AS mes,
        DATE_FORMAT(fecha, '%M %Y')   AS mes_nombre,
        COALESCE(SUM(coste), 0)       AS gasto,
        COUNT(*)                      AS num_facturas
      FROM facturas
      WHERE id_usuario = ? AND fecha >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
      GROUP BY DATE_FORMAT(fecha, '%Y-%m')
      ORDER BY mes ASC`,

    PROMEDIO_FACTURA: `
      SELECT
        COALESCE(AVG(coste), 0) AS promedio_por_factura,
        MIN(coste)              AS gasto_minimo,
        MAX(coste)              AS gasto_maximo
      FROM facturas WHERE id_usuario = ?`,

    PROYECCION_FIN_MES: `
      SELECT
        COALESCE(SUM(coste), 0)                                          AS gasto_actual,
        DAY(CURDATE())                                                    AS dias_transcurridos,
        DAY(LAST_DAY(CURDATE()))                                          AS dias_totales_mes,
        COALESCE(SUM(coste) * DAY(LAST_DAY(CURDATE())) / DAY(CURDATE()), 0) AS proyeccion_fin_mes
      FROM facturas
      WHERE id_usuario = ?
        AND YEAR(fecha)  = YEAR(CURDATE())
        AND MONTH(fecha) = MONTH(CURDATE())`,

    CONSUMO_REAL: `
      SELECT
        f1.id_factura, f1.fecha, f1.litros_repostados,
        f1.kilometraje_actual AS km_actual,
        f2.kilometraje_actual AS km_anterior,
        (f1.kilometraje_actual - f2.kilometraje_actual)                          AS km_recorridos,
        (f1.litros_repostados / (f1.kilometraje_actual - f2.kilometraje_actual) * 100) AS consumo_l_100km
      FROM facturas f1
      LEFT JOIN facturas f2
        ON  f2.id_usuario = f1.id_usuario
        AND f2.id_coche   = f1.id_coche
        AND f2.fecha < f1.fecha
        AND f2.kilometraje_actual IS NOT NULL
      WHERE f1.id_usuario = ?
        AND f1.litros_repostados  IS NOT NULL
        AND f1.kilometraje_actual IS NOT NULL
        AND f2.id_factura = (
          SELECT id_factura FROM facturas
          WHERE id_usuario = f1.id_usuario AND id_coche = f1.id_coche
            AND fecha < f1.fecha AND kilometraje_actual IS NOT NULL
          ORDER BY fecha DESC LIMIT 1
        )
      ORDER BY f1.fecha DESC`,

    COSTO_POR_KM: `
      WITH costos_individuales AS (
        SELECT
          f1.id_coche, f1.id_factura, f1.coste, f1.fecha,
          f1.kilometraje_actual, c.marca, c.modelo, c.kilometraje_inicial,
          LAG(f1.kilometraje_actual) OVER (PARTITION BY f1.id_coche ORDER BY f1.fecha) AS kilometraje_anterior
        FROM facturas f1
        JOIN coches c ON c.id_coche = f1.id_coche
        WHERE f1.id_usuario = ? AND f1.kilometraje_actual IS NOT NULL AND f1.coste > 0
      ),
      costos_calculados AS (
        SELECT
          id_coche, marca, modelo, kilometraje_inicial, id_factura, coste,
          kilometraje_actual, kilometraje_anterior,
          CASE
            WHEN kilometraje_anterior IS NULL AND kilometraje_actual > kilometraje_inicial
              THEN kilometraje_actual - kilometraje_inicial
            WHEN kilometraje_anterior IS NOT NULL AND kilometraje_actual > kilometraje_anterior
              THEN kilometraje_actual - kilometraje_anterior
            ELSE NULL
          END AS km_recorridos,
          CASE
            WHEN kilometraje_anterior IS NULL AND kilometraje_actual > kilometraje_inicial
              THEN ROUND(coste / (kilometraje_actual - kilometraje_inicial), 4)
            WHEN kilometraje_anterior IS NOT NULL AND kilometraje_actual > kilometraje_anterior
              THEN ROUND(coste / (kilometraje_actual - kilometraje_anterior), 4)
            ELSE NULL
          END AS costo_por_km
        FROM costos_individuales
      )
      SELECT
        id_coche, marca, modelo,
        COUNT(id_factura)                                  AS num_facturas,
        ROUND(AVG(costo_por_km), 4)                        AS costo_promedio_por_km,
        MAX(kilometraje_actual) - MIN(kilometraje_inicial) AS km_totales,
        SUM(coste)                                         AS gasto_total,
        ROUND(SUM(coste) / NULLIF(
          SUM(CASE WHEN km_recorridos IS NOT NULL THEN km_recorridos ELSE 0 END), 0
        ), 4)                                              AS costo_ponderado_por_km
      FROM costos_calculados
      GROUP BY id_coche, marca, modelo, kilometraje_inicial
      ORDER BY marca, modelo`,

    MANTENIMIENTO: `
      SELECT
        id_coche, marca, modelo,
        fecha_ultimo_cambio_aceite, km_ultimo_cambio_aceite,
        intervalo_cambio_aceite_km, intervalo_cambio_aceite_meses,
        (SELECT kilometraje_actual FROM facturas
         WHERE id_coche = coches.id_coche ORDER BY fecha DESC LIMIT 1) AS kilometraje_actual
      FROM coches WHERE id_usuario = ?`,

    CONSEJOS_CONSUMO: `
      SELECT AVG(consumo_l_100km) AS consumo_promedio
      FROM (
        SELECT
          (f1.litros_repostados /
           ((f1.kilometraje_actual - f2.kilometraje_actual) / 100)) AS consumo_l_100km
        FROM facturas f1
        JOIN facturas f2 ON f1.id_coche = f2.id_coche
        WHERE f1.id_usuario = ?
          AND f1.litros_repostados > 0
          AND f1.kilometraje_actual > f2.kilometraje_actual
          AND f2.fecha = (
            SELECT MAX(fecha) FROM facturas
            WHERE id_coche = f1.id_coche AND fecha < f1.fecha
              AND kilometraje_actual < f1.kilometraje_actual
            ORDER BY fecha DESC LIMIT 1
          )
        ORDER BY f1.fecha DESC
      ) AS consumos
      WHERE consumo_l_100km > 0 AND consumo_l_100km < 50`,
  },

  // ─────────────────────────────────────────────────────────────
  // GASOLINERAS — Consultas con distintos filtros geográficos
  // RECOMENDACIÓN DE OPTIMIZACIÓN (BBDD):
  // Si la BBDD crece, las consultas con "latitud BETWEEN ? AND ?" o
  // de Haversine serán lentas. Para mejorar el rendimiento,
  // ejecuta en tu BD los siguientes comandos SQL una sola vez:
  // 1. CREATE INDEX idx_gasolineras_coords ON gasolineras(latitud, longitud);
  // 2. CREATE INDEX idx_gasolineras_provincia ON gasolineras(id_provincia);
  // ─────────────────────────────────────────────────────────────
  GASOLINERAS: {
    // Base SELECT (sin horario duplicado) + placeholder WHERE para componer dinámicamente
    BASE_SELECT: `
      SELECT
        id_gasolinera  AS id,
        rotulo,
        direccion,
        municipio,
        provincia,
        id_provincia   AS idProvincia,
        latitud,
        longitud,
        horario,
        gasolina_95,
        gasolina_98,
        gasoleo_a,
        glp,
        gasoleo_premium,
        gasolina_95_e10,
        (gasoleo_a > 0) AS abierto_ahora
      FROM gasolineras
      WHERE latitud != 0 AND longitud != 0`,

    // Sufijos de filtro a concatenar según el caso
    FILTER_PROVINCIA:    ' AND id_provincia = ? ORDER BY gasoleo_a ASC',
    FILTER_BBOX:         ' AND latitud BETWEEN ? AND ? AND longitud BETWEEN ? AND ? ORDER BY gasoleo_a ASC LIMIT 500',
    FILTER_FALLBACK:     ' ORDER BY provincia, gasoleo_a ASC LIMIT 1000',

    // Para búsqueda radial (haversine) se envuelve el BASE_SELECT como subquery
    FILTER_HAVERSINE: (baseQuery) => `
      SELECT *,
        (6371 * acos(
          cos(radians(?)) * cos(radians(latitud)) *
          cos(radians(longitud) - radians(?)) +
          sin(radians(?)) * sin(radians(latitud))
        )) AS distancia
      FROM (${baseQuery}) AS gasolineras_filtradas
      HAVING distancia < 50
      ORDER BY distancia ASC
      LIMIT 100`,
  },
};

module.exports = QUERIES;
