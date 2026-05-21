-- ============================================================
-- PARROQUIAS SV — Script SQL para Supabase
-- Ejecutá esto en el SQL Editor de tu proyecto Supabase
-- ============================================================

-- Parroquias (para escalar a varias parroquias en el futuro)
CREATE TABLE IF NOT EXISTS parroquias (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  nombre      TEXT NOT NULL,
  direccion   TEXT,
  municipio   TEXT,
  departamento TEXT,
  parroco     TEXT,
  telefono    TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- Bautismos
CREATE TABLE IF NOT EXISTS bautismos (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parroquia_id     UUID REFERENCES parroquias(id),
  nombres          TEXT NOT NULL,
  apellidos        TEXT NOT NULL,
  fecha_nacimiento DATE,
  lugar_nacimiento TEXT,
  sexo             TEXT,
  fecha_bautismo   DATE NOT NULL,
  libro            TEXT,
  folio            TEXT,
  partida          TEXT,
  parroquia        TEXT,
  municipio        TEXT,
  ministro         TEXT,
  padre_nombre     TEXT,
  madre_nombre     TEXT,
  padrino_nombre   TEXT,
  madrina_nombre   TEXT,
  notas            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Confirmaciones
CREATE TABLE IF NOT EXISTS confirmaciones (
  id                  UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parroquia_id        UUID REFERENCES parroquias(id),
  nombres             TEXT NOT NULL,
  apellidos           TEXT NOT NULL,
  fecha_nacimiento    DATE,
  nombre_confirmacion TEXT,
  fecha_confirmacion  DATE NOT NULL,
  libro               TEXT,
  folio               TEXT,
  partida             TEXT,
  parroquia           TEXT,
  municipio           TEXT,
  ministro            TEXT,
  padrino_nombre      TEXT,
  madrina_nombre      TEXT,
  notas               TEXT,
  created_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Primeras comuniones
CREATE TABLE IF NOT EXISTS primeras_comuniones (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parroquia_id     UUID REFERENCES parroquias(id),
  nombres          TEXT NOT NULL,
  apellidos        TEXT NOT NULL,
  fecha_nacimiento DATE,
  fecha_comunion   DATE NOT NULL,
  libro            TEXT,
  folio            TEXT,
  partida          TEXT,
  parroquia        TEXT,
  municipio        TEXT,
  ministro         TEXT,
  notas            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Matrimonios
CREATE TABLE IF NOT EXISTS matrimonios (
  id               UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  parroquia_id     UUID REFERENCES parroquias(id),
  esposo_nombres   TEXT NOT NULL,
  esposo_apellidos TEXT NOT NULL,
  esposa_nombres   TEXT NOT NULL,
  esposa_apellidos TEXT NOT NULL,
  fecha_matrimonio DATE NOT NULL,
  libro            TEXT,
  folio            TEXT,
  partida          TEXT,
  parroquia        TEXT,
  municipio        TEXT,
  ministro         TEXT,
  testigo1_nombre  TEXT,
  testigo2_nombre  TEXT,
  tipo             TEXT DEFAULT 'canonico',
  notas            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Desactivar RLS en todas las tablas (igual que IDSJE)
ALTER TABLE parroquias          DISABLE ROW LEVEL SECURITY;
ALTER TABLE bautismos           DISABLE ROW LEVEL SECURITY;
ALTER TABLE confirmaciones      DISABLE ROW LEVEL SECURITY;
ALTER TABLE primeras_comuniones DISABLE ROW LEVEL SECURITY;
ALTER TABLE matrimonios         DISABLE ROW LEVEL SECURITY;

-- ============================================================
-- Listo. Después de ejecutar esto, creá el primer usuario
-- desde Supabase > Authentication > Users > Invite user
-- ============================================================
