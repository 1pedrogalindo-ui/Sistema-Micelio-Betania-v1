'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  FileText,
  Download,
  RefreshCw,
  BookOpen,
  BarChart3,
  DollarSign,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function num(n: number, d = 1) {
  return Number(n || 0).toFixed(d);
}

function fecha(value: any) {
  if (!value) return '';
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}`;
}

function escapeHtml(v: any) {
  return String(v ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}



async function downloadServerPdf(endpoint: string, filename: string) {
  const supabase = getSupabaseBrowserClient();

  if (!supabase) {
    alert('Supabase no está configurado.');
    return;
  }

  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;

  if (!token) {
    alert('Tu sesión expiró. Vuelve a iniciar sesión.');
    return;
  }

  const res = await fetch(endpoint, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    const error = await res.text();
    console.error(error);
    alert('No se pudo generar el PDF.');
    return;
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();

  URL.revokeObjectURL(url);
}

function downloadCsv(filename: string, rows: any[]) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const value = row[h] ?? '';
          return `"${String(value).replaceAll('"', '""')}"`;
        })
        .join(',')
    ),
  ].join('\n');

  const blob = new Blob(['\ufeff', csv], {
    type: 'text/csv;charset=utf-8',
  });

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default function Reportes() {
  const [fases, setFases] = useState<any[]>([]);
  const [avances, setAvances] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [estanterias, setEstanterias] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMensaje('La base de datos no está configurada.');
      setCargando(false);
      return;
    }

    const [
      fasesRes,
      avancesRes,
      inventarioRes,
      proveedoresRes,
      registrosRes,
      cosechasRes,
      bandejasRes,
      estanteriasRes,
      auditRes,
    ] = await Promise.all([
      supabase.from('fases').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('avances_cronograma').select('*').order('fecha', { ascending: false }),
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('proveedores').select('*').order('nombre', { ascending: true }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }),
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    const errores = [
      fasesRes.error,
      avancesRes.error,
      inventarioRes.error,
      proveedoresRes.error,
      registrosRes.error,
      cosechasRes.error,
      bandejasRes.error,
      estanteriasRes.error,
      auditRes.error,
    ].filter(Boolean);

    if (errores.length) {
      console.error(errores);
      setMensaje(`Carga parcial: ${errores[0]?.message}`);
    } else {
      setMensaje('');
    }

    setFases(fasesRes.data || []);
    setAvances(avancesRes.data || []);
    setInventario(inventarioRes.data || []);
    setProveedores(proveedoresRes.data || []);
    setRegistros(registrosRes.data || []);
    setCosechas(cosechasRes.data || []);
    setBandejas(bandejasRes.data || []);
    setEstanterias(estanteriasRes.data || []);
    setAuditLog(auditRes.data || []);
    setCargando(false);
  };

  const metricas = useMemo(() => {
    const costoInventario = inventario.reduce(
      (s, i) => s + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
      0
    );

    const premium = cosechas.reduce((s, c) => s + Number(c.kg_premium || 0), 0);
    const comercial = cosechas.reduce((s, c) => s + Number(c.kg_comercial || 0), 0);
    const merma = cosechas.reduce((s, c) => s + Number(c.kg_merma || 0), 0);
    const totalKg = premium + comercial + merma;
    const vendible = premium + comercial;
    const ingreso = premium * 4.5 + comercial * 3.25;
    const margen = ingreso - costoInventario;
    const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;
    const kgM2 = totalKg / 10;

    const avance =
      fases.length > 0
        ? (fases.filter((f) => f.estado === 'completado').length / fases.length) * 100
        : 0;

    return {
      costoInventario,
      premium,
      comercial,
      merma,
      totalKg,
      vendible,
      ingreso,
      margen,
      mermaPct,
      kgM2,
      avance,
    };
  }, [inventario, cosechas, fases]);

  const generarManualActualizado = () => {
    const cronogramaRows = fases
      .map((f) => {
        const actividades = Array.isArray(f.actividades) ? f.actividades : [];
        return `
          <tr>
            <td><strong>${escapeHtml(f.semana || '')}</strong></td>
            <td>${escapeHtml(f.nombre || '')}</td>
            <td>${fecha(f.fecha_inicio)} → ${fecha(f.fecha_fin)}</td>
            <td>${escapeHtml(f.estado || '')}</td>
            <td>${escapeHtml(f.urgencia || '')}</td>
            <td>
              <ul>
                ${actividades.map((a: string) => `<li>${escapeHtml(a)}</li>`).join('')}
              </ul>
            </td>
          </tr>
        `;
      })
      .join('');

    const html = `
      <div class="pdf-page">
        <div class="cover">
          <div class="brand-row">
            <div>
              <div class="doc-label">Documento operativo actualizado</div>
              <h1 class="brand-title">Micelio <span>Betania</span></h1>
            </div>
            <div class="confidencial">
              Documento operativo<br/>
              Confidencial<br/>
              Versión sistema
            </div>
          </div>

          <h1>Manual Operativo Actualizado — Piloto de Champiñón Blanco</h1>
          <p><strong>Cuarto cerrado de 10 m² · Betania, Alangasí · Valle de los Chillos</strong></p>
          <p><strong>Especie:</strong> Agaricus bisporus · Champiñón blanco</p>
          <p><strong>Área piloto:</strong> 10 m² físicos · hasta 30 m² efectivos</p>
          <p><strong>Fecha de generación:</strong> ${new Date().toLocaleString('es-EC')}</p>
          <p class="muted">
            Documento generado desde el Sistema Micelio Betania con cronograma parametrizado en Supabase.
          </p>
        </div>

        <div class="kpis">
          <div class="kpi"><div class="label">Avance</div><div class="value">${num(metricas.avance, 0)}%</div></div>
          <div class="kpi"><div class="label">Producción</div><div class="value">${num(metricas.totalKg)} kg</div></div>
          <div class="kpi"><div class="label">Ingreso est.</div><div class="value">${money(metricas.ingreso)}</div></div>
          <div class="kpi"><div class="label">Merma</div><div class="value">${num(metricas.mermaPct)}%</div></div>
        </div>

        <h2>Resumen ejecutivo</h2>
      <p>
        Este manual operativo consolida el proceso del piloto de champiñón blanco de Micelio Betania,
        integrando el cronograma operativo actualizado, registros de control, producción, costos,
        trazabilidad e indicadores para la toma de decisiones.
      </p>

      </div>

      <div class="pdf-page page-break">
      <h2>Cronograma actualizado</h2>
      <table>
        <thead>
          <tr>
            <th>Semana</th>
            <th>Fase</th>
            <th>Fechas</th>
            <th>Estado</th>
            <th>Urgencia</th>
            <th>Actividades</th>
          </tr>
        </thead>
        <tbody>${cronogramaRows}</tbody>
      </table>

      </div>

      <div class="pdf-page page-break">
      <h2>Parámetros técnicos base</h2>
      <table>
        <thead>
          <tr>
            <th>Etapa</th>
            <th>Temperatura</th>
            <th>Humedad</th>
            <th>CO₂</th>
            <th>Observación operativa</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Incubación</td>
            <td>Compost 23–25 °C · Aire 20–24 °C</td>
            <td>85–90%</td>
            <td>8.000–15.000 ppm tolerado</td>
            <td>No ventilar en exceso; controlar temperatura del compost.</td>
          </tr>
          <tr>
            <td>Fructificación</td>
            <td>Aire 15–18 °C · Compost 16–20 °C</td>
            <td>88–95%</td>
            <td>&lt; 1.500 ppm</td>
            <td>Aumentar ventilación progresivamente sin secar el casing.</td>
          </tr>
          <tr>
            <td>Postcosecha</td>
            <td>2–4 °C</td>
            <td>Cadena de frío</td>
            <td>No aplica</td>
            <td>Cosechar, clasificar, empacar y enfriar en menos de 60 minutos.</td>
          </tr>
        </tbody>
      </table>

      <h2>Registros operativos requeridos</h2>
      <table>
        <thead>
          <tr>
            <th>Código</th>
            <th>Registro</th>
            <th>Frecuencia</th>
            <th>Datos clave</th>
          </tr>
        </thead>
        <tbody>
          <tr><td>R-01</td><td>Ambiente del cuarto</td><td>3 veces al día</td><td>Temperatura, HR, CO₂, acción tomada</td></tr>
          <tr><td>R-02</td><td>Temperatura compost</td><td>Diario</td><td>Temperatura interior y acciones</td></tr>
          <tr><td>R-03</td><td>Riegos</td><td>Cada evento</td><td>Hora, cantidad, condición del casing</td></tr>
          <tr><td>R-04</td><td>Incidencias sanitarias</td><td>Cuando ocurran</td><td>Foto, bandeja afectada, acción correctiva</td></tr>
          <tr><td>R-05</td><td>Cosecha</td><td>Cada cosecha</td><td>Lote, kg premium, comercial, merma, cliente</td></tr>
          <tr><td>R-08</td><td>Datos del lote</td><td>Apertura y cierre</td><td>Compost, spawn, siembra, casing, cosecha, kg totales</td></tr>
        </tbody>
      </table>

      </div>

      <div class="pdf-page page-break">
      <h2>Indicadores actuales del sistema</h2>
      <table>
        <tbody>
          <tr><td>Producción premium</td><td>${num(metricas.premium)} kg</td></tr>
          <tr><td>Producción comercial</td><td>${num(metricas.comercial)} kg</td></tr>
          <tr><td>Merma</td><td>${num(metricas.merma)} kg · ${num(metricas.mermaPct)}%</td></tr>
          <tr><td>Producción total</td><td>${num(metricas.totalKg)} kg</td></tr>
          <tr><td>Rendimiento</td><td>${num(metricas.kgM2, 2)} kg/m²</td></tr>
          <tr><td>Ingreso estimado</td><td>${money(metricas.ingreso)}</td></tr>
          <tr><td>Costo inventario</td><td>${money(metricas.costoInventario)}</td></tr>
          <tr><td>Margen estimado</td><td>${money(metricas.margen)}</td></tr>
        </tbody>
      </table>

      <h2>Decisión operativa</h2>
      <div class="section-card">
        <p>
          El ciclo debe evaluarse por rendimiento kg/m², estabilidad ambiental, merma, costo real por kg,
          trazabilidad y capacidad de vender producto premium/comercial. No se recomienda escalar por entusiasmo,
          sino por evidencia operativa documentada.
        </p>
      </div>

      <div class="footer-note">
        Micelio Betania × CBI Betania · Manual Operativo Piloto 10 m² · Champiñón Blanco Agaricus bisporus ·
        Documento confidencial de uso estratégico · Generado automáticamente desde el sistema.
      </div>
      </div>
    `;

    downloadServerPdf('/api/reports/manual', 'Micelio_Betania_Manual_Operativo_Actualizado.pdf');
  };

  const generarReporteOperativo = () => {
    const html = `
      <div class="cover">
        <span class="badge">Reporte operativo</span>
        <h1>Micelio Betania</h1>
        <h2>Reporte Operativo del Piloto 10 m²</h2>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-EC')}</p>
      </div>

      <div class="kpis">
        <div class="kpi"><div class="label">Fases</div><div class="value">${fases.length}</div></div>
        <div class="kpi"><div class="label">Avance</div><div class="value">${num(metricas.avance, 0)}%</div></div>
        <div class="kpi"><div class="label">Bandejas</div><div class="value">${bandejas.length}</div></div>
        <div class="kpi"><div class="label">Registros</div><div class="value">${registros.length}</div></div>
      </div>

      <h2>Cronograma</h2>
      <table>
        <thead><tr><th>Fase</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Avance</th></tr></thead>
        <tbody>
          ${fases.map((f) => `
            <tr>
              <td>${escapeHtml(f.nombre)}</td>
              <td>${fecha(f.fecha_inicio)}</td>
              <td>${fecha(f.fecha_fin)}</td>
              <td>${escapeHtml(f.estado)}</td>
              <td>${Number(f.porcentaje_avance || 0)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <h2>Últimos registros ambientales</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Fase</th><th>Temp aire</th><th>Temp compost</th><th>HR</th><th>CO₂</th><th>Notas</th></tr></thead>
        <tbody>
          ${registros.slice(0, 30).map((r) => `
            <tr>
              <td>${escapeHtml(r.fecha)}</td>
              <td>${escapeHtml(r.fase)}</td>
              <td>${r.temperatura_aire ?? ''}</td>
              <td>${r.temperatura_compost ?? ''}</td>
              <td>${r.humedad ?? ''}</td>
              <td>${r.co2 ?? ''}</td>
              <td>${escapeHtml(r.notas)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    alert('El reporte operativo será migrado al nuevo motor PDF profesional. Por ahora usa el Manual Operativo actualizado.');
  };

  const generarReporteFinanciero = () => {
    const html = `
      <div class="cover">
        <span class="badge">Reporte financiero</span>
        <h1>Micelio Betania</h1>
        <h2>Costos, Producción y ROI</h2>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-EC')}</p>
      </div>

      <div class="kpis">
        <div class="kpi"><div class="label">Costo</div><div class="value">${money(metricas.costoInventario)}</div></div>
        <div class="kpi"><div class="label">Ingreso</div><div class="value">${money(metricas.ingreso)}</div></div>
        <div class="kpi"><div class="label">Margen</div><div class="value">${money(metricas.margen)}</div></div>
        <div class="kpi"><div class="label">Kg/m²</div><div class="value">${num(metricas.kgM2, 2)}</div></div>
      </div>

      <h2>Inventario valorizado</h2>
      <table>
        <thead><tr><th>Item</th><th>Categoría</th><th>Cantidad</th><th>P. Unit</th><th>Total</th><th>Estado</th></tr></thead>
        <tbody>
          ${inventario.map((i) => {
            const total = Number(i.cantidad || 0) * Number(i.precio_unit || 0);
            return `
              <tr>
                <td>${escapeHtml(i.item)}</td>
                <td>${escapeHtml(i.categoria)}</td>
                <td>${i.cantidad}</td>
                <td>${money(i.precio_unit)}</td>
                <td>${money(total)}</td>
                <td>${escapeHtml(i.estado)}</td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>

      <h2>Cosechas</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Lote</th><th>Bandeja</th><th>Premium</th><th>Comercial</th><th>Merma</th><th>Cliente</th></tr></thead>
        <tbody>
          ${cosechas.map((c) => `
            <tr>
              <td>${fecha(c.fecha)}</td>
              <td>${escapeHtml(c.lote)}</td>
              <td>${escapeHtml(c.bandeja_id)}</td>
              <td>${c.kg_premium}</td>
              <td>${c.kg_comercial}</td>
              <td>${c.kg_merma}</td>
              <td>${escapeHtml(c.cliente)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    alert('El reporte financiero será migrado al nuevo motor PDF profesional. Por ahora usa el Manual Operativo actualizado.');
  };

  const generarReporteInversionistas = () => {
    const listo =
      metricas.avance >= 80 &&
      metricas.kgM2 >= 8 &&
      metricas.mermaPct <= 10 &&
      metricas.totalKg > 0;

    const html = `
      <div class="cover">
        <span class="badge">Reporte inversionistas</span>
        <h1>Micelio Betania</h1>
        <h2>Reporte Ejecutivo — Momento 2</h2>
        <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-EC')}</p>
      </div>

      <h2>Tesis de inversión</h2>
      <p>
        El piloto busca validar producción, control ambiental, trazabilidad, costo real por kg,
        merma y capacidad de venta antes de escalar.
      </p>

      <div class="kpis">
        <div class="kpi"><div class="label">Avance</div><div class="value">${num(metricas.avance, 0)}%</div></div>
        <div class="kpi"><div class="label">Producción</div><div class="value">${num(metricas.totalKg)} kg</div></div>
        <div class="kpi"><div class="label">Kg/m²</div><div class="value">${num(metricas.kgM2, 2)}</div></div>
        <div class="kpi"><div class="label">Merma</div><div class="value">${num(metricas.mermaPct)}%</div></div>
      </div>

      <h2>Semáforo Momento 2</h2>
      <table>
        <tbody>
          <tr><td>Avance operativo ≥80%</td><td>${metricas.avance >= 80 ? 'Cumple' : 'Pendiente'}</td></tr>
          <tr><td>Rendimiento ≥8 kg/m²</td><td>${metricas.kgM2 >= 8 ? 'Cumple' : 'Pendiente'}</td></tr>
          <tr><td>Merma ≤10%</td><td>${metricas.mermaPct <= 10 && metricas.totalKg > 0 ? 'Cumple' : 'Pendiente'}</td></tr>
          <tr><td>Producto vendible registrado</td><td>${metricas.vendible > 0 ? 'Cumple' : 'Pendiente'}</td></tr>
          <tr><td>Decisión</td><td><strong>${listo ? 'Listo para evaluar expansión' : 'Continuar validación'}</strong></td></tr>
        </tbody>
      </table>

      <h2>Evidencia de auditoría reciente</h2>
      <table>
        <thead><tr><th>Fecha</th><th>Usuario</th><th>Acción</th><th>Tabla</th><th>Descripción</th></tr></thead>
        <tbody>
          ${auditLog.slice(0, 20).map((a) => `
            <tr>
              <td>${escapeHtml(a.created_at)}</td>
              <td>${escapeHtml(a.user_email)}</td>
              <td>${escapeHtml(a.accion)}</td>
              <td>${escapeHtml(a.tabla)}</td>
              <td>${escapeHtml(a.descripcion)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    alert('El reporte para inversionistas será migrado al nuevo motor PDF profesional. Por ahora usa el Manual Operativo actualizado.');
  };

  const exportarDatosCsv = () => {
    downloadCsv('Micelio_Betania_Cosechas.csv', cosechas);
    downloadCsv('Micelio_Betania_Inventario.csv', inventario);
    downloadCsv('Micelio_Betania_Registros_Ambientales.csv', registros);
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Documentos & Reportería
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Reportes</h1>
          <p className="text-tierra-600 max-w-3xl">
            Genera PDFs descargables con datos actuales del sistema, incluyendo el Manual Operativo actualizado con el cronograma vigente.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          {mensaje}
        </div>
      )}

      <div className="grid md:grid-cols-4 gap-4">
        <KPI label="Fases" value={fases.length} />
        <KPI label="Registros" value={registros.length} />
        <KPI label="Cosechas" value={cosechas.length} />
        <KPI label="Avance" value={`${num(metricas.avance, 0)}%`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <ReportCard
          icon={BookOpen}
          title="Manual Operativo actualizado"
          text="Documento completo con cronograma vigente, parámetros técnicos, registros requeridos e indicadores actuales."
          button="Descargar PDF"
          onClick={() => downloadServerPdf('/api/reports/manual', 'Micelio_Betania_Manual_Operativo_Actualizado.pdf')}
        />

        <ReportCard
          icon={BarChart3}
          title="Reporte operativo"
          text="Cronograma, avances, registros ambientales, infraestructura y estado general del piloto."
          button="Descargar PDF"
          onClick={generarReporteOperativo}
        />

        <ReportCard
          icon={DollarSign}
          title="Reporte financiero"
          text="Inventario valorizado, cosechas, ingreso estimado, margen, merma y costo operativo."
          button="Descargar PDF"
          onClick={generarReporteFinanciero}
        />

        <ReportCard
          icon={Briefcase}
          title="Reporte para inversionistas"
          text="Lectura ejecutiva del piloto, semáforo Momento 2, evidencia y KPIs para decisión de escalamiento."
          button="Descargar PDF"
          onClick={generarReporteInversionistas}
        />
      </div>

      <div className="bg-white rounded-2xl border border-micelio-200 p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="w-5 h-5 text-bosque-700" />
              <h2 className="font-serif text-2xl text-tierra-900">Exportación de datos</h2>
            </div>
            <p className="text-sm text-tierra-600">
              Descarga CSV de cosechas, inventario y registros ambientales para análisis externo.
            </p>
          </div>

          <button
            onClick={exportarDatosCsv}
            className="inline-flex items-center gap-2 rounded-xl bg-bosque-600 px-4 py-2.5 text-sm text-white hover:bg-bosque-700"
          >
            <Download className="w-4 h-4" />
            Descargar CSV
          </button>
        </div>
      </div>
    </div>
  );
}

function KPI({ label, value }: any) {
  return (
    <div className="mb-card p-5">
      <div className="text-xs uppercase tracking-wider text-tierra-600 mb-2">{label}</div>
      <div className="font-serif text-3xl text-tierra-900">{value}</div>
    </div>
  );
}

function ReportCard({ icon: Icon, title, text, button, onClick }: any) {
  return (
    <div className="bg-white rounded-2xl border border-micelio-200 p-6 shadow-card">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-2xl bg-micelio-100 flex items-center justify-center text-bosque-700 shrink-0">
          <Icon className="w-6 h-6" />
        </div>

        <div className="flex-1">
          <h2 className="font-serif text-2xl text-tierra-900 mb-2">{title}</h2>
          <p className="text-sm text-tierra-600 mb-5">{text}</p>

          <button
            onClick={onClick}
            className="inline-flex items-center gap-2 rounded-xl bg-bosque-600 px-4 py-2.5 text-sm text-white hover:bg-bosque-700"
          >
            <Download className="w-4 h-4" />
            {button}
          </button>
        </div>
      </div>
    </div>
  );
}
