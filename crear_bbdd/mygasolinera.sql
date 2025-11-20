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
  `id_gasolinera` int(11) NOT NULL,
  `fecha_agregado` date DEFAULT NULL,
  PRIMARY KEY (`id_usuario`,`id_gasolinera`),
  KEY `id_gasolinera` (`id_gasolinera`),
  CONSTRAINT `favoritas_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id_usuario`),
  CONSTRAINT `favoritas_ibfk_2` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.gasolineras
CREATE TABLE IF NOT EXISTS `gasolineras` (
  `id_gasolinera` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  `direccion` varchar(150) DEFAULT NULL,
  `municipio` varchar(100) DEFAULT NULL,
  `provincia` varchar(100) DEFAULT NULL,
  `codPostal` varchar(10) DEFAULT NULL,
  `latitud` decimal(9,6) DEFAULT NULL,
  `longitud` decimal(9,6) DEFAULT NULL,
  `horario_24` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id_gasolinera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.gasolinera_servicios
CREATE TABLE IF NOT EXISTS `gasolinera_servicios` (
  `id_gasolinera` int(11) NOT NULL,
  `id_servicio` int(11) NOT NULL,
  PRIMARY KEY (`id_gasolinera`,`id_servicio`),
  KEY `id_servicio` (`id_servicio`),
  CONSTRAINT `gasolinera_servicios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`),
  CONSTRAINT `gasolinera_servicios_ibfk_2` FOREIGN KEY (`id_servicio`) REFERENCES `servicios` (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.precios
CREATE TABLE IF NOT EXISTS `precios` (
  `id_precio` int(11) NOT NULL AUTO_INCREMENT,
  `id_gasolinera` int(11) DEFAULT NULL,
  `tipo_combustible` varchar(30) DEFAULT NULL,
  `precio` decimal(6,3) DEFAULT NULL,
  PRIMARY KEY (`id_precio`),
  KEY `id_gasolinera` (`id_gasolinera`),
  CONSTRAINT `precios_ibfk_1` FOREIGN KEY (`id_gasolinera`) REFERENCES `gasolineras` (`id_gasolinera`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.servicios
CREATE TABLE IF NOT EXISTS `servicios` (
  `id_servicio` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_servicio`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

-- Volcando estructura para tabla mygasolinera.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(50) DEFAULT NULL,
  `apellido` varchar(50) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `contraseña` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- La exportación de datos fue deseleccionada.

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
