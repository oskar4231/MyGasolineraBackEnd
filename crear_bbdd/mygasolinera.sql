-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.0.2-MariaDB - mariadb.org binary distribution
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Volcando estructura de base de datos para mygasolinera
CREATE DATABASE IF NOT EXISTS `mygasolinera` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_uca1400_ai_ci */;
USE `mygasolinera`;

-- Volcando estructura para tabla mygasolinera.coches
CREATE TABLE IF NOT EXISTS `coches` (
  `id_coche` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `marca` varchar(50) DEFAULT NULL,
  `modelo` varchar(50) DEFAULT NULL,
  `combustible` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id_coche`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `coches_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.facturas
CREATE TABLE IF NOT EXISTS `facturas` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `coste` decimal(10,2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  PRIMARY KEY (`id_factura`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.favoritas
CREATE TABLE IF NOT EXISTS `favoritas` (
  `id_usuario` int(11) NOT NULL,
  `id_gasolinera` varchar(50) NOT NULL, -- Cambiado a VARCHAR para el ID del Ministerio
  `fecha_agregado` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_usuario`,`id_gasolinera`),
  KEY `id_gasolinera` (`id_gasolinera`),
  CONSTRAINT `favoritas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `favoritas_ibfk_2` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando estructura para tabla mygasolinera.gasolineras
CREATE TABLE IF NOT EXISTS `gasolineras` (
  `id_gasolinera` varchar(50) NOT NULL, -- ID del Ministerio (IDEESS)
  `rotulo` varchar(100) NOT NULL, -- Nombre comercial
  `direccion` varchar(255) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `cod_postal` varchar(10) DEFAULT NULL,
  `latitud` decimal(10,6) DEFAULT NULL,
  `longitud` decimal(10,6) DEFAULT NULL,
  `horario` varchar(200) DEFAULT NULL,
  -- Precios de combustibles
  `gasolina_95` decimal(6,3) DEFAULT 0.000,
  `gasolina_95_e10` decimal(6,3) DEFAULT 0.000,
  `gasolina_98` decimal(6,3) DEFAULT 0.000,
  `gasoleo_a` decimal(6,3) DEFAULT 0.000,
  `gasoleo_premium` decimal(6,3) DEFAULT 0.000,
  `glp` decimal(6,3) DEFAULT 0.000,
  `biodiesel` decimal(6,3) DEFAULT 0.000,
  `bioetanol` decimal(6,3) DEFAULT 0.000,
  `ester_metilico` decimal(6,3) DEFAULT 0.000,
  `hidrogeno` decimal(6,3) DEFAULT 0.000,
  -- Metadatos
  `fecha_actualizacion` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `fecha_creacion` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_gasolinera`),
  KEY `idx_latitud_longitud` (`latitud`,`longitud`),
  KEY `idx_provincia` (`provincia`),
  KEY `idx_municipio` (`municipio`),
  KEY `idx_rotulo` (`rotulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando estructura para tabla mygasolinera.gasolinera_servicios
CREATE TABLE IF NOT EXISTS `gasolinera_servicios` (
  `id_gasolinera` varchar(50) NOT NULL, -- Cambiado a VARCHAR
  `id_servicio` int(11) NOT NULL,
  PRIMARY KEY (`id_gasolinera`,`id_servicio`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `gasolinera_servicios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`) ON DELETE CASCADE,
  CONSTRAINT `gasolinera_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Eliminamos la tabla precios ya que los precios están ahora en la tabla gasolineras
DROP TABLE IF EXISTS `precios`;

-- Volcando estructura para tabla mygasolinera.servicios
CREATE TABLE IF NOT EXISTS `servicios` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT 'otros', -- Lavado, Tienda, Cafetería, etc.
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Insertar servicios comunes
INSERT IGNORE INTO `servicios` (`id_servicio`, `nombre`, `categoria`) VALUES
(1, 'Lavado de coches', 'lavado'),
(2, 'Tienda', 'tienda'),
(3, 'Cafetería', 'restauracion'),
(4, 'Restaurante', 'restauracion'),
(5, 'Aire comprimido', 'vehiculo'),
(6, 'Agua', 'vehiculo'),
(7, 'Vacuum', 'lavado'),
(8, 'Wifi gratuito', 'otros'),
(9, 'Aseos', 'otros'),
(10, 'Parking', 'vehiculo'),
(11, 'Parking camiones', 'vehiculo'),
(12, 'Alquiler de vehículos', 'vehiculo'),
(13, 'Hotel', 'alojamiento'),
(14, 'Taller mecánico', 'vehiculo'),
(15, 'Venta de neumáticos', 'vehiculo'),
(16, 'Pago con tarjeta', 'pago'),
(17, 'Pago móvil', 'pago'),
(18, 'Autoservicio', 'combustible'),
(19, 'Servicio 24 horas', 'combustible');

-- Volcando estructura para tabla mygasolinera.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contraseña` varchar(100) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  `ultimo_login` datetime DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Crear tabla para historial de precios (opcional - para tracking de precios)
CREATE TABLE IF NOT EXISTS `historial_precios` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_gasolinera` varchar(50) NOT NULL,
  `tipo_combustible` varchar(30) NOT NULL,
  `precio` decimal(6,3) NOT NULL,
  `fecha_registro` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_historial`),
  KEY `id_gasolinera` (`id_gasolinera`),
  KEY `idx_fecha_tipo` (`fecha_registro`,`tipo_combustible`),
  CONSTRAINT `historial_precios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Crear tabla para logs de sincronización
CREATE TABLE IF NOT EXISTS `logs_sincronizacion` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_sincronizacion` datetime DEFAULT CURRENT_TIMESTAMP,
  `total_gasolineras` int(11) DEFAULT 0,
  `nuevas_gasolineras` int(11) DEFAULT 0,
  `gasolineras_actualizadas` int(11) DEFAULT 0,
  `duracion_segundos` decimal(8,2) DEFAULT 0.00,
  `estado` enum('exito','error','parcial') DEFAULT 'exito',
  `mensaje_error` text DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  KEY `idx_fecha_sincronizacion` (`fecha_sincronizacion`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;