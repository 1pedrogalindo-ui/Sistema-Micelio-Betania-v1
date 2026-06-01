'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Leaf, X, AlertTriangle, Droplets, Thermometer, Wind,
  Sun, Clock, DollarSign, TrendingUp, Beaker, Shield,
  CheckCircle2, ChevronRight, Search, Sparkles
} from 'lucide-react';

type Especie = {
  id: string;
  nombre_comercial: string;
  nombre_cientifico: string;
  variedad?: string;
  dificultad: 'baja' | 'media' | 'alta';
  duracion_ciclo_semanas: number;
  numero_cosechas_esperadas: number;
  rendimiento_kg_por_m2: number;
  precio_kg_referencia: number;
  proteina_porcentaje: number;
  tipo_sustrato: string;
  metodo_preparacion: string;
  requiere_luz: boolean;
  requiere_compost: boolean;
  descripcion?: string;
  notas_estrategicas?: string;
  activa: boolean;
  prioridad_cultivo: number;
};

type EspecieFase = {
  id: string;
  especie_id: string;
  orden: number;
  codigo: string;
  nombre: string;
  duracion_dias_min: number;
  duracion_dias_max: number;
  descripcion?: string;
  actividades: string[];
  urgencia: string;
};

type EspecieParametro = {
  id: string;
  especie_fase_id: string;
  parametro: string;
  valor_min: number;
  valor_max: number;
  valor_optimo?: number;
  unidad: string;
  tolerancia: string;
  notas?: string;
};

type EspecieSustrato = {
  id: string;
  especie_id: string;
  componente: string;
  porcentaje: number;
  unidad_medida: string;
  obligatorio: boolean;
  alternativas: string[];
  precaucion?: string;
};

type EspecieRiesgo = {
  id: string;
  especie_id: string;
  tipo: string;
  nombre: string;
  probabilidad: 'baja' | 'media' | 'alta';
  impacto: 'bajo' | 'medio' | 'alto' | 'critico';
  sintomas?: string;
  prevencion?: string;
  accion_correctiva?: string;
};

