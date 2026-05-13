'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  Calendar,
  Package,
  Users,
  ArrowRight,
  Thermometer,
  Droplets,
  Wind,
  Sprout,
  Warehouse,
  Layers3,
  Activity,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard({ setSeccion }: { setSeccion: (s: string) => void }) {
  const [fases, setFases] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [estanterias, setEstanterias] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [auditLog, setAuditLog] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

  useEffect(() => {
    cargarDashboard();
  }, []);

  const cargarDashboard = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setMensaje('La base de datos no está configurada para cargar el dashboard.');
      setCargando(false);
      return;
    }

    const [
      fasesRes,
      proveedoresRes,
      inventarioRes,
      registrosRes,
      cosechasRes,
      estanteriasRes,
      bandejasRes,
      auditRes,
    ] = await Promise.all([
      supabase.from('fases').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('proveedores').select('*').order('nombre', { ascending: true }),
      supabase.from('inventario').select('*').order('urgencia', { ascending: true }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }).limit(20),
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }).limit(50),
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(8),
    ]);

    const errores = [
      fasesRes.error,
      proveedoresRes.error,
      inventarioRes.error,
      registrosRes.error,
      cosechasRes.error,
      estanteriasRes.error,
      bandejasRes.error,
      auditRes.error,
    ].filter(Boolean);

    if (errores.length) {
      console.error(errores);
      setMensaje(`Dashboard cargado parcialmente: ${errores[0]?.message}`);
    } else {
      setMensaje('');
    }

    setFases(fasesRes.data || []);
    setProveedores(proveedoresRes.data || []);
    setInventario(inventarioRes.data || []);
    setRegistros(registrosRes.data || []);
    setCosechas(cosechasRes.data || []);
    setEstanterias(estanteriasRes.data || []);
    setBandejas(bandejasRes.data || []);
    setAuditLog(auditRes.data || []);
    setCargando(false);
  };

  const hoy = new Date();
  const siembra = parseISO('2026-03-26');
  const cierre = parseISO('2026-05-28');
  const diasParaSiembra = differenceInDays(siembra, hoy);
  const diasParaCierre = differenceInDays(cierre, hoy);

  const fasesTotal = fases.length || 1;
  const fasesPendientes = fases.filter((f) => f.estado === 'pendiente').length;
  const fasesCompletadas = fases.filter((f) => f.estado === 'completado').length;
  const progresoPiloto = Math.round((fasesCompletadas / fasesTotal) * 100);

  const proveedoresCriticos = proveedores.filter((p) => p.prioridad === 'critica');
  const proveedoresPorContactar = proveedores.filter((p) => p.estado === 'por-contactar').length;

  const inventarioPendiente = inventario.filter((i) => i.estado === 'pendiente').length;
  const inversionTotal = inventario.reduce(
    (sum, i) => sum + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
    0
  );
  const inversionCritica = inventario
    .filter((i) => i.urgencia === 'critica' && i.estado === 'pendiente')
    .reduce((sum, i) => sum + Number(i.cantidad || 0) * Number(i.precio_unit || 0), 0);

  const totalPremium = cosechas.reduce((s, c) => s + Number(c.kg_premium || 0), 0);
  const totalComercial = cosechas.reduce((s, c) => s + Number(c.kg_comercial || 0), 0);
  const totalMerma = cosechas.reduce((s, c) => s + Number(c.kg_merma || 0), 0);
  const totalCosechado = totalPremium + totalComercial + totalMerma;
  const mermaPct = totalCosechado > 0 ? (totalMerma / totalCosechado) * 100 : 0;
  const ingresoEstimado = totalPremium * 4.5 + totalComercial * 3.25;

  const ultimaLectura = registros[0];
  const co2 = Number(ultimaLectura?.co2 || 0);
  const humedad = Number(ultimaLectura?.humedad || 0);
  const tempAire = Number(ultimaLectura?.temperatura_aire || 0);

  const alertasAmbientales = registros.slice(0, 5).filter((r) => {
    const fase = r.fase;
    const co2v = Number(r.co2 || 0);
    const hv = Number(r.humedad || 0);
    const tv = Number(r.temperatura_aire || 0);

    if (fase === 'fructificacion') {
      return co2v > 1500 || hv < 85 || hv > 95 || tv < 14 || tv > 18;
    }

    if (fase === 'incubacion') {
      return co2v > 5000 || hv < 80 || tv < 22 || tv > 26;
    }

    return false;
  });

  const fasesCriticas = fases
    .filter((f) => f.urgencia === 'critica' && f.estado !== 'completado')
    .slice(0, 4);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Sistema de Información · Operación en vivo
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Dashboard</h1>
          <p className="text-tierra-600 max-w-3xl">
            Piloto 10m² de Champiñón Blanco · Betania, Alangasí · Datos centralizados y auditados
          </p>
        </div>

        <button
          onClick={cargarDashboard}
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

      <div className="bg-gradient-to-r from-bosque-700 via-bosque-800 to-tierra-900 text-micelio-50 rounded-3xl p-6 shadow-soft">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
          <div>
            <div className="text-micelio-200 text-xs uppercase tracking-widest mb-2">
              Cierre operativo · Ciclo 1
            </div>
            <div className="font-serif text-3xl mb-1">28 de mayo de 2026</div>
            <div className="text-micelio-100 text-sm">
              {diasParaCierre >= 0 ? `Faltan ${diasParaCierre} días` : `Ciclo cerrado hace ${Math.abs(diasParaCierre)} días`}
              {' · '}
              {diasParaSiembra >= 0 ? `Siembra en ${diasParaSiembra} días` : `Siembra realizada hace ${Math.abs(diasParaSiembra)} días`}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 min-w-[360px]">
            <HeroMetric label="Completado" value={`${progresoPiloto}%`} />
            <HeroMetric label="Cosechado" value={`${totalCosechado.toFixed(1)} kg`} />
            <HeroMetric label="Ingreso est." value={`$${ingresoEstimado.toFixed(0)}`} />
          </div>
        </div>

        <div className="mt-5 h-2 bg-tierra-950/40 rounded-full overflow-hidden">
          <div
            className="h-full bg-micelio-300 rounded-full transition-all"
            style={{ width: `${Math.min(Math.max(progresoPiloto, 0), 100)}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI icon={Calendar} label="Fases pendientes" value={fasesPendientes} subtitle={`de ${fases.length} totales`} />
        <KPI icon={Users} label="Proveedores por contactar" value={proveedoresPorContactar} subtitle={`${proveedoresCriticos.length} críticos`} />
        <KPI icon={Package} label="Inventario pendiente" value={inventarioPendiente} subtitle={`$${inversionCritica.toFixed(0)} críticos`} />
        <KPI icon={TrendingUp} label="Inversión total" value={`$${inversionTotal.toFixed(0)}`} subtitle="proyectada" />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <KPI icon={Sprout} label="Producción total" value={`${totalCosechado.toFixed(1)} kg`} subtitle={`Merma ${mermaPct.toFixed(1)}%`} />
        <KPI icon={Warehouse} label="Estanterías" value={estanterias.length} subtitle="infraestructura activa" />
        <KPI icon={Layers3} label="Bandejas" value={bandejas.length} subtitle="registradas" />
        <KPI icon={ShieldCheck} label="Auditoría" value={auditLog.length} subtitle="últimos cambios" />
      </div>

      <div className="grid xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-bosque-700" />
              <h2 className="font-serif text-xl text-tierra-900">Última lectura ambiental</h2>
            </div>
            <button
              onClick={() => setSeccion('registros')}
              className="text-xs text-bosque-700 hover:text-bosque-900 flex items-center gap-1"
            >
              Ver registros <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {ultimaLectura ? (
            <>
              <div className="grid md:grid-cols-3 gap-4">
                <EnvironmentalMetric icon={Thermometer} label="Temperatura aire" value={`${tempAire.toFixed(1)} °C`} />
                <EnvironmentalMetric icon={Droplets} label="Humedad relativa" value={`${humedad.toFixed(1)}%`} />
                <EnvironmentalMetric icon={Wind} label="CO₂" value={`${co2.toFixed(0)} ppm`} />
              </div>

              <div className="mt-4 text-xs text-tierra-500">
                {format(new Date(ultimaLectura.fecha), "d 'de' MMMM yyyy · HH:mm", { locale: es })} · {ultimaLectura.fase}
              </div>

              {alertasAmbientales.length > 0 && (
                <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                  Hay {alertasAmbientales.length} lectura(s) reciente(s) fuera de rango. Revisar ventilación, humedad o temperatura.
                </div>
              )}
            </>
          ) : (
            <div className="text-tierra-500 text-sm py-8 text-center">
              No hay lecturas ambientales registradas.
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <h2 className="font-serif text-xl text-tierra-900">Alertas críticas</h2>
          </div>

          <div className="space-y-3">
            {fasesCriticas.length === 0 && alertasAmbientales.length === 0 && (
              <div className="text-sm text-tierra-500 py-6 text-center">
                No hay alertas críticas activas.
              </div>
            )}

            {fasesCriticas.map((f) => (
              <AlertItem
                key={f.id}
                title={f.nombre}
                subtitle={`${f.semana || ''} · ${f.fecha_inicio ? format(new Date(f.fecha_inicio), 'd MMM', { locale: es }) : ''}`}
              />
            ))}

            {alertasAmbientales.slice(0, 3).map((r) => (
              <AlertItem
                key={r.id}
                title={`Lectura ambiental fuera de rango`}
                subtitle={`${r.fase} · CO₂ ${Number(r.co2 || 0).toFixed(0)} ppm · HR ${Number(r.humedad || 0).toFixed(0)}%`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="grid xl:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-tierra-700" />
              <h2 className="font-serif text-xl text-tierra-900">Proveedores críticos</h2>
            </div>
            <button
              onClick={() => setSeccion('proveedores')}
              className="text-xs text-bosque-700 hover:text-bosque-900 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {proveedoresCriticos.slice(0, 5).map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 bg-micelio-50 rounded-xl">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  p.estado === 'confirmado' ? 'bg-green-500' :
                  p.estado === 'por-contactar' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-tierra-900">{p.nombre}</div>
                  <div className="text-xs text-tierra-600 mt-0.5">{p.ubicacion || 'Sin ubicación'} · {p.categoria || 'Sin categoría'}</div>
                </div>
              </div>
            ))}

            {proveedoresCriticos.length === 0 && (
              <div className="text-sm text-tierra-500 py-6 text-center">
                No hay proveedores críticos registrados.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShieldCheck className="w-5 h-5 text-bosque-700" />
            <h2 className="font-serif text-xl text-tierra-900">Actividad reciente</h2>
          </div>

          <div className="space-y-3">
            {auditLog.map((a) => (
              <div key={a.id} className="p-3 bg-micelio-50 rounded-xl">
                <div className="text-sm font-medium text-tierra-900">
                  {a.descripcion || `${a.accion} en ${a.tabla}`}
                </div>
                <div className="text-xs text-tierra-600 mt-1">
                  {a.user_email || 'Usuario'} · {a.created_at ? format(new Date(a.created_at), "d MMM · HH:mm", { locale: es }) : ''}
                </div>
              </div>
            ))}

            {auditLog.length === 0 && (
              <div className="text-sm text-tierra-500 py-6 text-center">
                Aún no hay actividad auditada.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-micelio-200 p-6">
        <h2 className="font-serif text-xl text-tierra-900 mb-4">Línea de tiempo del piloto</h2>

        <div className="space-y-2">
          {fases.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                f.estado === 'completado' ? 'bg-green-500 text-white' :
                f.estado === 'en-curso' ? 'bg-bosque-600 text-white' :
                'bg-micelio-100 text-bosque-700'
              }`}>
                {idx + 1}
              </div>

              <div className="flex-1">
                <div className="flex justify-between items-baseline gap-3">
                  <div className="text-sm font-medium text-tierra-900">{f.nombre}</div>
                  <div className="text-xs text-tierra-500">
                    {f.fecha_inicio ? format(new Date(f.fecha_inicio), 'd MMM', { locale: es }) : 'Sin fecha'}
                  </div>
                </div>
                <div className="text-xs text-tierra-500">{f.semana || f.descripcion || ''}</div>
              </div>

              {f.urgencia === 'critica' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                  crítica
                </span>
              )}
            </div>
          ))}

          {fases.length === 0 && (
            <div className="text-sm text-tierra-500 py-6 text-center">
              No hay fases registradas.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-2xl border border-micelio-200 p-5 shadow-card">
      <div className="flex items-center gap-2 mb-3 text-tierra-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-3xl text-tierra-900 mb-1">{value}</div>
      <div className="text-xs text-tierra-500">{subtitle}</div>
    </div>
  );
}

function HeroMetric({ label, value }: any) {
  return (
    <div className="rounded-2xl bg-white/10 border border-white/10 px-4 py-3 text-center">
      <div className="font-serif text-2xl text-white">{value}</div>
      <div className="text-[10px] uppercase tracking-wider text-micelio-200 mt-1">{label}</div>
    </div>
  );
}

function EnvironmentalMetric({ icon: Icon, label, value }: any) {
  return (
    <div className="rounded-2xl border border-micelio-200 bg-micelio-50 p-4">
      <div className="flex items-center gap-2 text-bosque-700 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-2xl text-tierra-900">{value}</div>
    </div>
  );
}

function AlertItem({ title, subtitle }: any) {
  return (
    <div className="flex items-start gap-3 p-3 bg-red-50 border border-red-100 rounded-xl">
      <Clock className="w-4 h-4 text-red-600 mt-0.5" />
      <div>
        <div className="text-sm font-medium text-red-900">{title}</div>
        <div className="text-xs text-red-700 mt-0.5">{subtitle}</div>
      </div>
    </div>
  );
}
