'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, Calendar, Package, Users, ArrowRight } from 'lucide-react';
import { differenceInDays, parseISO, format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Dashboard({ setSeccion }: { setSeccion: (s: string) => void }) {
  const [fases, setFases] = useState<any[]>([]);
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);

  useEffect(() => {
    setFases(dataAPI.getFases());
    setProveedores(dataAPI.getProveedores());
    setInventario(dataAPI.getInventario());
  }, []);

  const HOY = new Date('2026-03-05'); // Simulamos hoy para demo
  const SIEMBRA = parseISO('2026-03-26');
  const CIERRE = parseISO('2026-05-28');
  const diasParaSiembra = differenceInDays(SIEMBRA, HOY);
  const diasParaCierre = differenceInDays(CIERRE, HOY);

  const proveedoresCriticos = proveedores.filter((p) => p.prioridad === 'critica');
  const proveedoresPorContactar = proveedores.filter((p) => p.estado === 'por-contactar').length;
  const inventarioPendiente = inventario.filter((i) => i.estado === 'pendiente').length;
  const inversionTotal = inventario.reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);
  const inversionCritica = inventario
    .filter((i) => i.urgencia === 'critica' && i.estado === 'pendiente')
    .reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);

  const fasesPendientes = fases.filter((f) => f.estado === 'pendiente').length;
  const fasesCompletadas = fases.filter((f) => f.estado === 'completado').length;
  const progresoPiloto = Math.round((fasesCompletadas / fases.length) * 100);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Sistema de Información
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Dashboard</h1>
        <p className="text-tierra-600 max-w-2xl">
          Piloto 10m² de Champiñón Blanco · Betania, Alangasí · Valle de los Chillos
        </p>
      </header>

      {/* Alerta de Deadline */}
      <div className="bg-gradient-to-r from-micelio-600 to-micelio-700 text-micelio-50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-micelio-200 text-xs uppercase tracking-widest mb-2">
              Deadline Final · Cierre de Ciclo 1
            </div>
            <div className="font-serif text-3xl mb-1">28 de mayo de 2026</div>
            <div className="text-micelio-100 text-sm">
              Faltan {diasParaCierre} días · Día de Siembra en {diasParaSiembra} días
            </div>
          </div>
          <div className="flex gap-4">
            <div className="text-center">
              <div className="font-serif text-4xl">{progresoPiloto}%</div>
              <div className="text-xs text-micelio-200 uppercase tracking-wider">Completado</div>
            </div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-micelio-800/50 rounded-full overflow-hidden">
          <div
            className="h-full bg-micelio-300 rounded-full transition-all"
            style={{ width: `${progresoPiloto}%` }}
          />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPI
          icon={Calendar}
          label="Fases pendientes"
          value={fasesPendientes}
          subtitle={`de ${fases.length} totales`}
          color="micelio"
        />
        <KPI
          icon={Users}
          label="Proveedores por contactar"
          value={proveedoresPorContactar}
          subtitle={`${proveedoresCriticos.length} críticos`}
          color="tierra"
        />
        <KPI
          icon={Package}
          label="Items pendientes"
          value={inventarioPendiente}
          subtitle={`$${inversionCritica.toFixed(0)} críticos`}
          color="hongo"
        />
        <KPI
          icon={TrendingUp}
          label="Inversión total"
          value={`$${inversionTotal.toFixed(0)}`}
          subtitle="proyectada"
          color="micelio"
        />
      </div>

      {/* Acciones urgentes */}
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h2 className="font-serif text-xl text-tierra-900">Acciones Críticas</h2>
            </div>
            <button
              onClick={() => setSeccion('cronograma')}
              className="text-xs text-micelio-700 hover:text-micelio-900 flex items-center gap-1"
            >
              Ver todas <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {fases
              .filter((f) => f.urgencia === 'critica' && f.estado !== 'completado')
              .slice(0, 4)
              .map((f) => (
                <div key={f.id} className="flex items-start gap-3 p-3 bg-micelio-50 rounded-lg">
                  <Clock className="w-4 h-4 text-micelio-600 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-tierra-900">{f.nombre}</div>
                    <div className="text-xs text-tierra-600 mt-0.5">
                      {format(parseISO(f.fechaInicio), "d 'de' MMM", { locale: es })} · {f.semana}
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-tierra-700" />
              <h2 className="font-serif text-xl text-tierra-900">Proveedores Críticos</h2>
            </div>
            <button
              onClick={() => setSeccion('proveedores')}
              className="text-xs text-micelio-700 hover:text-micelio-900 flex items-center gap-1"
            >
              Ver todos <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-3">
            {proveedoresCriticos.map((p) => (
              <div key={p.id} className="flex items-start gap-3 p-3 bg-micelio-50 rounded-lg">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  p.estado === 'confirmado' ? 'bg-green-500' :
                  p.estado === 'por-contactar' ? 'bg-red-500' : 'bg-amber-500'
                }`} />
                <div className="flex-1">
                  <div className="text-sm font-medium text-tierra-900">{p.nombre}</div>
                  <div className="text-xs text-tierra-600 mt-0.5">{p.ubicacion} · {p.categoria}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Cronograma visual */}
      <div className="bg-white rounded-2xl border border-micelio-200 p-6">
        <h2 className="font-serif text-xl text-tierra-900 mb-4">Línea de Tiempo del Piloto</h2>
        <div className="space-y-2">
          {fases.map((f, idx) => (
            <div key={f.id} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                f.estado === 'completado' ? 'bg-green-500 text-white' :
                f.estado === 'en-curso' ? 'bg-micelio-500 text-white' :
                'bg-micelio-100 text-micelio-700'
              }`}>
                {idx + 1}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-baseline">
                  <div className="text-sm font-medium text-tierra-900">{f.nombre}</div>
                  <div className="text-xs text-tierra-500">
                    {format(parseISO(f.fechaInicio), 'd MMM', { locale: es })}
                  </div>
                </div>
                <div className="text-xs text-tierra-500">{f.semana}</div>
              </div>
              {f.urgencia === 'critica' && (
                <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">crítica</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value, subtitle, color }: any) {
  return (
    <div className="bg-white rounded-2xl border border-micelio-200 p-5">
      <div className="flex items-center gap-2 mb-3 text-tierra-600">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-3xl text-tierra-900 mb-1">{value}</div>
      <div className="text-xs text-tierra-500">{subtitle}</div>
    </div>
  );
}
