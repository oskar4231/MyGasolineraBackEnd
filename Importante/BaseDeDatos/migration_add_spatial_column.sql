-- ============================================================
-- MIGRACIÓN: Añadir Columna Espacial e Índice a Gasolineras
-- ============================================================
-- Propósito: Optimizar búsquedas geográficas con Bounding Box
-- Fecha: 2026-02-16
-- Base de datos: MariaDB 12.0.2
-- ============================================================

-- PASO 1: Añadir columna POINT para almacenar coordenadas
-- --------------------------------------------------------
-- La columna POINT almacena las coordenadas como un tipo geométrico nativo
-- Formato: POINT(longitud, latitud) - OJO: longitud primero, latitud segundo
-- Usamos DEFAULT POINT(0,0) para permitir NOT NULL (requerido por SPATIAL INDEX)
ALTER TABLE gasolineras 
ADD COLUMN ubicacion POINT NOT NULL DEFAULT POINT(0, 0) AFTER longitud;

-- PASO 2: Poblar la columna con datos existentes
-- -----------------------------------------------
-- Actualizar solo los registros con coordenadas válidas (diferentes de 0)
UPDATE gasolineras 
SET ubicacion = POINT(longitud, latitud)
WHERE latitud != 0 AND longitud != 0;

-- PASO 3: Crear índice espacial (CRÍTICO para rendimiento)
-- ---------------------------------------------------------
-- El índice espacial usa R-Tree para optimizar búsquedas geográficas
-- Mejora el rendimiento de O(n) a O(log n) en consultas con MBRContains
CREATE SPATIAL INDEX idx_ubicacion ON gasolineras(ubicacion);

-- PASO 4: Verificación de la migración
-- -------------------------------------
-- Verificar que el índice se creó correctamente
SHOW INDEX FROM gasolineras WHERE Key_name = 'idx_ubicacion';

-- Verificar cuántos registros tienen ubicación poblada
SELECT 
    COUNT(*) as total_registros,
    COUNT(ubicacion) as registros_con_ubicacion,
    COUNT(*) - COUNT(ubicacion) as registros_sin_ubicacion
FROM gasolineras;

-- PASO 5 (OPCIONAL): Crear trigger para mantener sincronización
-- --------------------------------------------------------------
-- Este trigger actualiza automáticamente la columna 'ubicacion' 
-- cuando se insertan o actualizan las coordenadas latitud/longitud
DELIMITER $$

CREATE TRIGGER trg_gasolineras_ubicacion_insert
BEFORE INSERT ON gasolineras
FOR EACH ROW
BEGIN
    IF NEW.latitud != 0 AND NEW.longitud != 0 THEN
        SET NEW.ubicacion = POINT(NEW.longitud, NEW.latitud);
    END IF;
END$$

CREATE TRIGGER trg_gasolineras_ubicacion_update
BEFORE UPDATE ON gasolineras
FOR EACH ROW
BEGIN
    IF NEW.latitud != 0 AND NEW.longitud != 0 THEN
        SET NEW.ubicacion = POINT(NEW.longitud, NEW.latitud);
    END IF;
END$$

DELIMITER ;

-- ============================================================
-- NOTAS IMPORTANTES
-- ============================================================
-- 1. La columna 'ubicacion' usa el formato POINT(longitud, latitud)
--    OJO: El orden es LONGITUD primero, LATITUD segundo (estándar GIS)
--
-- 2. Las columnas 'latitud' y 'longitud' se mantienen para compatibilidad
--    con código existente y como fuente de verdad
--
-- 3. El índice espacial solo funciona con columnas de tipo geométrico
--    (POINT, POLYGON, etc.), no con columnas numéricas
--
-- 4. Los triggers mantienen la sincronización automática entre
--    latitud/longitud y la columna ubicacion
--
-- 5. Para búsquedas por Bounding Box, usar:
--    MBRContains(ST_GeomFromText('POLYGON(...)'), ubicacion)
-- ============================================================