export default function Especies() {
  const [especies, setEspecies] = useState<Especie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroDificultad, setFiltroDificultad] = useState<string>('todas');
  const [busqueda, setBusqueda] = useState('');
  const [especieSeleccionada, setEspecieSeleccionada] = useState<Especie | null>(null);

  useEffect(() => { cargarEspecies(); }, []);

  const cargarEspecies = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) { setError('Supabase no configurado'); setLoading(false); return; }
    try {
      const { data, error: err } = await supabase
        .from('especies').select('*').eq('activa', true)
        .order('prioridad_cultivo', { ascending: true, nullsFirst: false });
      if (err) throw err;
      setEspecies(data || []);
    } catch (e: any) {
      setError(e.message || 'Error cargando especies');
    } finally { setLoading(false); }
  };

  const especiesFiltradas = especies.filter(e => {
    if (filtroDificultad !== 'todas' && e.dificultad !== filtroDificultad) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return e.nombre_comercial.toLowerCase().includes(q) || e.nombre_cientifico.toLowerCase().includes(q);
    }
    return true;
  });

  if (loading) return <div className="text-tierra-600">Cargando catálogo de especies...</div>;
  if (error) return (
    <div className="p-6 bg-red-50 border border-red-200 rounded-2xl">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="w-5 h-5" /><span>{error}</span>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">Catálogo de Cultivos</div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Especies</h1>
        <p className="text-tierra-600">{especies.length} especies disponibles. Cada una con sus fases, parámetros ambientales y receta de sustrato.</p>
      </header>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-tierra-400" />
          <input type="text" placeholder="Buscar especie..." value={busqueda} onChange={e => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-micelio-200 rounded-lg bg-white text-sm focus:outline-none focus:border-micelio-500" />
        </div>
        <div className="flex gap-2">
          {['todas', 'baja', 'media', 'alta'].map(d => (
            <button key={d} onClick={() => setFiltroDificultad(d)}
              className={`px-3 py-2 rounded-lg text-xs uppercase tracking-wider transition ${filtroDificultad === d ? 'bg-micelio-600 text-white' : 'bg-white text-tierra-700 border border-micelio-200 hover:border-micelio-400'}`}>
              {d === 'todas' ? 'Todas' : `Dif. ${d}`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <ResumenStat icon={Sparkles} label="Arranque ideal" value={especies.filter(e => e.prioridad_cultivo === 1 || e.prioridad_cultivo === 2).length} subtitle="ostras" />
        <ResumenStat icon={Beaker} label="Medicinales" value={especies.filter(e => e.precio_kg_referencia > 15).length} subtitle="alto valor" />
        <ResumenStat icon={Clock} label="Ciclo corto" value={especies.filter(e => e.duracion_ciclo_semanas <= 6).length} subtitle="≤ 6 semanas" />
        <ResumenStat icon={TrendingUp} label="Dificultad baja" value={especies.filter(e => e.dificultad === 'baja').length} subtitle="recomendadas" />
      </div>

      {especiesFiltradas.length === 0 ? (
        <div className="text-center py-12 text-tierra-500">No se encontraron especies con los filtros seleccionados.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {especiesFiltradas.map(especie => (
            <CardEspecie key={especie.id} especie={especie} onClick={() => setEspecieSeleccionada(especie)} />
          ))}
        </div>
      )}

      {especieSeleccionada && (
        <ModalDetalleEspecie especie={especieSeleccionada} onClose={() => setEspecieSeleccionada(null)} />
      )}
    </div>
  );
}

function CardEspecie({ especie, onClick }: { especie: Especie; onClick: () => void }) {
  const dificultadColor = {
    baja: 'bg-green-100 text-green-700 border-green-200',
    media: 'bg-amber-100 text-amber-700 border-amber-200',
    alta: 'bg-red-100 text-red-700 border-red-200',
  }[especie.dificultad];

  const prioridadBadge = () => {
    if (especie.prioridad_cultivo === 1) return { text: '⭐⭐⭐ ARRANQUE', color: 'bg-micelio-600 text-white' };
    if (especie.prioridad_cultivo === 2) return { text: '⭐⭐ ARRANQUE', color: 'bg-micelio-500 text-white' };
    if (especie.prioridad_cultivo === 3) return { text: '⭐ Después', color: 'bg-tierra-200 text-tierra-700' };
    if (especie.prioridad_cultivo === 0) return { text: '📖 Referencia', color: 'bg-tierra-100 text-tierra-600' };
    return { text: '⏳ Eventualmente', color: 'bg-tierra-100 text-tierra-500' };
  };

  const badge = prioridadBadge();
  const ingresoEstimado = especie.rendimiento_kg_por_m2 * especie.precio_kg_referencia * 10;

  return (
    <button onClick={onClick} className="text-left bg-white rounded-2xl border-2 border-micelio-200 p-5 hover:border-micelio-400 hover:shadow-lg transition group">
      <div className="flex items-start justify-between mb-3">
        <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${badge.color}`}>{badge.text}</span>
        <span className={`text-xs px-2 py-1 rounded-full border ${dificultadColor}`}>Dif. {especie.dificultad}</span>
      </div>
      <div className="mb-3">
        <h3 className="font-serif text-xl text-tierra-900 leading-tight mb-1">{especie.nombre_comercial}</h3>
        <p className="text-xs text-tierra-500 italic">{especie.nombre_cientifico}</p>
      </div>
      {especie.descripcion && <p className="text-sm text-tierra-600 mb-4 line-clamp-2">{especie.descripcion}</p>}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <MetricaMini icon={Clock} label="Ciclo" value={`${especie.duracion_ciclo_semanas} sem`} />
        <MetricaMini icon={TrendingUp} label="Rendim." value={`${especie.rendimiento_kg_por_m2} kg/m²`} />
        <MetricaMini icon={DollarSign} label="Precio" value={`$${especie.precio_kg_referencia}/kg`} />
        <MetricaMini icon={Leaf} label="Proteína" value={`${especie.proteina_porcentaje}%`} />
      </div>
      <div className="pt-3 border-t border-micelio-100">
        <div className="flex items-center justify-between">
          <span className="text-xs text-tierra-500">Ingreso est. 10m²:</span>
          <span className="text-sm font-medium text-micelio-700">${ingresoEstimado.toFixed(0)} USD</span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between text-xs text-micelio-700 group-hover:text-micelio-900">
        <span>Ver fases, parámetros y receta</span>
        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </button>
  );
}

function ModalDetalleEspecie({ especie, onClose }: { especie: Especie; onClose: () => void }) {
  const [fases, setFases] = useState<EspecieFase[]>([]);
  const [parametros, setParametros] = useState<EspecieParametro[]>([]);
  const [sustratos, setSustratos] = useState<EspecieSustrato[]>([]);
  const [riesgos, setRiesgos] = useState<EspecieRiesgo[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<'fases' | 'sustrato' | 'riesgos'>('fases');

  useEffect(() => {
    cargarDetalles();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [especie.id]);

  const cargarDetalles = async () => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const [fasesRes, sustratosRes, riesgosRes] = await Promise.all([
      supabase.from('especie_fases').select('*').eq('especie_id', especie.id).order('orden'),
      supabase.from('especie_sustratos').select('*').eq('especie_id', especie.id).order('porcentaje', { ascending: false }),
      supabase.from('especie_riesgos').select('*').eq('especie_id', especie.id),
    ]);
    setFases(fasesRes.data || []);
    setSustratos(sustratosRes.data || []);
    setRiesgos(riesgosRes.data || []);
    if (fasesRes.data && fasesRes.data.length > 0) {
      const faseIds = fasesRes.data.map(f => f.id);
      const paramsRes = await supabase.from('especie_parametros').select('*').in('especie_fase_id', faseIds);
      setParametros(paramsRes.data || []);
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-tierra-900/60 backdrop-blur-sm z-50 flex items-end md:items-center justify-center p-0 md:p-6" onClick={onClose}>
      <div className="bg-micelio-50 rounded-t-3xl md:rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="bg-gradient-to-r from-tierra-900 to-tierra-800 text-micelio-50 p-6 relative">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-tierra-700 hover:bg-tierra-600 flex items-center justify-center">
            <X className="w-4 h-4" />
          </button>
          <div className="text-xs uppercase tracking-widest text-micelio-300 mb-2">Detalle de Especie</div>
          <h2 className="font-serif text-3xl mb-1">{especie.nombre_comercial}</h2>
          <p className="text-sm text-micelio-200 italic mb-4">{especie.nombre_cientifico}</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <MetricaHeader label="Dificultad" value={especie.dificultad} />
            <MetricaHeader label="Ciclo" value={`${especie.duracion_ciclo_semanas} semanas`} />
            <MetricaHeader label="Rendimiento" value={`${especie.rendimiento_kg_por_m2} kg/m²`} />
            <MetricaHeader label="Precio" value={`$${especie.precio_kg_referencia}/kg`} />
          </div>
        </div>
        <div className="border-b border-micelio-200 px-6 bg-white flex gap-1 overflow-x-auto">
          <TabButton active={tab === 'fases'} onClick={() => setTab('fases')} icon={Clock}>Fases ({fases.length})</TabButton>
          <TabButton active={tab === 'sustrato'} onClick={() => setTab('sustrato')} icon={Beaker}>Sustrato ({sustratos.length})</TabButton>
          <TabButton active={tab === 'riesgos'} onClick={() => setTab('riesgos')} icon={Shield}>Riesgos ({riesgos.length})</TabButton>
        </div>
        <div className="flex-1 overflow-y-auto p-6">
          {loading ? <div className="text-center text-tierra-500 py-8">Cargando detalles...</div> : (
            <>
              {tab === 'fases' && <TabFases fases={fases} parametros={parametros} />}
              {tab === 'sustrato' && <TabSustrato sustratos={sustratos} especie={especie} />}
              {tab === 'riesgos' && <TabRiesgos riesgos={riesgos} />}
            </>
          )}
        </div>
        <div className="p-6 border-t border-micelio-200 bg-white">
          {especie.notas_estrategicas && (
            <div className="mb-4 p-3 bg-micelio-100 rounded-lg">
              <div className="text-xs uppercase tracking-wider text-micelio-700 mb-1">Nota estratégica</div>
              <p className="text-sm text-tierra-800">{especie.notas_estrategicas}</p>
            </div>
          )}
          <button disabled className="w-full px-4 py-3 bg-micelio-600 text-white rounded-lg text-sm font-medium hover:bg-micelio-700 disabled:opacity-50 disabled:cursor-not-allowed">
            Crear ciclo con esta especie (próximamente)
          </button>
        </div>
      </div>
    </div>
  );
}

function TabFases({ fases, parametros }: { fases: EspecieFase[]; parametros: EspecieParametro[] }) {
  if (fases.length === 0) return <div className="text-tierra-500 text-sm">No hay fases definidas.</div>;
  return (
    <div className="space-y-3">
      {fases.map((fase, i) => {
        const paramsFase = parametros.filter(p => p.especie_fase_id === fase.id);
        return (
          <div key={fase.id} className="bg-white rounded-xl border border-micelio-200 p-4">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-micelio-100 text-micelio-700 flex items-center justify-center font-medium flex-shrink-0">{i + 1}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <div>
                    <h4 className="font-serif text-lg text-tierra-900">{fase.nombre}</h4>
                    <div className="text-xs text-tierra-500">Duración: {fase.duracion_dias_min}–{fase.duracion_dias_max} días</div>
                  </div>
                  <UrgenciaBadge urgencia={fase.urgencia} />
                </div>
                {fase.descripcion && <p className="text-sm text-tierra-600 mt-2 mb-3">{fase.descripcion}</p>}
                {fase.actividades.length > 0 && (
                  <details className="mb-3">
                    <summary className="text-xs text-micelio-700 cursor-pointer hover:text-micelio-900">Ver {fase.actividades.length} actividades</summary>
                    <ul className="mt-2 space-y-1">
                      {fase.actividades.map((act, j) => (
                        <li key={j} className="text-xs text-tierra-600 flex items-start gap-2">
                          <CheckCircle2 className="w-3 h-3 mt-0.5 text-micelio-500 flex-shrink-0" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </details>
                )}
                {paramsFase.length > 0 && (
                  <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-2">
                    {paramsFase.map(p => <ParametroBadge key={p.id} param={p} />)}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function TabSustrato({ sustratos, especie }: { sustratos: EspecieSustrato[]; especie: Especie }) {
  if (sustratos.length === 0) return <div className="text-tierra-500 text-sm">No hay receta de sustrato definida.</div>;
  return (
    <div className="space-y-4">
      <div className="bg-micelio-100 rounded-xl p-4">
        <div className="text-xs uppercase tracking-wider text-micelio-700 mb-1">Método de preparación</div>
        <div className="font-serif text-lg text-tierra-900 capitalize">{especie.metodo_preparacion}</div>
      </div>
      <div className="space-y-2">
        {sustratos.map(s => (
          <div key={s.id} className="bg-white rounded-xl border border-micelio-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Beaker className="w-4 h-4 text-micelio-600" />
                <span className="font-medium text-tierra-900">{s.componente}</span>
                {s.obligatorio && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Obligatorio</span>}
              </div>
              <span className="font-serif text-2xl text-micelio-700">{s.porcentaje}%</span>
            </div>
            {s.precaucion && (
              <div className="mt-2 p-2 bg-amber-50 border border-amber-200 rounded text-xs text-amber-800">⚠️ {s.precaucion}</div>
            )}
            {s.alternativas && s.alternativas.length > 0 && (
              <div className="mt-2 text-xs text-tierra-600">
                <span className="text-tierra-500">Alternativas:</span> {s.alternativas.join(', ')}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function TabRiesgos({ riesgos }: { riesgos: EspecieRiesgo[] }) {
  if (riesgos.length === 0) return <div className="text-tierra-500 text-sm">No hay riesgos definidos.</div>;
  const impactoOrden: Record<string, number> = { critico: 1, alto: 2, medio: 3, bajo: 4 };
  const riesgosOrdenados = [...riesgos].sort((a, b) => impactoOrden[a.impacto] - impactoOrden[b.impacto]);
  return (
    <div className="space-y-2">
      {riesgosOrdenados.map(r => (
        <div key={r.id} className="bg-white rounded-xl border border-micelio-200 p-4">
          <div className="flex items-start justify-between gap-3 mb-2">
            <div className="flex items-center gap-2">
              <RiesgoIcon tipo={r.tipo} />
              <span className="font-medium text-tierra-900">{r.nombre}</span>
            </div>
            <div className="flex gap-1.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.probabilidad === 'alta' ? 'bg-red-100 text-red-700' : r.probabilidad === 'media' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>P: {r.probabilidad}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.impacto === 'critico' ? 'bg-red-200 text-red-800' : r.impacto === 'alto' ? 'bg-red-100 text-red-700' : r.impacto === 'medio' ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>I: {r.impacto}</span>
            </div>
          </div>
          {r.sintomas && <div className="text-xs text-tierra-600 mb-2"><span className="text-tierra-500">Síntomas:</span> {r.sintomas}</div>}
          {r.prevencion && <div className="text-xs text-tierra-700 mb-1"><span className="font-medium">🛡️ Prevención:</span> {r.prevencion}</div>}
          {r.accion_correctiva && <div className="text-xs text-tierra-700"><span className="font-medium">⚡ Acción correctiva:</span> {r.accion_correctiva}</div>}
        </div>
      ))}
    </div>
  );
}

function ResumenStat({ icon: Icon, label, value, subtitle }: any) {
  return (
    <div className="bg-white rounded-xl border border-micelio-200 p-3">
      <div className="flex items-center gap-2 text-tierra-600 mb-1">
        <Icon className="w-3 h-3" />
        <span className="text-[10px] uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-2xl text-tierra-900">{value}</div>
      <div className="text-[10px] text-tierra-500">{subtitle}</div>
    </div>
  );
}

function MetricaMini({ icon: Icon, label, value }: any) {
  return (
    <div className="flex items-start gap-2">
      <Icon className="w-3 h-3 text-micelio-500 mt-0.5" />
      <div>
        <div className="text-[10px] uppercase tracking-wider text-tierra-500">{label}</div>
        <div className="text-sm font-medium text-tierra-900">{value}</div>
      </div>
    </div>
  );
}

function MetricaHeader({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-micelio-300 mb-0.5">{label}</div>
      <div className="text-sm font-medium capitalize">{value}</div>
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, children }: any) {
  return (
    <button onClick={onClick} className={`px-4 py-3 flex items-center gap-2 text-sm border-b-2 transition whitespace-nowrap ${active ? 'border-micelio-600 text-micelio-700 font-medium' : 'border-transparent text-tierra-600 hover:text-tierra-800'}`}>
      <Icon className="w-4 h-4" />
      {children}
    </button>
  );
}

function UrgenciaBadge({ urgencia }: { urgencia: string }) {
  const colores: Record<string, string> = {
    critica: 'bg-red-100 text-red-700',
    alta: 'bg-amber-100 text-amber-700',
    media: 'bg-blue-100 text-blue-700',
    baja: 'bg-tierra-100 text-tierra-700',
  };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full ${colores[urgencia] || colores.media}`}>{urgencia}</span>;
}

function ParametroBadge({ param }: { param: EspecieParametro }) {
  const iconos: Record<string, any> = {
    temperatura_aire: Thermometer, temperatura_sustrato: Thermometer,
    humedad_relativa: Droplets, co2: Wind, luz_horas: Sun,
    ventilacion_renovaciones_hora: Wind,
  };
  const Icon = iconos[param.parametro] || Sun;
  const labels: Record<string, string> = {
    temperatura_aire: 'T° aire', temperatura_sustrato: 'T° sustrato',
    humedad_relativa: 'HR', co2: 'CO₂', luz_horas: 'Luz',
    ventilacion_renovaciones_hora: 'Vent.', ph: 'pH',
  };
  const isCritico = param.tolerancia === 'critico' || param.tolerancia === 'estricto';
  return (
    <div className={`flex items-center gap-2 px-2 py-1.5 rounded-lg ${isCritico ? 'bg-red-50 border border-red-200' : 'bg-micelio-50'}`}>
      <Icon className={`w-3 h-3 ${isCritico ? 'text-red-600' : 'text-micelio-600'}`} />
      <div className="text-xs">
        <div className="text-tierra-600">{labels[param.parametro] || param.parametro}</div>
        <div className="font-medium text-tierra-900">{param.valor_min}–{param.valor_max} {param.unidad}</div>
      </div>
    </div>
  );
}

function RiesgoIcon({ tipo }: { tipo: string }) {
  const iconos: Record<string, any> = {
    plaga: AlertTriangle, patogeno: AlertTriangle,
    ambiental: Wind, humano: Shield, estructural: Shield,
  };
  const Icon = iconos[tipo] || AlertTriangle;
  return <Icon className="w-4 h-4 text-amber-600" />;
}
