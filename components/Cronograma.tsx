'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, AlertTriangle, Clock, Save, History } from 'lucide-react';

const estados = [
  { id: 'pendiente', label: 'Pendiente', color: 'bg-tierra-100 text-tierra-700' },
  { id: 'en-curso', label: 'En curso', color: 'bg-micelio-200 text-micelio-800' },
  { id: 'completado', label: 'Completado', color: 'bg-green-100 text-green-700' },
  { id: 'retrasado', label: 'Retrasado', color: 'bg-red-100 text-red-700' },
];

const AVANCES_LOCAL_KEY = 'mb_avances_cronograma_v1';

function getAvancesLocal() {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(AVANCES_LOCAL_KEY) || '[]');
  } catch {
    return [];
  }
}

function setAvancesLocal(data: any[]) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(AVANCES_LOCAL_KEY, JSON.stringify(data));
}

export default function Cronograma() {
  const [fases, setFases] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [avances, setAvances] = useState<any[]>([]);
  const [guardando, setGuardando] = useState(false);

  const [nuevoAvance, setNuevoAvance] = useState({
    porcentaje: 0,
    estado: 'en-curso',
    descripcion: '',
    responsable: '',
    evidencia_url: '',
    bloqueo: '',
    siguiente_accion: '',
  });

  useEffect(() => {
    setFases(dataAPI.getFases());
  }, []);

  useEffect(() => {
    if (seleccionada) {
      cargarAvances(seleccionada);
      const fase = fases.find((f) => f.id === seleccionada);
      if (fase) {
        setNuevoAvance((prev) => ({
          ...prev,
          porcentaje: Number(fase.porcentaje_avance || fase.porcentajeAvance || 0),
          estado: fase.estado || 'en-curso',
        }));
      }
    }
  }, [seleccionada, fases]);

  const cargarAvances = async (faseId: string) => {
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      const locales = getAvancesLocal().filter((a: any) => a.fase_id === faseId);
      setAvances(locales);
      return;
    }

    const { data, error } = await supabase
      .from('avances_cronograma')
      .select('*')
      .eq('fase_id', faseId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error(error);
      setAvances([]);
      return;
    }

    setAvances(data || []);
  };

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const nuevasFases = fases.map((f) =>
      f.id === id ? { ...f, estado: nuevoEstado } : f
    );

    setFases(nuevasFases);
    dataAPI.setFases(nuevasFases);

    const supabase = getSupabaseBrowserClient();
    if (supabase) {
      await supabase
        .from('fases')
        .update({
          estado: nuevoEstado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);
    }
  };

  const registrarAvance = async () => {
    if (!seleccionada) return;

    if (!nuevoAvance.descripcion.trim()) {
      alert('Escribe una descripción del avance.');
      return;
    }

    setGuardando(true);

    const avancePayload = {
      fase_id: seleccionada,
      porcentaje: Number(nuevoAvance.porcentaje || 0),
      estado: nuevoAvance.estado,
      descripcion: nuevoAvance.descripcion.trim(),
      responsable: nuevoAvance.responsable.trim() || null,
      evidencia_url: nuevoAvance.evidencia_url.trim() || null,
      bloqueo: nuevoAvance.bloqueo.trim() || null,
      siguiente_accion: nuevoAvance.siguiente_accion.trim() || null,
    };

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const { error } = await supabase
        .from('avances_cronograma')
        .insert(avancePayload);

      if (error) {
        console.error(error);
        alert('No se pudo guardar el avance en Supabase.');
        setGuardando(false);
        return;
      }

      await supabase
        .from('fases')
        .update({
          estado: nuevoAvance.estado,
          porcentaje_avance: Number(nuevoAvance.porcentaje || 0),
          updated_at: new Date().toISOString(),
        })
        .eq('id', seleccionada);
    } else {
      const locales = getAvancesLocal();
      setAvancesLocal([
        {
          id: `avance-${Date.now()}`,
          fecha: new Date().toISOString(),
          ...avancePayload,
        },
        ...locales,
      ]);
    }

    const nuevasFases = fases.map((f) =>
      f.id === seleccionada
        ? {
            ...f,
            estado: nuevoAvance.estado,
            porcentaje_avance: Number(nuevoAvance.porcentaje || 0),
            porcentajeAvance: Number(nuevoAvance.porcentaje || 0),
          }
        : f
    );

    setFases(nuevasFases);
    dataAPI.setFases(nuevasFases);

    setNuevoAvance({
      porcentaje: Number(nuevoAvance.porcentaje || 0),
      estado: nuevoAvance.estado,
      descripcion: '',
      responsable: nuevoAvance.responsable,
      evidencia_url: '',
      bloqueo: '',
      siguiente_accion: '',
    });

    await cargarAvances(seleccionada);
    setGuardando(false);
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Gestión de Fases
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Cronograma</h1>
        <p className="text-tierra-600">9 semanas desde 26/03/2026 hasta 28/05/2026</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {fases.map((fase, idx) => {
            const porcentaje = Number(fase.porcentaje_avance || fase.porcentajeAvance || 0);

            return (
              <div
                key={fase.id}
                onClick={() => setSeleccionada(fase.id)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition ${
                  seleccionada === fase.id
                    ? 'border-micelio-500'
                    : 'border-micelio-200 hover:border-micelio-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      fase.estado === 'completado' ? 'bg-green-500 text-white' :
                      fase.estado === 'en-curso' ? 'bg-micelio-500 text-white' :
                      fase.estado === 'retrasado' ? 'bg-red-500 text-white' :
                      'bg-micelio-100 text-micelio-700'
                    }`}>
                      {fase.estado === 'completado' ? <CheckCircle2 className="w-5 h-5" /> :
                       fase.estado === 'retrasado' ? <AlertTriangle className="w-5 h-5" /> :
                       <Circle className="w-5 h-5" />}
                    </div>
                    {idx < fases.length - 1 && <div className="w-0.5 h-12 bg-micelio-200 mt-2" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-micelio-700 uppercase tracking-wider mb-1">
                          {fase.semana}
                        </div>
                        <h3 className="font-serif text-lg text-tierra-900">{fase.nombre}</h3>
                      </div>
                      {fase.urgencia === 'critica' && (
                        <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                          Crítica
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-tierra-600 mt-2 mb-3">{fase.descripcion}</p>

                    <div className="flex items-center gap-2 text-xs text-tierra-500 mb-3">
                      <Clock className="w-3 h-3" />
                      <span>
                        {format(parseISO(fase.fechaInicio), "d 'de' MMM", { locale: es })}
                        {fase.fechaInicio !== fase.fechaFin && (
                          <> → {format(parseISO(fase.fechaFin), "d 'de' MMM", { locale: es })}</>
                        )}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-tierra-500 mb-1">
                        <span>Avance</span>
                        <span>{porcentaje}%</span>
                      </div>
                      <div className="h-2 bg-micelio-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-micelio-500 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="space-y-4">
          {seleccionada && (() => {
            const fase = fases.find((f) => f.id === seleccionada);
            if (!fase) return null;

            return (
              <div className="space-y-4 sticky top-6">
                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="text-xs text-micelio-700 uppercase tracking-wider mb-2">
                    Detalle de Fase
                  </div>
                  <h3 className="font-serif text-xl text-tierra-900 mb-4">{fase.nombre}</h3>

                  <div className="mb-4">
                    <div className="text-xs text-tierra-500 uppercase tracking-wider mb-2">Estado</div>
                    <div className="flex flex-wrap gap-2">
                      {estados.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => actualizarEstado(fase.id, e.id)}
                          className={`text-xs px-3 py-1.5 rounded-full transition ${
                            fase.estado === e.id ? e.color + ' ring-2 ring-offset-1 ring-micelio-400' : 'bg-micelio-50 text-tierra-600 hover:bg-micelio-100'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="text-xs text-tierra-500 uppercase tracking-wider mb-2">
                      Actividades ({fase.actividades.length})
                    </div>
                    <ul className="space-y-2">
                      {fase.actividades.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-tierra-700">
                          <Circle className="w-3 h-3 mt-1 text-micelio-500 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Save className="w-4 h-4 text-micelio-700" />
                    <h3 className="font-serif text-lg text-tierra-900">Registrar avance</h3>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Porcentaje</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={nuevoAvance.porcentaje}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, porcentaje: Number(e.target.value) })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Estado</label>
                      <select
                        value={nuevoAvance.estado}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, estado: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                      >
                        {estados.map((e) => (
                          <option key={e.id} value={e.id}>{e.label}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Descripción del avance</label>
                      <textarea
                        value={nuevoAvance.descripcion}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, descripcion: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        rows={3}
                        placeholder="Ej: Se vació el cuarto, se revisaron filtraciones..."
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Responsable</label>
                      <input
                        value={nuevoAvance.responsable}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, responsable: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        placeholder="Ej: Pedro"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Bloqueo / problema</label>
                      <input
                        value={nuevoAvance.bloqueo}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, bloqueo: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        placeholder="Opcional"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Siguiente acción</label>
                      <input
                        value={nuevoAvance.siguiente_accion}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, siguiente_accion: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        placeholder="Ej: comprar pintura lavable"
                      />
                    </div>

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Evidencia URL</label>
                      <input
                        value={nuevoAvance.evidencia_url}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, evidencia_url: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        placeholder="Link Drive, foto, documento..."
                      />
                    </div>

                    <button
                      onClick={registrarAvance}
                      disabled={guardando}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-micelio-600 text-white rounded-lg hover:bg-micelio-700 text-sm font-medium disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {guardando ? 'Guardando...' : 'Guardar avance'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-micelio-700" />
                    <h3 className="font-serif text-lg text-tierra-900">Historial</h3>
                  </div>

                  {avances.length === 0 ? (
                    <p className="text-sm text-tierra-500">Aún no hay avances registrados para esta fase.</p>
                  ) : (
                    <div className="space-y-3">
                      {avances.map((a) => (
                        <div key={a.id || `${a.fecha}-${a.descripcion}`} className="p-3 bg-micelio-50 rounded-lg">
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-micelio-800">{a.estado} · {a.porcentaje}%</span>
                            <span className="text-xs text-tierra-500">
                              {a.fecha ? format(new Date(a.fecha), "d MMM · HH:mm", { locale: es }) : ''}
                            </span>
                          </div>
                          <p className="text-sm text-tierra-800">{a.descripcion}</p>
                          {a.responsable && <p className="text-xs text-tierra-600 mt-1">Responsable: {a.responsable}</p>}
                          {a.bloqueo && <p className="text-xs text-red-700 mt-1">Bloqueo: {a.bloqueo}</p>}
                          {a.siguiente_accion && <p className="text-xs text-tierra-600 mt-1">Siguiente: {a.siguiente_accion}</p>}
                          {a.evidencia_url && (
                            <a
                              href={a.evidencia_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-micelio-700 underline mt-1 inline-block"
                            >
                              Ver evidencia
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {!seleccionada && (
            <div className="bg-micelio-50 rounded-2xl border border-dashed border-micelio-300 p-8 text-center">
              <Circle className="w-8 h-8 text-micelio-400 mx-auto mb-2" />
              <p className="text-sm text-tierra-600">
                Selecciona una fase para ver actividades, actualizar estado y registrar avances.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
