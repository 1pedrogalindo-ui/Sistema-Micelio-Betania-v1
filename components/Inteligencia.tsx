'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  calcularMermaPct,
  calcularRendimientoKgM2,
  proyectarRendimiento,
} from '@/lib/intelligence';
import {
  Brain,
  TrendingUp,
  BarChart3,
  Target,
  RefreshCw,
  AlertTriangle,
  Sprout,
  DollarSign,
  Activity,
} from 'lucide-react';

const AREA_POR_CICLO: Record<string, number> = {
  C1: 10,
  C2: 21,
  C3: 30,
};

export default function Inteligencia() {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMensaje('La base de datos no está configurada. No se puede cargar inteligencia en producción.');
      setCargando(false);
      return;
    }

    const [cosechasRes, inventarioRes, registrosRes, bandejasRes] = await Promise.all([
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }).limit(100),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
    ]);

    const errores = [
      cosechasRes.error,
      inventarioRes.error,
      registrosRes.error,
      bandejasRes.error,
    ].filter(Boolean);

    if (errores.length) {
      console.error(errores);
      setMensaje(`Carga parcial: ${errores[0]?.message}`);
    } else {
      setMensaje('');
    }

    setCosechas(cosechasRes.data || []);
    setInventario(inventarioRes.data || []);
    setRegistros(registrosRes.data || []);
    setBandejas(bandejasRes.data || []);
    setCargando(false);
  };

  const costoTotalInventario = inventario.reduce(
    (s, i) => s + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
    0
  );

  const ciclos = useMemo(() => {
    const grupos: Record<string, any> = {};

    cosechas.forEach((c) => {
      const ciclo = c.ciclo_id || 'C1';

      if (!grupos[ciclo]) {
        grupos[ciclo] = {
          ciclo,
          areaM2: AREA_POR_CICLO[ciclo] || 10,
          premium: 0,
          comercial: 0,
          merma: 0,
          cosechas: 0,
          bandejas: new Set<string>(),
        };
      }

      grupos[ciclo].premium += Number(c.kg_premium || 0);
      grupos[ciclo].comercial += Number(c.kg_comercial || 0);
      grupos[ciclo].merma += Number(c.kg_merma || 0);
      grupos[ciclo].cosechas += 1;

      if (c.bandeja_id) {
        grupos[ciclo].bandejas.add(c.bandeja_id);
      }
    });

    bandejas.forEach((b) => {
      const ciclo = b.ciclo_id || 'C1';

      if (!grupos[ciclo]) {
        grupos[ciclo] = {
          ciclo,
          areaM2: AREA_POR_CICLO[ciclo] || 10,
          premium: 0,
          comercial: 0,
          merma: 0,
          cosechas: 0,
          bandejas: new Set<string>(),
        };
      }

      grupos[ciclo].bandejas.add(b.id || b.codigo);
    });

    const lista = Object.values(grupos).map((c: any) => {
      const total = c.premium + c.comercial + c.merma;
      const vendible = c.premium + c.comercial;
      const ingreso = c.premium * 4.5 + c.comercial * 3.25;
      const rendimiento = calcularRendimientoKgM2(total, c.areaM2);
      const mermaPct = calcularMermaPct(c.merma, total);

      const costoAsignado =
        c.ciclo === 'C1'
          ? costoTotalInventario
          : costoTotalInventario * 0.72;

      return {
        ...c,
        total,
        vendible,
        ingreso,
        costo: costoAsignado,
        margen: ingreso - costoAsignado,
        rendimiento,
        mermaPct,
        bandejasCount: c.bandejas.size,
      };
    });

    if (!lista.length) {
      return [
        {
          ciclo: 'C1',
          areaM2: 10,
          premium: 0,
          comercial: 0,
          merma: 0,
          total: 0,
          vendible: 0,
          ingreso: 0,
          costo: costoTotalInventario,
          margen: -costoTotalInventario,
          rendimiento: 0,
          mermaPct: 0,
          cosechas: 0,
          bandejasCount: bandejas.length,
        },
      ];
    }

    return lista.sort((a: any, b: any) => a.ciclo.localeCompare(b.ciclo));
  }, [cosechas, bandejas, costoTotalInventario]);

  const prediccion = proyectarRendimiento(ciclos);

  const cicloActual = ciclos[ciclos.length - 1];
  const totalKg = ciclos.reduce((s: number, c: any) => s + Number(c.total || 0), 0);
  const totalIngreso = ciclos.reduce((s: number, c: any) => s + Number(c.ingreso || 0), 0);
  const mermaGlobal =
    totalKg > 0
      ? (ciclos.reduce((s: number, c: any) => s + Number(c.merma || 0), 0) / totalKg) * 100
      : 0;

  const lecturasFueraRango = registros.filter((r) => {
    const fase = r.fase;
    const co2 = Number(r.co2 || 0);
    const humedad = Number(r.humedad || 0);
    const temp = Number(r.temperatura_aire || 0);

    if (fase === 'fructificacion') {
      return co2 > 1500 || humedad < 85 || humedad > 95 || temp < 14 || temp > 18;
    }

    if (fase === 'incubacion') {
      return co2 > 5000 || humedad < 80 || temp < 22 || temp > 26;
    }

    return false;
  });

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Fase 5 · Inteligencia operativa
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Inteligencia</h1>
          <p className="text-tierra-600 max-w-3xl">
            Comparativa entre ciclos, rendimiento kg/m², merma, margen y predicción basada en datos reales.
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
        <KPI icon={TrendingUp} label="Rendimiento esperado" value={`${prediccion.rendimientoEsperado.toFixed(2)} kg/m²`} />
        <KPI icon={BarChart3} label="Producción esperada" value={`${prediccion.produccionEsperada.toFixed(1)} kg`} />
        <KPI icon={Brain} label="Confianza" value={prediccion.confianza} />
        <KPI icon={Target} label="Ciclos analizados" value={`${ciclos.length}`} />
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        <KPI icon={Sprout} label="Producción real" value={`${totalKg.toFixed(1)} kg`} />
        <KPI icon={DollarSign} label="Ingreso estimado" value={`$${totalIngreso.toFixed(0)}`} />
        <KPI icon={AlertTriangle} label="Merma global" value={`${mermaGlobal.toFixed(1)}%`} />
        <KPI icon={Activity} label="Alertas ambientales" value={`${lecturasFueraRango.length}`} />
      </div>

      <div className="mb-card p-6">
        <h2 className="font-serif text-2xl text-tierra-900 mb-2">Recomendación del sistema</h2>
        <p className="text-tierra-700">{prediccion.recomendacion}</p>

        {cicloActual && cicloActual.rendimiento < 8 && cicloActual.total > 0 && (
          <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            El rendimiento actual está por debajo de 8 kg/m². Antes de escalar, conviene estabilizar humedad, CO₂ y manejo de vueltas.
          </div>
        )}

        {mermaGlobal > 10 && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            La merma global supera el 10%. Revisar cosecha, manipulación, ventilación y sanidad del cuarto.
          </div>
        )}
      </div>

      <div className="mb-card overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead className="bg-micelio-50 border-b border-micelio-200">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left p-4">Ciclo</th>
              <th className="text-right p-4">Área</th>
              <th className="text-right p-4">Bandejas</th>
              <th className="text-right p-4">Cosechas</th>
              <th className="text-right p-4">Total kg</th>
              <th className="text-right p-4">Kg/m²</th>
              <th className="text-right p-4">Merma</th>
              <th className="text-right p-4">Ingreso</th>
              <th className="text-right p-4">Costo</th>
              <th className="text-right p-4">Margen</th>
            </tr>
          </thead>

          <tbody>
            {ciclos.map((c: any) => (
              <tr key={c.ciclo} className="border-b border-micelio-100">
                <td className="p-4 font-medium text-tierra-900">{c.ciclo}</td>
                <td className="p-4 text-right">{c.areaM2} m²</td>
                <td className="p-4 text-right">{c.bandejasCount}</td>
                <td className="p-4 text-right">{c.cosechas}</td>
                <td className="p-4 text-right">{c.total.toFixed(1)}</td>
                <td className="p-4 text-right">{c.rendimiento.toFixed(2)}</td>
                <td className="p-4 text-right">{c.mermaPct.toFixed(1)}%</td>
                <td className="p-4 text-right">${c.ingreso.toFixed(0)}</td>
                <td className="p-4 text-right">${c.costo.toFixed(0)}</td>
                <td className={`p-4 text-right font-semibold ${c.margen >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {c.margen >= 0 ? '+' : ''}${c.margen.toFixed(0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value }: any) {
  return (
    <div className="mb-card p-5">
      <div className="flex items-center gap-2 text-bosque-700 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-2xl text-tierra-900">{value}</div>
    </div>
  );
}
