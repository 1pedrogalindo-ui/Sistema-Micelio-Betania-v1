'use client';

import { useEffect, useMemo, useState } from 'react';
import { ESCENARIOS_INVERSION, PROYECCION_INGRESOS } from '@/data/seed';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import {
  RefreshCw,
  DollarSign,
  TrendingUp,
  Sprout,
  Package,
  AlertTriangle,
  Target,
} from 'lucide-react';

export default function Costos() {
  const [inventario, setInventario] = useState<any[]>([]);
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [estanterias, setEstanterias] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMensaje('La base de datos no está configurada. No se puede cargar Costos & ROI en producción.');
      setCargando(false);
      return;
    }

    const [inventarioRes, cosechasRes, bandejasRes, estanteriasRes] = await Promise.all([
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
    ]);

    const errores = [
      inventarioRes.error,
      cosechasRes.error,
      bandejasRes.error,
      estanteriasRes.error,
    ].filter(Boolean);

    if (errores.length) {
      console.error(errores);
      setMensaje(`Carga parcial: ${errores[0]?.message}`);
    } else {
      setMensaje('');
    }

    setInventario(inventarioRes.data || []);
    setCosechas(cosechasRes.data || []);
    setBandejas(bandejasRes.data || []);
    setEstanterias(estanteriasRes.data || []);
    setCargando(false);
  };

  const metricas = useMemo(() => {
    const costoReal = inventario.reduce(
      (sum, i) => sum + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
      0
    );

    const costoPorCategoria = inventario.reduce((acc, i) => {
      const cat = i.categoria || 'sin categoría';
      acc[cat] = (acc[cat] || 0) + Number(i.cantidad || 0) * Number(i.precio_unit || 0);
      return acc;
    }, {} as Record<string, number>);

    const dataCategorias = Object.entries(costoPorCategoria).map(([cat, total]) => ({
      categoria: cat,
      total: Math.round(total as number),
    }));

    const premium = cosechas.reduce((s, c) => s + Number(c.kg_premium || 0), 0);
    const comercial = cosechas.reduce((s, c) => s + Number(c.kg_comercial || 0), 0);
    const merma = cosechas.reduce((s, c) => s + Number(c.kg_merma || 0), 0);
    const totalKg = premium + comercial + merma;
    const vendible = premium + comercial;

    const ingresoReal = premium * 4.5 + comercial * 3.25;
    const margenReal = ingresoReal - costoReal;
    const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;
    const costoKgVendible = vendible > 0 ? costoReal / vendible : 0;
    const ingresoKgVendible = vendible > 0 ? ingresoReal / vendible : 0;
    const roi = costoReal > 0 ? (margenReal / costoReal) * 100 : 0;

    const areaM2 = 10;
    const rendimientoKgM2 = areaM2 > 0 ? totalKg / areaM2 : 0;

    const dataRealVsProyectado = [
      {
        ciclo: 'C1 Real',
        ingreso: Math.round(ingresoReal),
        costo: Math.round(costoReal),
        margen: Math.round(margenReal),
      },
      ...PROYECCION_INGRESOS.map((p) => ({
        ciclo: p.ciclo,
        ingreso: p.ingreso,
        costo: p.costo,
        margen: p.margen,
      })),
    ];

    return {
      costoReal,
      costoPorCategoria,
      dataCategorias,
      premium,
      comercial,
      merma,
      totalKg,
      vendible,
      ingresoReal,
      margenReal,
      mermaPct,
      costoKgVendible,
      ingresoKgVendible,
      roi,
      rendimientoKgM2,
      dataRealVsProyectado,
    };
  }, [inventario, cosechas]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Análisis Financiero · Datos reales
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Costos & ROI</h1>
          <p className="text-tierra-600 max-w-3xl">
            Costos reales desde inventario, producción registrada, margen operativo y comparación contra proyecciones.
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
        <KPI icon={DollarSign} label="Costo real" value={`$${metricas.costoReal.toFixed(0)}`} />
        <KPI icon={Sprout} label="Producción real" value={`${metricas.totalKg.toFixed(1)} kg`} />
        <KPI icon={TrendingUp} label="Ingreso estimado" value={`$${metricas.ingresoReal.toFixed(0)}`} />
        <KPI
          icon={Target}
          label="Margen real"
          value={`${metricas.margenReal >= 0 ? '+' : ''}$${metricas.margenReal.toFixed(0)}`}
          danger={metricas.margenReal < 0}
        />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <KPI icon={Package} label="Costo/kg vendible" value={`$${metricas.costoKgVendible.toFixed(2)}`} />
        <KPI icon={DollarSign} label="Ingreso/kg vendible" value={`$${metricas.ingresoKgVendible.toFixed(2)}`} />
        <KPI icon={AlertTriangle} label="Merma" value={`${metricas.mermaPct.toFixed(1)}%`} danger={metricas.mermaPct > 10} />
        <KPI icon={TrendingUp} label="ROI operativo" value={`${metricas.roi.toFixed(1)}%`} danger={metricas.roi < 0} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {ESCENARIOS_INVERSION.map((e, i) => (
          <div
            key={e.nombre}
            className={`rounded-2xl p-6 border-2 ${
              i === 1
                ? 'bg-micelio-50 border-micelio-500'
                : 'bg-white border-micelio-200'
            }`}
          >
            {i === 1 && (
              <div className="inline-block px-2 py-0.5 bg-bosque-700 text-white text-xs rounded-full mb-2">
                Referencia recomendada
              </div>
            )}

            <div className="text-xs text-tierra-600 uppercase tracking-wider mb-2">
              Escenario {e.nombre}
            </div>

            <div className="font-serif text-4xl text-tierra-900 mb-2">${e.total}</div>
            <p className="text-sm text-tierra-600 mb-4">{e.descripcion}</p>

            <ul className="space-y-1.5">
              {e.items.map((item, j) => (
                <li key={j} className="text-xs text-tierra-700 flex items-start gap-2">
                  <span className="text-bosque-600">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-4 border-t border-micelio-200 text-xs text-tierra-600">
              Diferencia vs costo real:{' '}
              <strong className={metricas.costoReal > e.total ? 'text-red-700' : 'text-green-700'}>
                ${(metricas.costoReal - e.total).toFixed(0)}
              </strong>
            </div>
          </div>
        ))}
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-lg text-tierra-900">Costos por categoría</h3>
            <div className="text-right">
              <div className="text-xs text-tierra-600 uppercase tracking-wider">Total real</div>
              <div className="font-serif text-2xl text-tierra-900">${metricas.costoReal.toFixed(0)}</div>
            </div>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.dataCategorias}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc0" />
                <XAxis dataKey="categoria" stroke="#735e42" style={{ fontSize: '12px' }} />
                <YAxis stroke="#735e42" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fdfbf7',
                    border: '1px solid #d6c194',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="total" fill="#1F4F3A" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <h3 className="font-serif text-lg text-tierra-900 mb-4">
            Real vs proyección
          </h3>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={metricas.dataRealVsProyectado}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc0" />
                <XAxis dataKey="ciclo" stroke="#735e42" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={70} />
                <YAxis stroke="#735e42" style={{ fontSize: '12px' }} />
                <Tooltip
                  contentStyle={{
                    background: '#fdfbf7',
                    border: '1px solid #d6c194',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Bar dataKey="ingreso" fill="#1F4F3A" name="Ingreso USD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="costo" fill="#C9A76A" name="Costo USD" radius={[6, 6, 0, 0]} />
                <Bar dataKey="margen" fill="#1E3F7A" name="Margen USD" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-micelio-200 p-6 overflow-x-auto">
        <h3 className="font-serif text-lg text-tierra-900 mb-4">
          Resumen financiero operativo
        </h3>

        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-micelio-200 bg-micelio-50">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left py-3 px-3">Indicador</th>
              <th className="text-right py-3 px-3">Valor</th>
              <th className="text-left py-3 px-3">Lectura</th>
            </tr>
          </thead>

          <tbody>
            <Row
              label="Costo real acumulado"
              value={`$${metricas.costoReal.toFixed(0)}`}
              note="Suma de cantidad × precio unitario del inventario."
            />
            <Row
              label="Producción vendible"
              value={`${metricas.vendible.toFixed(1)} kg`}
              note="Premium + comercial registrados en cosechas."
            />
            <Row
              label="Ingreso estimado"
              value={`$${metricas.ingresoReal.toFixed(0)}`}
              note="Premium a $4.50/kg y comercial a $3.25/kg."
            />
            <Row
              label="Margen estimado"
              value={`${metricas.margenReal >= 0 ? '+' : ''}$${metricas.margenReal.toFixed(0)}`}
              note="Ingreso estimado menos costo real acumulado."
              danger={metricas.margenReal < 0}
            />
            <Row
              label="Rendimiento"
              value={`${metricas.rendimientoKgM2.toFixed(2)} kg/m²`}
              note="Producción total dividida para 10 m²."
            />
            <Row
              label="Merma"
              value={`${metricas.mermaPct.toFixed(1)}%`}
              note="Meta operativa: mantenerla bajo 10%."
              danger={metricas.mermaPct > 10}
            />
          </tbody>
        </table>
      </div>

      <div className="bg-micelio-100 rounded-2xl p-6 border border-micelio-300">
        <h3 className="font-serif text-lg text-tierra-900 mb-2">Nota estratégica</h3>
        <p className="text-sm text-tierra-700">
          El primer ciclo normalmente absorbe aprendizaje, pruebas y equipamiento. Para decidir Momento 2,
          el dato clave no es solo utilidad inmediata, sino costo real por kg, estabilidad ambiental, merma,
          rendimiento kg/m² y capacidad de vender producto premium y comercial de forma recurrente.
        </p>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, danger }: any) {
  return (
    <div className={`mb-card p-5 ${danger ? 'border-red-200 bg-red-50' : ''}`}>
      <div className={`flex items-center gap-2 mb-2 ${danger ? 'text-red-700' : 'text-bosque-700'}`}>
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className={`font-serif text-2xl ${danger ? 'text-red-800' : 'text-tierra-900'}`}>
        {value}
      </div>
    </div>
  );
}

function Row({ label, value, note, danger }: any) {
  return (
    <tr className="border-b border-micelio-100">
      <td className="py-3 px-3 text-tierra-900 font-medium">{label}</td>
      <td className={`py-3 px-3 text-right font-semibold ${danger ? 'text-red-700' : 'text-tierra-900'}`}>
        {value}
      </td>
      <td className="py-3 px-3 text-tierra-600">{note}</td>
    </tr>
  );
}
