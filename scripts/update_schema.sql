-- Agrega la columna id_provincia y crea índices para mejorar el rendimiento
ALTER TABLE gasolineras ADD COLUMN IF NOT EXISTS id_provincia VARCHAR(5);
CREATE INDEX IF NOT EXISTS idx_id_provincia ON gasolineras(id_provincia);
