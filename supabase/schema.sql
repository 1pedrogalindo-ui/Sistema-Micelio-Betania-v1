create extension if not exists "pgcrypto";

-- =========================================================
-- SISTEMA MICELIO BETANIA — SUPABASE SCHEMA COMPLETO
-- Fase 2 a 5 + Bitácora de avances del cronograma
-- =========================================================

-- =========================
-- 1. FASES / CRONOGRAMA
-- =========================

create table if not exists fases (
  id text primary key,
  nombre text not null,
  semana text,
  fecha_inicio date,
  fecha_fin date,
  estado text default 'pendiente',
  descripcion text,
  actividades jsonb default '[]',
  urgencia text,
  porcentaje_avance numeric default 0,
  responsable text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Bitácora real de avances por fase
create table if not exists avances_cronograma (
  id uuid primary key default gen_random_uuid(),
  fase_id text references fases(id) on delete cascade,
  fecha timestamptz default now(),
  porcentaje numeric default 0,
  estado text,
  descripcion text not null,
  responsable text,
  evidencia_url text,
  bloqueo text,
  siguiente_accion text,
  created_at timestamptz default now()
);

-- =========================
-- 2. PROVEEDORES / CRM
-- =========================

create table if not exists proveedores (
  id text primary key,
  nombre text not null,
  categoria text,
  ubicacion text,
  telefono text,
  email text,
  web text,
  precio text,
  notas text,
  estado text default 'por-contactar',
  prioridad text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- 3. INVENTARIO / COMPRAS
-- =========================

create table if not exists inventario (
  id text primary key,
  item text not null,
  categoria text,
  cantidad numeric default 0,
  precio_unit numeric default 0,
  urgencia text,
  fecha_limite date,
  estado text default 'pendiente',
  proveedor_id text references proveedores(id),
  notas text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- 4. REGISTROS AMBIENTALES
-- =========================

create table if not exists registros_ambientales (
  id uuid primary key default gen_random_uuid(),
  fecha timestamptz not null default now(),
  fase text not null,
  temperatura_aire numeric,
  temperatura_compost numeric,
  humedad numeric,
  co2 numeric,
  notas text,
  device_id text,
  bandeja_id text,
  created_at timestamptz default now()
);

-- =========================
-- 5. CICLOS, LOTES Y BANDEJAS
-- =========================

create table if not exists ciclos (
  id text primary key,
  nombre text not null,
  fecha_inicio date,
  fecha_fin date,
  area_m2 numeric default 10,
  estado text default 'planificado',
  objetivo text,
  observaciones text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists lotes (
  id text primary key,
  ciclo_id text references ciclos(id) on delete set null,
  nombre text,
  fecha_siembra date,
  estado text default 'activo',
  observaciones text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists bandejas (
  id text primary key,
  lote text,
  ciclo_id text references ciclos(id) on delete set null,
  estante text,
  qr_payload text,
  estado text default 'activa',
  observaciones text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- 6. COSECHAS / TRAZABILIDAD
-- =========================

create table if not exists cosechas (
  id uuid primary key default gen_random_uuid(),
  fecha date not null default current_date,
  lote text not null,
  ciclo_id text references ciclos(id) on delete set null,
  bandeja_id text references bandejas(id) on delete set null,
  vuelta integer,
  estante text,
  kg_premium numeric default 0,
  kg_comercial numeric default 0,
  kg_merma numeric default 0,
  cliente text,
  destino text,
  notas text,
  created_at timestamptz default now()
);

-- =========================
-- 7. TAREAS OPERATIVAS
-- =========================

create table if not exists tareas (
  id uuid primary key default gen_random_uuid(),
  titulo text not null,
  descripcion text,
  fecha_limite date,
  prioridad text default 'media',
  estado text default 'pendiente',
  responsable text,
  fase_id text references fases(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- =========================
-- 8. ALERTAS
-- =========================

create table if not exists alertas (
  id uuid primary key default gen_random_uuid(),
  tipo text not null,
  severidad text default 'media',
  mensaje text not null,
  origen text,
  resuelta boolean default false,
  resuelta_por text,
  resuelta_at timestamptz,
  created_at timestamptz default now()
);

-- =========================
-- 9. MÉTRICAS PARA INVERSIONISTAS
-- =========================

create table if not exists inversionistas_metricas (
  id uuid primary key default gen_random_uuid(),
  ciclo_id text references ciclos(id) on delete cascade,
  produccion_total numeric default 0,
  rendimiento_kg_m2 numeric default 0,
  costo_acumulado numeric default 0,
  ingreso_estimado numeric default 0,
  margen_estimado numeric default 0,
  merma_porcentaje numeric default 0,
  observaciones text,
  created_at timestamptz default now()
);

-- =========================
-- 10. ÍNDICES RECOMENDADOS
-- =========================

create index if not exists idx_avances_cronograma_fase_id on avances_cronograma(fase_id);
create index if not exists idx_avances_cronograma_fecha on avances_cronograma(fecha);

create index if not exists idx_registros_fecha on registros_ambientales(fecha);
create index if not exists idx_registros_fase on registros_ambientales(fase);
create index if not exists idx_registros_bandeja on registros_ambientales(bandeja_id);

create index if not exists idx_cosechas_fecha on cosechas(fecha);
create index if not exists idx_cosechas_lote on cosechas(lote);
create index if not exists idx_cosechas_ciclo on cosechas(ciclo_id);
create index if not exists idx_cosechas_bandeja on cosechas(bandeja_id);

create index if not exists idx_tareas_estado on tareas(estado);
create index if not exists idx_tareas_fecha_limite on tareas(fecha_limite);

create index if not exists idx_alertas_resuelta on alertas(resuelta);
create index if not exists idx_alertas_created_at on alertas(created_at);

-- =========================
-- 11. ROW LEVEL SECURITY
-- Inicialmente activo. Las políticas se afinan cuando creemos login/roles.
-- =========================

alter table fases enable row level security;
alter table avances_cronograma enable row level security;
alter table proveedores enable row level security;
alter table inventario enable row level security;
alter table registros_ambientales enable row level security;
alter table ciclos enable row level security;
alter table lotes enable row level security;
alter table bandejas enable row level security;
alter table cosechas enable row level security;
alter table tareas enable row level security;
alter table alertas enable row level security;
alter table inversionistas_metricas enable row level security;

-- =========================
-- 12. POLÍTICAS TEMPORALES DE LECTURA PÚBLICA
-- Para que el MVP pueda leer datos desde la app.
-- Luego se reemplazan con Auth y roles.
-- =========================

drop policy if exists "public read fases" on fases;
create policy "public read fases" on fases for select using (true);

drop policy if exists "public read avances_cronograma" on avances_cronograma;
create policy "public read avances_cronograma" on avances_cronograma for select using (true);

drop policy if exists "public read proveedores" on proveedores;
create policy "public read proveedores" on proveedores for select using (true);

drop policy if exists "public read inventario" on inventario;
create policy "public read inventario" on inventario for select using (true);

drop policy if exists "public read registros_ambientales" on registros_ambientales;
create policy "public read registros_ambientales" on registros_ambientales for select using (true);

drop policy if exists "public read ciclos" on ciclos;
create policy "public read ciclos" on ciclos for select using (true);

drop policy if exists "public read lotes" on lotes;
create policy "public read lotes" on lotes for select using (true);

drop policy if exists "public read bandejas" on bandejas;
create policy "public read bandejas" on bandejas for select using (true);

drop policy if exists "public read cosechas" on cosechas;
create policy "public read cosechas" on cosechas for select using (true);

drop policy if exists "public read tareas" on tareas;
create policy "public read tareas" on tareas for select using (true);

drop policy if exists "public read alertas" on alertas;
create policy "public read alertas" on alertas for select using (true);

drop policy if exists "public read inversionistas_metricas" on inversionistas_metricas;
create policy "public read inversionistas_metricas" on inversionistas_metricas for select using (true);

-- =========================
-- 13. POLÍTICAS TEMPORALES DE INSERCIÓN
-- Solo para MVP. Luego se cierran con Auth.
-- =========================

drop policy if exists "public insert avances_cronograma" on avances_cronograma;
create policy "public insert avances_cronograma" on avances_cronograma for insert with check (true);

drop policy if exists "public insert registros_ambientales" on registros_ambientales;
create policy "public insert registros_ambientales" on registros_ambientales for insert with check (true);

drop policy if exists "public insert cosechas" on cosechas;
create policy "public insert cosechas" on cosechas for insert with check (true);

drop policy if exists "public insert alertas" on alertas;
create policy "public insert alertas" on alertas for insert with check (true);

-- =========================
-- 14. DATOS INICIALES MÍNIMOS
-- =========================

insert into ciclos (id, nombre, fecha_inicio, fecha_fin, area_m2, estado, objetivo)
values
  ('C1', 'Ciclo 1 — Piloto 10m²', '2026-03-26', '2026-05-28', 10, 'planificado', 'Validar ambiente, proveedores, costos, rendimiento y trazabilidad.')
on conflict (id) do nothing;

insert into lotes (id, ciclo_id, nombre, fecha_siembra, estado)
values
  ('MB-AB-001', 'C1', 'Lote MB-AB-001', '2026-03-26', 'activo')
on conflict (id) do nothing;

