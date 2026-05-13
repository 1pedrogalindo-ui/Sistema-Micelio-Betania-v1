'use client';

import { useEffect, useMemo, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Briefcase,
  DollarSign,
  Sprout,
  TrendingUp,
  ShieldCheck,
  RefreshCw,
  AlertTriangle,
  Layers3,
  Activity,
  Target,
} from 'lucide-react';

export default function Inversionistas() {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [fases, setFases] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
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
      setMensaje('La base de datos no está configurada. No se puede cargar el tablero ejecutivo.');
      setCargando(false);
      return;
    }

    const [
      cosechasRes,
      inventarioRes,
      fasesRes,
      registrosRes,
      bandejasRes,
      estanteriasRes,
      auditRes,
    ] = await Promise.all([
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('fases').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }).limit(100),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(20),
    ]);

    const errores = [
      cosechasRes.error,
      inventarioRes.error,
      fasesRes.error,
      registrosRes.error,
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

    setCosechas(cosechasRes.data || []);
    setInventario(inventarioRes.data || []);
    setFases(fasesRes.data || []);
    setRegistros(registrosRes.data || []);
    setBandejas(bandejasRes.data || []);
    setEstanterias(estanteriasRes.data || []);
    setAuditLog(auditRes.data || []);
    setCargando(false);
  };

  const m = useMemo(() => {
    const premium = cosechas.reduce((s, c) => s + Number(c.kg_premium || 0), 0);
    const comercial = cosechas.reduce((s, c) => s + Number(c.kg_comercial || 0), 0);
    const merma = cosechas.reduce((s, c) => s + Number(c.kg_merma || 0), 0);
    const totalKg = premium + comercial + merma;
    const vendible = premium + comercial;

    const ingreso = premium * 4.5 + comercial * 3.25;

    const costo = inventario.reduce(
      (s, i) => s + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
      0
    );

    const margen = ingreso - costo;

    const avance = fases.length
      ? (fases.filter((f) => f.estado === 'completado').length / fases.length) * 100
      : 0;

    const areaM2 = 10;
    const kgM2 = areaM2 > 0 ? totalKg / areaM2 : 0;
    const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;
    const costoKg = vendible > 0 ? costo / vendible : 0;
    const ingresoKg = vendible > 0 ? ingreso / vendible : 0;

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
    }).length;

    const momento2Ready =
      avance >= 80 &&
      kgM2 >= 8 &&
      mermaPct <= 10 &&
      vendible > 0 &&
      lecturasFueraRango <= 3;

    let score = 0;
    if (avance >= 80) score += 25;
    if (kgM2 >= 8) score += 25;
    if (mermaPct <= 10 && totalKg > 0) score += 20;
    if (margen >= 0) score += 15;
    if (lecturasFueraRango <= 3) score += 15;

    return {
      premium,
      comercial,
      merma,
      totalKg,
      vendible,
      ingreso,
      costo,
      margen,
      avance,
      kgM2,
      mermaPct,
      costoKg,
      ingresoKg,
      lecturasFueraRango,
      momento2Ready,
      score,
    };
  }, [cosechas, inventario, fases, registros]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Momento 2 · Evidencia para escalamiento
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">
            Dashboard para inversionistas
          </h1>
          <p className="text-tierra-600 max-w-3xl">
            Vista ejecutiva con datos reales de producción, costos, merma, avance operativo y preparación para escalar.
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

      <div className="rounded-3xl p-7 bg-gradient-to-br from-tierra-950 via-tierra-900 to-bosque-900 text-micelio-50 shadow-soft">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div className="flex gap-4">
            <div className="w-14 h-14 rounded-2xl bg-micelio-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-7 h-7 text-tierra-950" />
            </div>

            <div>
              <div className="text-xs uppercase tracking-widest text-micelio-200 mb-1">
                Tesis de inversión
              </div>
              <h2 className="font-serif text-3xl mb-2">
                Escalar solo con evidencia operativa
              </h2>
              <p className="text-sm text-micelio-100 max-w-4xl">
                Momento 2 debe decidirse por rendimiento, merma, costo real por kg,
                estabilidad ambiental, trazabilidad y capacidad de venta. Este tablero convierte el piloto en evidencia.
              </p>
            </div>
          </div>

          <div className="rounded-2xl bg-white/10 border border-white/10 px-6 py-4 text-center min-w-[180px]">
            <div className="font-serif text-4xl text-white">{m.score}%</div>
            <div className="text-[10px] uppercase tracking-widest text-micelio-200 mt-1">
              Score Momento 2
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <KPI icon={Sprout} label="Producción" value={`${m.totalKg.toFixed(1)} kg`} />
        <KPI icon={TrendingUp} label="Rendimiento" value={`${m.kgM2.toFixed(2)} kg/m²`} />
        <KPI icon={DollarSign} label="Ingreso" value={`$${m.ingreso.toFixed(0)}`} />
        <KPI icon={DollarSign} label="Margen" value={`$${m.margen.toFixed(0)}`} />
        <KPI icon={ShieldCheck} label="Avance" value={`${m.avance.toFixed(0)}%`} />
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <KPI icon={AlertTriangle} label="Merma" value={`${m.mermaPct.toFixed(1)}%`} />
        <KPI icon={Target} label="Costo/kg" value={`$${m.costoKg.toFixed(2)}`} />
        <KPI icon={DollarSign} label="Ingreso/kg" value={`$${m.ingresoKg.toFixed(2)}`} />
        <KPI icon={Layers3} label="Bandejas" value={`${bandejas.length}`} />
        <KPI icon={Activity} label="Alertas ambiente" value={`${m.lecturasFueraRango}`} />
      </div>

      <div className="grid xl:grid-cols-2 gap-5">
        <div className="mb-card p-6">
          <h3 className="font-serif text-2xl text-tierra-900 mb-4">
            Semáforo de escalamiento
          </h3>

          <div
            className={`rounded-2xl p-5 border ${
              m.momento2Ready
                ? 'bg-green-50 border-green-200 text-green-800'
                : 'bg-amber-50 border-amber-200 text-amber-800'
            }`}
          >
            <div className="text-lg font-semibold mb-2">
              {m.momento2Ready ? 'Listo para evaluar Momento 2' : 'Todavía en validación'}
            </div>

            <p className="text-sm">
              Meta base: avance operativo ≥80%, rendimiento ≥8 kg/m², merma ≤10%,
              producto vendible registrado y estabilidad ambiental aceptable.
            </p>
          </div>

          <div className="mt-5 space-y-3">
            <CheckRow label="Avance operativo ≥80%" ok={m.avance >= 80} value={`${m.avance.toFixed(0)}%`} />
            <CheckRow label="Rendimiento ≥8 kg/m²" ok={m.kgM2 >= 8} value={`${m.kgM2.toFixed(2)} kg/m²`} />
            <CheckRow label="Merma ≤10%" ok={m.mermaPct <= 10 && m.totalKg > 0} value={`${m.mermaPct.toFixed(1)}%`} />
            <CheckRow label="Margen no negativo" ok={m.margen >= 0} value={`$${m.margen.toFixed(0)}`} />
            <CheckRow label="Alertas ambientales controladas" ok={m.lecturasFueraRango <= 3} value={`${m.lecturasFueraRango}`} />
          </div>
        </div>

        <div className="mb-card p-6">
          <h3 className="font-serif text-2xl text-tierra-900 mb-4">
            Indicadores críticos
          </h3>

          <div className="space-y-3 text-sm">
            <Row label="Kg premium" value={`${m.premium.toFixed(1)} kg`} />
            <Row label="Kg comercial" value={`${m.comercial.toFixed(1)} kg`} />
            <Row label="Kg merma" value={`${m.merma.toFixed(1)} kg`} />
            <Row label="Producto vendible" value={`${m.vendible.toFixed(1)} kg`} />
            <Row label="Costo acumulado" value={`$${m.costo.toFixed(0)}`} />
            <Row label="Estanterías activas" value={`${estanterias.length}`} />
            <Row label="Registros auditados recientes" value={`${auditLog.length}`} />
          </div>
        </div>
      </div>

      <div className="mb-card p-6">
        <h3 className="font-serif text-2xl text-tierra-900 mb-4">
          Lectura ejecutiva
        </h3>

        <div className="grid md:grid-cols-3 gap-4">
          <InsightCard
            title="Producción"
            text={
              m.totalKg > 0
                ? `El piloto registra ${m.totalKg.toFixed(1)} kg cosechados, con ${m.vendible.toFixed(1)} kg vendibles.`
                : 'Todavía no hay cosecha suficiente para evaluar rendimiento productivo.'
            }
          />

          <InsightCard
            title="Riesgo operativo"
            text={
              m.mermaPct > 10
                ? `La merma está en ${m.mermaPct.toFixed(1)}%, por encima del umbral recomendado.`
                : `La merma está en ${m.mermaPct.toFixed(1)}%, dentro o cerca del rango objetivo.`
            }
          />

          <InsightCard
            title="Decisión Momento 2"
            text={
              m.momento2Ready
                ? 'El sistema ya permite evaluar una expansión prudente con evidencia operativa.'
                : 'Aún conviene completar más datos antes de comprometer inversión de expansión.'
            }
          />
        </div>
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

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-micelio-100 pb-2">
      <span className="text-tierra-600">{label}</span>
      <span className="font-medium text-tierra-900">{value}</span>
    </div>
  );
}

function CheckRow({ label, ok, value }: { label: string; ok: boolean; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-micelio-100 pb-2">
      <div className="flex items-center gap-2">
        <span className={`w-2.5 h-2.5 rounded-full ${ok ? 'bg-green-500' : 'bg-amber-500'}`} />
        <span className="text-tierra-700 text-sm">{label}</span>
      </div>
      <span className="font-medium text-tierra-900 text-sm">{value}</span>
    </div>
  );
}

function InsightCard({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-2xl border border-micelio-200 bg-micelio-50 p-5">
      <div className="font-serif text-xl text-tierra-900 mb-2">{title}</div>
      <p className="text-sm text-tierra-700">{text}</p>
    </div>
  );
}
