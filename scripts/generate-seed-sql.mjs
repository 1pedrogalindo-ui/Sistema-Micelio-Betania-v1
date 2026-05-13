import fs from 'fs';
import vm from 'vm';

const source = fs.readFileSync('data/seed.ts', 'utf8');

// Convierte exports TS simples a JS ejecutable
const js = source.replace(/export const\s+/g, 'const ');

const sandbox = {};
vm.createContext(sandbox);

vm.runInContext(
  js + `
  ;globalThis.__DATA__ = {
    FASES_PILOTO: typeof FASES_PILOTO !== 'undefined' ? FASES_PILOTO : [],
    PROVEEDORES: typeof PROVEEDORES !== 'undefined' ? PROVEEDORES : [],
    INVENTARIO_INICIAL: typeof INVENTARIO_INICIAL !== 'undefined' ? INVENTARIO_INICIAL : []
  };
  `,
  sandbox
);

const { FASES_PILOTO, PROVEEDORES, INVENTARIO_INICIAL } = sandbox.__DATA__;

function sqlText(value) {
  if (value === undefined || value === null || value === '') return 'null';
  return `'${String(value).replace(/'/g, "''")}'`;
}

function sqlNumber(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function jsonb(value) {
  return `'${JSON.stringify(value ?? []).replace(/'/g, "''")}'::jsonb`;
}

function slug(value, fallback) {
  return String(value || fallback || `id-${Date.now()}`)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

let sql = `-- =========================================================
-- SISTEMA MICELIO BETANIA — SEED DATA
-- Generado automáticamente desde data/seed.ts
-- =========================================================

`;

// =========================
// FASES
// =========================

sql += `-- =========================
-- FASES / CRONOGRAMA
-- =========================

`;

for (const fase of FASES_PILOTO || []) {
  sql += `insert into fases (
  id,
  nombre,
  semana,
  fecha_inicio,
  fecha_fin,
  estado,
  descripcion,
  actividades,
  urgencia,
  porcentaje_avance
) values (
  ${sqlText(fase.id)},
  ${sqlText(fase.nombre)},
  ${sqlText(fase.semana)},
  ${sqlText(fase.fechaInicio)},
  ${sqlText(fase.fechaFin)},
  ${sqlText(fase.estado || 'pendiente')},
  ${sqlText(fase.descripcion)},
  ${jsonb(fase.actividades || [])},
  ${sqlText(fase.urgencia)},
  ${sqlNumber(fase.porcentajeAvance || 0)}
)
on conflict (id) do update set
  nombre = excluded.nombre,
  semana = excluded.semana,
  fecha_inicio = excluded.fecha_inicio,
  fecha_fin = excluded.fecha_fin,
  estado = excluded.estado,
  descripcion = excluded.descripcion,
  actividades = excluded.actividades,
  urgencia = excluded.urgencia,
  porcentaje_avance = excluded.porcentaje_avance,
  updated_at = now();

`;
}

// =========================
// PROVEEDORES
// =========================

sql += `-- =========================
-- PROVEEDORES
-- =========================

`;

for (const proveedor of PROVEEDORES || []) {
  const notasExtra = [
    proveedor.notas,
    proveedor.contacto ? `Contacto: ${proveedor.contacto}` : '',
    Array.isArray(proveedor.productos) && proveedor.productos.length
      ? `Productos: ${proveedor.productos.join(', ')}`
      : '',
  ].filter(Boolean).join(' | ');

  sql += `insert into proveedores (
  id,
  nombre,
  categoria,
  ubicacion,
  telefono,
  email,
  web,
  precio,
  notas,
  estado,
  prioridad
) values (
  ${sqlText(proveedor.id || slug(proveedor.nombre))},
  ${sqlText(proveedor.nombre)},
  ${sqlText(proveedor.categoria)},
  ${sqlText(proveedor.ubicacion)},
  ${sqlText(proveedor.telefono)},
  ${sqlText(proveedor.email)},
  ${sqlText(proveedor.web)},
  ${sqlText(proveedor.precio)},
  ${sqlText(notasExtra)},
  ${sqlText(proveedor.estado || 'por-contactar')},
  ${sqlText(proveedor.prioridad || 'media')}
)
on conflict (id) do update set
  nombre = excluded.nombre,
  categoria = excluded.categoria,
  ubicacion = excluded.ubicacion,
  telefono = excluded.telefono,
  email = excluded.email,
  web = excluded.web,
  precio = excluded.precio,
  notas = excluded.notas,
  estado = excluded.estado,
  prioridad = excluded.prioridad,
  updated_at = now();

`;
}

// =========================
// INVENTARIO
// =========================

sql += `-- =========================
-- INVENTARIO
-- =========================

`;

for (const item of INVENTARIO_INICIAL || []) {
  const itemId = item.id || slug(item.item || item.nombre);
  const itemNombre = item.item || item.nombre || itemId;
  const precioUnit = item.precioUnit ?? item.precio_unit ?? item.precioUnitario ?? 0;
  const fechaLimite = item.fechaLimite ?? item.fecha_limite ?? null;

  sql += `insert into inventario (
  id,
  item,
  categoria,
  cantidad,
  precio_unit,
  urgencia,
  fecha_limite,
  estado,
  notas
) values (
  ${sqlText(itemId)},
  ${sqlText(itemNombre)},
  ${sqlText(item.categoria)},
  ${sqlNumber(item.cantidad || 0)},
  ${sqlNumber(precioUnit)},
  ${sqlText(item.urgencia || 'media')},
  ${sqlText(fechaLimite)},
  ${sqlText(item.estado || 'pendiente')},
  ${sqlText(item.notas || '')}
)
on conflict (id) do update set
  item = excluded.item,
  categoria = excluded.categoria,
  cantidad = excluded.cantidad,
  precio_unit = excluded.precio_unit,
  urgencia = excluded.urgencia,
  fecha_limite = excluded.fecha_limite,
  estado = excluded.estado,
  notas = excluded.notas,
  updated_at = now();

`;
}

sql += `-- =========================
-- AVANCE INICIAL DEL CRONOGRAMA
-- =========================

insert into avances_cronograma (
  fase_id,
  porcentaje,
  estado,
  descripcion,
  responsable,
  siguiente_accion
) values (
  'fase-prep-2',
  0,
  'pendiente',
  'Carga inicial del cronograma del piloto Micelio Betania.',
  'Sistema',
  'Registrar el primer avance operativo real.'
)
on conflict do nothing;

`;

fs.writeFileSync('supabase/seed.sql', sql);

console.log('Seed generado correctamente: supabase/seed.sql');
console.log(`Fases: ${FASES_PILOTO?.length || 0}`);
console.log(`Proveedores: ${PROVEEDORES?.length || 0}`);
console.log(`Inventario: ${INVENTARIO_INICIAL?.length || 0}`);
