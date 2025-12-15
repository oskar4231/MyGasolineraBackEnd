-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Versión del servidor:         12.1.2-MariaDB - MariaDB Server
-- SO del servidor:              Win64
-- HeidiSQL Versión:             12.13.0.7147
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
  `kilometraje_inicial` int(11) DEFAULT NULL COMMENT 'Km cuando empezaste a registrar',
  `capacidad_tanque` decimal(10,2) DEFAULT NULL COMMENT 'Litros del tanque',
  `consumo_teorico` decimal(10,2) DEFAULT NULL COMMENT 'L/100km según fabricante',
  `fecha_ultimo_cambio_aceite` date DEFAULT NULL COMMENT 'Última vez que cambiaste aceite',
  `km_ultimo_cambio_aceite` int(11) DEFAULT NULL COMMENT 'Km del último cambio de aceite',
  `intervalo_cambio_aceite_km` int(11) DEFAULT 15000 COMMENT 'Cada cuántos km cambiar aceite',
  `intervalo_cambio_aceite_meses` int(11) DEFAULT 12 COMMENT 'Cada cuántos meses cambiar aceite',
  PRIMARY KEY (`id_coche`),
  KEY `id_usuario` (`id_usuario`),
  CONSTRAINT `coches_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.coches: ~6 rows (aproximadamente)
INSERT INTO `coches` (`id_coche`, `id_usuario`, `marca`, `modelo`, `combustible`, `kilometraje_inicial`, `capacidad_tanque`, `consumo_teorico`, `fecha_ultimo_cambio_aceite`, `km_ultimo_cambio_aceite`, `intervalo_cambio_aceite_km`, `intervalo_cambio_aceite_meses`) VALUES
	(1, 2, 'toyota', 'corolla', 'Gasolina 95, Gasolina 98', NULL, NULL, NULL, NULL, NULL, 15000, 12),
	(2, 3, 'Toyota', 'Corolla', 'Diésel, Diésel Premium', NULL, NULL, NULL, NULL, NULL, 15000, 12),
	(3, 4, 'toyota', 'corolla', 'Gasolina 95, Gasolina 98', NULL, NULL, NULL, NULL, NULL, 15000, 12),
	(10, 3, 'Mercedes', 'Serie 3', 'Gasolina 95, Gasolina 98', 25000, 60.00, 3.60, NULL, NULL, 15000, 12),
	(12, 3, 'Seat', 'Leon', 'Gasolina 95, Gasolina 98', 10000, 50.00, 5.50, NULL, NULL, 15000, 12),
	(13, 5, 'Dacia', 'Sandero', 'Gasolina 95, Gasolina 98', 8000, 55.00, 5.40, NULL, NULL, 15000, 12);

-- Volcando estructura para tabla mygasolinera.facturas
CREATE TABLE IF NOT EXISTS `facturas` (
  `id_factura` int(11) NOT NULL AUTO_INCREMENT,
  `id_usuario` int(11) DEFAULT NULL,
  `titulo` varchar(100) DEFAULT NULL,
  `coste` decimal(10,2) DEFAULT NULL,
  `fecha` date DEFAULT NULL,
  `hora` time DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `imagenPath` varchar(255) DEFAULT NULL,
  `litros_repostados` decimal(10,2) DEFAULT NULL COMMENT 'Litros comprados',
  `precio_por_litro` decimal(10,3) DEFAULT NULL COMMENT 'Precio €/litro',
  `kilometraje_actual` int(11) DEFAULT NULL COMMENT 'Km del coche al repostar',
  `tipo_combustible` varchar(50) DEFAULT NULL COMMENT 'Gasolina 95, Diésel, etc.',
  `id_coche` int(11) DEFAULT NULL COMMENT 'Coche usado en este repostaje',
  PRIMARY KEY (`id_factura`),
  KEY `id_usuario` (`id_usuario`),
  KEY `id_coche` (`id_coche`),
  CONSTRAINT `1` FOREIGN KEY (`id_coche`) REFERENCES `coches` (`id_coche`) ON DELETE SET NULL,
  CONSTRAINT `facturas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.facturas: ~20 rows (aproximadamente)
