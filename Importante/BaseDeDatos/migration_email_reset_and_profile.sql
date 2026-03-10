-- =============================================================================
-- MIGRACIÓN: Tabla token_reiniciar_contraseña + columna foto_perfil
-- Generado: 2026-03-10
-- IDEMPOTENTE: se puede ejecutar varias veces sin error
-- =============================================================================

-- ─────────────────────────────────────────────────────────────────────────────
-- 1. Añadir foto_perfil a usuarios (por si acaso no existiera aún)
-- ─────────────────────────────────────────────────────────────────────────────
ALTER TABLE `usuarios`
  MODIFY COLUMN `foto_perfil` VARCHAR(255) DEFAULT NULL;

-- ─────────────────────────────────────────────────────────────────────────────
-- 2. Tabla de tokens para recuperación de contraseña
--    Columnas:
--      id          → PK autoincremental
--      email       → email del usuario que solicita el reset
--      token       → código de 6 dígitos generado por el backend
--      expires_at  → cuándo caduca el token (backend lo pone a NOW() + 1h)
--      used        → si ya fue consumido (para evitar reutilización)
--      created_at  → auditoría de cuándo se creó
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS `token_reiniciar_contraseña` (
  `id`          INT(11)      NOT NULL AUTO_INCREMENT,
  `email`       VARCHAR(255) NOT NULL,
  `token`       VARCHAR(10)  NOT NULL,
  `expires_at`  DATETIME     NOT NULL,
  `used`        TINYINT(1)   NOT NULL DEFAULT 0,
  `created_at`  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  -- Índice compuesto para acelerar VERIFY_RESET_TOKEN (token + used + expires_at)
  INDEX `idx_token_lookup` (`token`, `used`, `expires_at`),
  -- Índice en email para consultas por usuario
  INDEX `idx_token_email`  (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_uca1400_ai_ci;

-- ─────────────────────────────────────────────────────────────────────────────
-- 3. Limpieza automática: eliminar tokens usados o expirados con más de 24 h
--    Se ejecuta al aplicar la migración; en producción puedes añadir
--    un EVENT de MySQL que lo llame diariamente:
--
--      CREATE EVENT IF NOT EXISTS `limpiar_tokens_expirados`
--        ON SCHEDULE EVERY 1 DAY
--        DO DELETE FROM `token_reiniciar_contraseña`
--           WHERE used = 1 OR expires_at < DATE_SUB(NOW(), INTERVAL 24 HOUR);
-- ─────────────────────────────────────────────────────────────────────────────
DELETE FROM `token_reiniciar_contraseña`
WHERE `used` = 1
   OR `expires_at` < DATE_SUB(NOW(), INTERVAL 24 HOUR);
