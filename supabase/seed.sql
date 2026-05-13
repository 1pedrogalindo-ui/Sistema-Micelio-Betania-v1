-- =========================================================
-- SISTEMA MICELIO BETANIA — SEED DATA
-- Generado automáticamente desde data/seed.ts
-- =========================================================

-- =========================
-- FASES / CRONOGRAMA
-- =========================

insert into fases (
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
  'fase-prep-2',
  'Adecuación cuarto + Compra equipos',
  'Semana 2 (Prep)',
  '2026-03-12',
  '2026-03-19',
  'pendiente',
  'Vaciar cuarto, reparar filtraciones, aplicar pintura lavable. Comprar e instalar equipamiento.',
  '["Vaciar cuarto completamente","Reparar filtraciones en techo y paredes","Aplicar pintura lavable o epóxico","Instalar estanterías metálicas","Instalar sensor CO₂, extractor, humidificador","Primera desinfección profunda"]'::jsonb,
  'critica',
  0
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

insert into fases (
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
  'fase-prep-1',
  'Monitoreo climático en vacío',
  'Semana 1 (Prep)',
  '2026-03-19',
  '2026-03-26',
  'pendiente',
  'Establecer línea base climática y confirmar proveedores.',
  '["Medir T°, HR y CO₂ tres veces al día (cuarto vacío)","Probar ciclos de extractor y humidificador","Ajustar temporizadores","Confirmar proveedor de compost","Confirmar proveedor de spawn","Segunda desinfección"]'::jsonb,
  'alta',
  0
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

insert into fases (
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
  'fase-0',
  'DÍA DE SIEMBRA — Apertura Lote MB-AB-001',
  'Semana 0',
  '2026-03-26',
  '2026-03-26',
  'pendiente',
  'Recepción de compost y spawn. Carga de bandejas. Inicio del ciclo.',
  '["Recibir compost — Verificar temperatura (24–26 °C)","Recibir spawn — Inspección, foto, registro","Cargar bandejas (60×40×20 cm, 18–20 cm profundidad)","Mezclar spawn al 1% del peso húmedo del compost","Registrar lote completo en R-08","Cerrar cuarto e iniciar incubación"]'::jsonb,
  'critica',
  0
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

insert into fases (
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
  'fase-1-2',
  'Incubación / Spawn Run',
  'Semanas 1–2',
  '2026-04-02',
  '2026-04-16',
  'pendiente',
  'El micelio invade todo el compost. Temperatura compost 23–25 °C, CO₂ alto tolerado.',
  '["Revisar cada 2–3 días sin perturbar","Registrar T° del compost, HR y CO₂ tres veces/día","Verificar avance del micelio blanco","No ventilar en exceso","CO₂ 8.000–15.000 ppm normal en esta fase"]'::jsonb,
  'media',
  0
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

insert into fases (
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
  'fase-3',
  'Aplicación de Casing',
  'Semana 3',
  '2026-04-16',
  '2026-04-23',
  'pendiente',
  'Preparar y aplicar la capa de cobertura (3–4 cm) sobre el compost colonizado.',
  '["Preparar casing con pH 7,2–7,8","Aplicar 3–4 cm uniformes sobre el compost","Regar fino con spray","Mantener ambiente 20–22 °C y HR 90–95%","Registrar en planilla: fecha, espesor, cantidad, pH"]'::jsonb,
  'alta',
  0
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

insert into fases (
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
  'fase-4',
  'Inducción de Primordios',
  'Semana 4',
  '2026-04-23',
  '2026-04-30',
  'pendiente',
  'Bajar CO₂ por debajo de 1.500 ppm y temperatura a 15–18 °C.',
  '["Aumentar ventilación progresivamente","Bajar temperatura a 15–18 °C","Mantener HR 90–95%","CO₂ < 1.500 ppm","Verificar aparición de primordios (4–6 días)"]'::jsonb,
  'critica',
  0
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

insert into fases (
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
  'fase-5-6',
  'Primera Cosecha (Vuelta 1)',
  'Semanas 5–6',
  '2026-04-30',
  '2026-05-14',
  'pendiente',
  'Cosechar champiñones con sombrero cerrado. Clasificar, empacar y refrigerar en <60 minutos.',
  '["Cosechar en la mañana temprana","Clasificar: premium, comercial, segunda","Pesar y empacar","Refrigerar en <60 minutos a 2–4 °C","Vender a CBI, restaurantes y canastas","Registrar en R-05"]'::jsonb,
  'alta',
  0
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

insert into fases (
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
  'fase-7-8',
  'Segunda y Tercera Vuelta',
  'Semanas 7–8',
  '2026-05-14',
  '2026-05-28',
  'pendiente',
  'Repetir protocolo de cosecha. Documentar rendimiento por vuelta.',
  '["Repetir cosecha, clasificación, venta","Documentar rendimiento por estante","Monitorear señales de agotamiento del compost","Rellenar huecos del casing entre vueltas"]'::jsonb,
  'media',
  0
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

insert into fases (
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
  'fase-9',
  'CIERRE DE CICLO 1 — Análisis y Decisión',
  'Semana 9',
  '2026-05-28',
  '2026-05-28',
  'pendiente',
  'Cierre del piloto. Análisis de resultados y decisión para Ciclo 2.',
  '["Retirar compost agotado (usar como abono)","Lavar y desinfectar el cuarto","Compilar todos los registros","Calcular: rendimiento kg/m², costo/kg, % merma","Definir ajustes para Ciclo 2"]'::jsonb,
  'alta',
  0
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

-- =========================
-- PROVEEDORES
-- =========================

insert into proveedores (
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
  'intiwasi',
  'Intiwasi Productos Naturales',
  'spawn',
  'Tumbaco, Pichincha',
  'Pendiente',
  'contacto@intiwasi-ec.com',
  'https://intiwasi-ec.com/',
  'USD 9-12/kg',
  'CRÍTICO. Tienen Micelio Master. Lead time 7-10 días refrigerado. HACER PEDIDO PRUEBA PEQUEÑO | Contacto: https://www.facebook.com/hongos.organicos/ | Productos: Spawn Agaricus bisporus, Micelio Master, Hongos medicinales',
  'por-contactar',
  'critica'
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

insert into proveedores (
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
  'fungus-garden',
  'The Fungus Garden',
  'spawn',
  'Calacalí, Quito',
  'Pendiente',
  'Por confirmar',
  'https://www.thefungusgarden.com/',
  'TBD',
  'Especialidad: Medicinales. Verificar si venden spawn Agaricus | Contacto: https://www.facebook.com/TheFungusGarden/ | Productos: Hongos comestibles gourmet, Hongos medicinales',
  'por-contactar',
  'alta'
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

insert into proveedores (
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
  'funghi-andino',
  'Funghi Andino',
  'spawn',
  'Tumbaco, Pichincha',
  'Pendiente',
  'Pendiente',
  'Pendiente',
  'TBD',
  'Google Maps + contacto directo | Contacto: Buscar en Google Maps | Productos: Spawn micológico',
  'por-contactar',
  'media'
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

insert into proveedores (
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
  'vivero-camila',
  'Vivero Camila',
  'compost',
  'Nayón, Quito',
  'Pendiente',
  'ventas@viverocamila.com',
  'https://www.viverocamila.com/',
  'USD 0.30-0.45/kg',
  'RECOMENDADO. 900-1200 kg compost + materiales casing | Contacto: ventas@viverocamila.com | Productos: Compost Fase II/III, Turba, Perlita, Vermiculita, Fibra coco, Cal agrícola',
  'por-contactar',
  'critica'
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

insert into proveedores (
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
  'vivero-tulipanes',
  'Vivero Los Tulipanes / Plantas Ecuador',
  'compost',
  'Armenia, Nayón (cerca de Betania)',
  '098 516 6689',
  'Pendiente',
  'https://www.plantas.ec/',
  'USD 0.25-0.40/kg',
  '⭐ MÁS CERCANO A BETANIA (15-20 min). Martes-domingo 8:30-17:00 | Contacto: WhatsApp: 098 516 6689 | Productos: Compost, Insumos hortícolas',
  'por-contactar',
  'alta'
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

insert into proveedores (
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
  'corpcultivos',
  'Corpcultivos',
  'compost',
  'Quito (distribuidor nacional)',
  'Pendiente',
  'Pendiente',
  'https://corpcultivos.com.ec/',
  'USD 0.30-0.50/kg',
  '29 años experiencia. Asesoría técnica para 2.500 m | Contacto: Web | Productos: Insumos agrícolas profesionales, Asesoría técnica',
  'por-contactar',
  'media'
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

insert into proveedores (
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
  'amazon-ec',
  'Amazon.com.ec — Sensor CO₂ MH-Z19',
  'equipamiento',
  'Online',
  'N/A',
  'N/A',
  'https://www.amazon.com.ec/',
  'USD 25-120',
  'CRÍTICO. Lead time 7-10 días. URGENCIA MÁXIMA — pedir AHORA | Contacto: https://www.amazon.com.ec/ | Productos: Sensor CO₂ MH-Z19, Termohigrómetros, Humidificador ultrasónico',
  'por-pedir',
  'critica'
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

insert into proveedores (
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
  'ferreteria-ec',
  'Ferretería Ecuatoriana',
  'equipamiento',
  'Múltiples sucursales Quito',
  'Pendiente',
  'Pendiente',
  'Pendiente',
  'USD 80-150/estantería, USD 4-8/bandeja',
  'Múltiples sucursales. Cotizar set completo | Contacto: Visita presencial | Productos: Estanterías metálicas, Bandejas plásticas, Extractor, Ducto',
  'por-cotizar',
  'alta'
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

insert into proveedores (
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
  'fybeca',
  'Fybeca / Farmacias',
  'higiene',
  'Múltiples sucursales',
  'N/A',
  'N/A',
  'https://www.fybeca.com/',
  'USD 5-30 por producto',
  'Stock mensual permanente | Contacto: Visita | Productos: Alcohol 70%, Guantes nitrilo, Mascarillas N95',
  'disponible',
  'baja'
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

insert into proveedores (
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
  'empaques-ec',
  'Empaques Ecuatorianos',
  'empaque',
  'Quito',
  'Pendiente',
  'Pendiente',
  'Pendiente',
  'USD 0.30-0.80/unidad',
  'Necesario antes de primera cosecha (30/04) | Contacto: Por confirmar | Productos: Bandejas PET 200g/250g/500g/1kg, Film microperforado',
  'por-contactar',
  'media'
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

-- =========================
-- INVENTARIO
-- =========================

insert into inventario (
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
  'inv-1',
  'Sensor CO₂ NDIR (MH-Z19)',
  'Monitoreo',
  1,
  30,
  'critica',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-2',
  'Termohigrómetro digital',
  'Monitoreo',
  3,
  22,
  'critica',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-3',
  'Extractor axial 100-125mm',
  'Ventilación',
  1,
  75,
  'critica',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-4',
  'Ducto + filtro manta',
  'Ventilación',
  1,
  30,
  'alta',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-5',
  'Humidificador ultrasónico 4-6L',
  'Humidificación',
  1,
  55,
  'alta',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-6',
  'Temporizadores digitales',
  'Control',
  3,
  14,
  'media',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-7',
  'Estantería metálica galvanizada (3 niveles)',
  'Estructura',
  3,
  115,
  'critica',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-8',
  'Bandejas plásticas 60×40×20 cm',
  'Cultivo',
  60,
  6,
  'critica',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-9',
  'Spawn Agaricus bisporus (kg)',
  'Insumos',
  12,
  10,
  'critica',
  '2026-03-26',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-10',
  'Compost Fase III colonizado (kg)',
  'Insumos',
  1000,
  0.38,
  'critica',
  '2026-03-26',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-11',
  'Turba de musgo (L)',
  'Casing',
  80,
  0.75,
  'alta',
  '2026-04-16',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-12',
  'Fibra de coco lavada (L)',
  'Casing',
  40,
  0.45,
  'alta',
  '2026-04-16',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-13',
  'Vermiculita (L)',
  'Casing',
  20,
  1.15,
  'alta',
  '2026-04-16',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-14',
  'Cal agrícola (kg)',
  'Casing',
  5,
  0.75,
  'alta',
  '2026-04-16',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-15',
  'Refrigeradora exclusiva',
  'Postcosecha',
  1,
  375,
  'alta',
  '2026-04-30',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-16',
  'Bandejas PET (200g)',
  'Empaque',
  300,
  0.15,
  'media',
  '2026-04-30',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-17',
  'Film microperforado (m)',
  'Empaque',
  50,
  0.4,
  'media',
  '2026-04-30',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-18',
  'Etiquetas impresas',
  'Empaque',
  500,
  0.1,
  'media',
  '2026-04-30',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-19',
  'Alcohol 70% (L)',
  'Higiene',
  10,
  7,
  'media',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-20',
  'Amonio cuaternario alimentario (L)',
  'Higiene',
  5,
  30,
  'media',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-21',
  'Guantes nitrilo (caja 100)',
  'EPP',
  2,
  22,
  'media',
  '2026-03-12',
  'pendiente',
  null
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

insert into inventario (
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
  'inv-22',
  'Mascarillas N95 (caja 50)',
  'EPP',
  1,
  20,
  'media',
  '2026-03-12',
  'pendiente',
  null
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

-- =========================
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