INSERT INTO `facturas` (`id_factura`, `id_usuario`, `titulo`, `coste`, `fecha`, `hora`, `descripcion`, `imagenPath`, `litros_repostados`, `precio_por_litro`, `kilometraje_actual`, `tipo_combustible`, `id_coche`) VALUES
	(1, 2, 'Repsol', 57.00, '2025-11-19', '17:06:00', '', NULL, NULL, NULL, NULL, NULL, NULL),
	(2, 2, 'Carrefour', 35.00, '2025-12-07', '17:06:00', '', NULL, NULL, NULL, NULL, NULL, NULL),
	(3, 2, 'Gasolinera', 58.78, '2025-12-07', '17:07:00', '', NULL, NULL, NULL, NULL, NULL, NULL),
	(4, 2, 'Repostaje ', 62.30, '2025-11-20', '17:08:00', '', NULL, NULL, NULL, NULL, NULL, NULL),
	(5, 3, 'Repsol', 35.00, '2025-12-16', '13:02:00', '', 'uploads\\facturas\\euroveneco-1765627352000-840807537.jpg', NULL, NULL, NULL, NULL, NULL),
	(6, 3, 'Carrefour', 50.00, '2025-11-19', '13:02:00', '', 'uploads\\facturas\\lm19-1765627406846-957725010.webp', NULL, NULL, NULL, NULL, NULL),
	(7, 4, 'Factura repsol 304', 32.50, '2025-12-03', '13:32:00', '', 'uploads\\facturas\\lord-1765629224803-647702519.jpg', NULL, NULL, NULL, NULL, NULL),
	(8, 3, 'E/S CARREFOUR ELSALER', 40.00, '2025-12-12', '13:43:00', '', NULL, NULL, NULL, NULL, NULL, NULL),
	(11, 3, 'sddsf', 36.00, '2025-12-13', '14:54:00', '', NULL, 25.00, 1.236, 32564, 'Diésel', NULL),
	(12, 3, 'Resol', 25.00, '2025-12-13', '15:09:00', '', NULL, 25.30, 1.563, 25634, 'Diésel', NULL),
	(13, 3, 'repsol', 50.00, '2025-11-10', '17:11:00', '', NULL, 32.00, 1.569, 26000, 'Gasolina 98', NULL),
	(14, 3, 'Factura ', 26.00, '2025-12-14', '12:57:00', '', 'uploads\\facturas\\lord-1765713474677-487189532.jpg', 36.20, 1.654, 23654, 'Diésel', 10),
	(15, 3, 'Carrefour', 36.20, '2025-11-27', '12:58:00', '', NULL, 36.50, 1.365, 14000, 'Diésel', 2),
	(16, 3, 'adsad', 25.00, '2025-12-14', '14:00:00', '', NULL, 25.00, 1.236, 26000, 'Diésel', 10),
	(17, 3, 'Plenergy', 43.00, '2025-12-14', '14:09:00', '', NULL, 25.00, 1.456, 110000, 'Gasolina 98', 2),
	(18, 5, 'Repsol', 25.00, '2025-12-14', '14:12:00', '', NULL, 32.50, 1.254, NULL, 'Gasolina 98', NULL),
	(19, 3, 'Carrefour', 25.00, '2025-12-14', '14:32:00', '', NULL, 45.00, 1.456, 10230, 'Gasolina 98', 12),
	(20, 5, 'Carrefour', 36.00, '2025-12-14', '14:38:00', '', NULL, 45.00, 1.456, 8120, 'Gasolina 98', 13),
	(21, 5, 'Factura', 25.00, '2025-12-14', '14:53:00', '', NULL, 25.00, 1.321, 8500, 'Gasolina 98', 13),
	(22, 5, 'asdasd', 32.00, '2025-12-14', '14:55:00', '', NULL, 30.00, 1.236, 8552, 'Gasolina 98', 13);

