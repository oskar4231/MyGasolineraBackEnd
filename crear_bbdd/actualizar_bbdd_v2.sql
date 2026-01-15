-- Migration: Add missing columns to 'coches' and 'facturas' tables
-- This script adds columns that were recently integrated into the backend but might be missing in older database versions.

USE `mygasolinera`;

-- 1. Actualizar tabla 'coches'
-- Añadir columnas de información técnica y mantenimiento
ALTER TABLE `coches` 
ADD COLUMN IF NOT EXISTS `kilometraje_inicial` int(11) DEFAULT NULL COMMENT 'Km cuando empezaste a registrar' AFTER `combustible`,
ADD COLUMN IF NOT EXISTS `capacidad_tanque` decimal(10,2) DEFAULT NULL COMMENT 'Litros del tanque' AFTER `kilometraje_inicial`,
ADD COLUMN IF NOT EXISTS `consumo_teorico` decimal(10,2) DEFAULT NULL COMMENT 'L/100km según fabricante' AFTER `capacidad_tanque`,
ADD COLUMN IF NOT EXISTS `fecha_ultimo_cambio_aceite` date DEFAULT NULL COMMENT 'Última vez que cambiaste aceite' AFTER `consumo_teorico`,
ADD COLUMN IF NOT EXISTS `km_ultimo_cambio_aceite` int(11) DEFAULT NULL COMMENT 'Km del último cambio de aceite' AFTER `fecha_ultimo_cambio_aceite`,
ADD COLUMN IF NOT EXISTS `intervalo_cambio_aceite_km` int(11) DEFAULT 15000 COMMENT 'Cada cuántos km cambiar aceite' AFTER `km_ultimo_cambio_aceite`,
ADD COLUMN IF NOT EXISTS `intervalo_cambio_aceite_meses` int(11) DEFAULT 12 COMMENT 'Cada cuántos meses cambiar aceite' AFTER `intervalo_cambio_aceite_km`;

-- 2. Actualizar tabla 'facturas'
-- Añadir columnas para cálculos de consumo y asociación con coches
ALTER TABLE `facturas` 
ADD COLUMN IF NOT EXISTS `litros_repostados` decimal(10,2) DEFAULT NULL COMMENT 'Litros comprados' AFTER `imagenPath`,
ADD COLUMN IF NOT EXISTS `precio_por_litro` decimal(10,3) DEFAULT NULL COMMENT 'Precio €/litro' AFTER `litros_repostados`,
ADD COLUMN IF NOT EXISTS `kilometraje_actual` int(11) DEFAULT NULL COMMENT 'Km del coche al repostar' AFTER `precio_por_litro`,
ADD COLUMN IF NOT EXISTS `tipo_combustible` varchar(50) DEFAULT NULL COMMENT 'Gasolina 95, Diésel, etc.' AFTER `kilometraje_actual`,
ADD COLUMN IF NOT EXISTS `id_coche` int(11) DEFAULT NULL COMMENT 'Coche usado en este repostaje' AFTER `tipo_combustible`;

-- 3. Añadir clave foránea en 'facturas' si no existe
-- Nota: En MariaDB/MySQL ALTER TABLE ADD CONSTRAINT no tiene IF NOT EXISTS integrado de la misma manera que las columnas,
-- pero el script fallará silenciosamente o con un aviso si ya existe dependiendo del entorno.
-- Aquí intentamos añadirla para completar la integridad.
SET @exist = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS 
              WHERE CONSTRAINT_SCHEMA = DATABASE() 
              AND CONSTRAINT_NAME = '1' 
              AND TABLE_NAME = 'facturas');

SET @query = IF(@exist <= 0, 
                'ALTER TABLE `facturas` ADD CONSTRAINT `1` FOREIGN KEY (`id_coche`) REFERENCES `coches` (`id_coche`) ON DELETE SET NULL', 
                'SELECT 1');

PREPARE stmt FROM @query;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- Verificar cambios
DESCRIBE `coches`;
DESCRIBE `facturas`;
