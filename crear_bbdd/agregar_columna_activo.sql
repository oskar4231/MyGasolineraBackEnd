-- Migration: Add 'activo' column to usuarios table
-- This script adds the missing 'activo' column to the usuarios table

USE `mygasolinera`;

-- Check if column exists and add it if it doesn't
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `activo` tinyint(1) DEFAULT 1 AFTER `foto_perfil`;

-- Update existing users to be active by default
UPDATE `usuarios` SET `activo` = 1 WHERE `activo` IS NULL;

-- Verify the column was added
DESCRIBE `usuarios`;