-- Volcando estructura para tabla mygasolinera.favoritas
CREATE TABLE IF NOT EXISTS `favoritas` (
  `id_usuario` int(11) NOT NULL,
  `id_gasolinera` varchar(50) NOT NULL,
  `fecha_agregado` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_usuario`,`id_gasolinera`),
  KEY `id_gasolinera` (`id_gasolinera`),
  CONSTRAINT `favoritas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `favoritas_ibfk_2` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.favoritas: ~0 rows (aproximadamente)

-- Volcando estructura para tabla mygasolinera.gasolinera_servicios
CREATE TABLE IF NOT EXISTS `gasolinera_servicios` (
  `id_gasolinera` varchar(50) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  PRIMARY KEY (`id_gasolinera`,`id_servicio`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `gasolinera_servicios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`) ON DELETE CASCADE,
  CONSTRAINT `gasolinera_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.gasolinera_servicios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla mygasolinera.gasolineras
CREATE TABLE IF NOT EXISTS `gasolineras` (
  `id_gasolinera` varchar(50) NOT NULL,
  `rotulo` varchar(100) NOT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `cod_postal` varchar(10) DEFAULT NULL,
  `latitud` decimal(10,6) DEFAULT NULL,
  `longitud` decimal(10,6) DEFAULT NULL,
  `horario` varchar(200) DEFAULT NULL,
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
  `fecha_actualizacion` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `fecha_creacion` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_gasolinera`),
  KEY `idx_latitud_longitud` (`latitud`,`longitud`),
  KEY `idx_provincia` (`provincia`),
  KEY `idx_municipio` (`municipio`),
  KEY `idx_rotulo` (`rotulo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;


-- Volcando estructura para tabla mygasolinera.historial_precios
CREATE TABLE IF NOT EXISTS `historial_precios` (
  `id_historial` int(11) NOT NULL AUTO_INCREMENT,
  `id_gasolinera` varchar(50) NOT NULL,
  `tipo_combustible` varchar(30) NOT NULL,
  `precio` decimal(6,3) NOT NULL,
  `fecha_registro` datetime DEFAULT current_timestamp(),
  PRIMARY KEY (`id_historial`),
  KEY `id_gasolinera` (`id_gasolinera`),
  KEY `idx_fecha_tipo` (`fecha_registro`,`tipo_combustible`),
  CONSTRAINT `historial_precios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.historial_precios: ~0 rows (aproximadamente)

-- Volcando estructura para tabla mygasolinera.logs_sincronizacion
CREATE TABLE IF NOT EXISTS `logs_sincronizacion` (
  `id_log` int(11) NOT NULL AUTO_INCREMENT,
  `fecha_sincronizacion` datetime DEFAULT current_timestamp(),
  `total_gasolineras` int(11) DEFAULT 0,
  `nuevas_gasolineras` int(11) DEFAULT 0,
  `gasolineras_actualizadas` int(11) DEFAULT 0,
  `duracion_segundos` decimal(8,2) DEFAULT 0.00,
  `estado` enum('exito','error','parcial') DEFAULT 'exito',
  `mensaje_error` text DEFAULT NULL,
  PRIMARY KEY (`id_log`),
  KEY `idx_fecha_sincronizacion` (`fecha_sincronizacion`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.logs_sincronizacion: ~0 rows (aproximadamente)
INSERT INTO `logs_sincronizacion` (`id_log`, `fecha_sincronizacion`, `total_gasolineras`, `nuevas_gasolineras`, `gasolineras_actualizadas`, `duracion_segundos`, `estado`, `mensaje_error`) VALUES
	(1, '2025-11-29 14:56:15', 11964, 11964, 0, 3.46, 'exito', NULL);

-- Volcando estructura para tabla mygasolinera.servicios
CREATE TABLE IF NOT EXISTS `servicios` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT 'otros',
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB AUTO_INCREMENT=20 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.servicios: ~19 rows (aproximadamente)
INSERT INTO `servicios` (`id_servicio`, `nombre`, `categoria`) VALUES
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
  `fecha_registro` datetime DEFAULT current_timestamp(),
  `ultimo_login` datetime DEFAULT NULL,
  `activo` tinyint(4) DEFAULT 1,
  `foto_perfil` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- Volcando datos para la tabla mygasolinera.usuarios: ~4 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nombre`, `apellido`, `email`, `telefono`, `contraseña`, `fecha_registro`, `ultimo_login`, `activo`, `foto_perfil`) VALUES
	(2, 'oscar', NULL, 'oscar@oscar.com', NULL, '$2a$10$TTAjtgvkLFqtBqJMvwgusu9rPYy9gt58/FQ2rZdwkIBJukVUk1Vnq', '2025-11-29 15:01:45', NULL, 1, NULL),
	(3, 'test', NULL, 'test@test.com', NULL, '$2a$10$NYSf4MR/.sdIuIpEABxnn.xSxAKg1C5z3UxSAQ8o03RVQMiAH2uhu', '2025-12-07 15:04:19', NULL, 1, 'uploads/profile-photos/test_test_com_1765713753653.webp'),
	(4, 'pepe', NULL, 'pepe@pepe.com', NULL, '$2a$10$6V5ldrMtyi.XgDgDXeTe/.CdG3zzyZXU1qkn4NUqyUKqutQ9JHC.i', '2025-12-14 14:11:12', NULL, 1, NULL);

