-- Añadir columna espacial 'ubicacion' y crear índice espacial
-- Esto es necesario para optimizar las consultas geográficas con MBRContains

-- 1. Añadir la columna de tipo POINT
ALTER TABLE gasolineras ADD COLUMN IF NOT EXISTS ubicacion POINT;

-- 2. Rellenar la columna con los datos existentes de latitud/longitud
-- Nota: MariaDB/MySQL espera orden (Longitud Latitud) -> (X Y)
UPDATE gasolineras 
SET ubicacion = Point(longitud, latitud)
WHERE latitud IS NOT NULL AND longitud IS NOT NULL AND ubicacion IS NULL;

-- 3. Asegurar que no sea NULL para poder crear el índice
ALTER TABLE gasolineras MODIFY ubicacion POINT NOT NULL;

-- 4. Crear el índice espacial (SPATIAL INDEX)
-- Nota: Solo funciona en tablas MyISAM o InnoDB (MariaDB 10.2+)
CREATE SPATIAL INDEX IF NOT EXISTS idx_ubicacion ON gasolineras(ubicacion);
