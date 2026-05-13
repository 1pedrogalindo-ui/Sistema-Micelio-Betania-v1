'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { CheckCircle2, Circle, AlertTriangle, Clock } from 'lucide-react';

const estados = [
  { id: 'pendiente', label: 'Pendiente', color: 'bg-tierra-100 text-tierra-700' },
  { id: 'en-curso', label: 'En curso', color: 'bg-micelio-200 text-micelio-800' },
  { id: 'completado', label: 'Completado', color: 'bg-green-100 text-green-700' },
  { id: 'retrasado', label: 'Retrasado', color: 'bg-red-100 text-red-700' },
];

export default function Cronograma() {
  const [fases, setFases] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);

  useEffect(() => {
    setFases(dataAPI.getFases());
  }, []);

  const actualizarEstado = (id: string, nuevoEstado: string) => {
    const nuevasFases = fases.map((f) =>
      f.id === id ? { ...f, estado: nuevoEstado } : f
    );
    setFases(nuevasFases);
    dataAPI.setFases(nuevasFases);
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
          {fases.map((fase, idx) => (
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

                  <div className="flex items-center gap-2 text-xs text-tierra-500">
                    <Clock className="w-3 h-3" />
                    <span>
                      {format(parseISO(fase.fechaInicio), "d 'de' MMM", { locale: es })}
                      {fase.fechaInicio !== fase.fechaFin && (
                        <> → {format(parseISO(fase.fechaFin), "d 'de' MMM", { locale: es })}</>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-4">
          {seleccionada && (() => {
            const fase = fases.find((f) => f.id === seleccionada);
            if (!fase) return null;

            return (
              <div className="bg-white rounded-2xl border border-micelio-200 p-6 sticky top-6">
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
            );
          })()}

          {!seleccionada && (
            <div className="bg-micelio-50 rounded-2xl border border-dashed border-micelio-300 p-8 text-center">
              <Circle className="w-8 h-8 text-micelio-400 mx-auto mb-2" />
              <p className="text-sm text-tierra-600">
                Selecciona una fase para ver sus actividades y actualizar su estado.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
