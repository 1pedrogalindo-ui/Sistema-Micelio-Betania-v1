'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { PARAMETROS_AMBIENTALES } from '@/data/seed';
import { Plus, Thermometer, Droplets, Wind, Save } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Registros() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [nuevoRegistro, setNuevoRegistro] = useState({
    fecha: new Date().toISOString().slice(0, 16),
    fase: 'incubacion',
    temperaturaAire: '',
    temperaturaCompost: '',
    humedad: '',
    co2: '',
    notas: '',
  });

  useEffect(() => {
    setRegistros(dataAPI.getRegistros());
  }, []);

  const guardarRegistro = () => {
    const nuevo = {
      id: `reg-${Date.now()}`,
      ...nuevoRegistro,
      temperaturaAire: parseFloat(nuevoRegistro.temperaturaAire) || 0,
      temperaturaCompost: parseFloat(nuevoRegistro.temperaturaCompost) || 0,
      humedad: parseFloat(nuevoRegistro.humedad) || 0,
      co2: parseFloat(nuevoRegistro.co2) || 0,
    };
    const nuevos = [nuevo, ...registros];
    setRegistros(nuevos);
    dataAPI.setRegistros(nuevos);
    setNuevoRegistro({
      fecha: new Date().toISOString().slice(0, 16),
      fase: nuevoRegistro.fase,
      temperaturaAire: '',
      temperaturaCompost: '',
      humedad: '',
      co2: '',
      notas: '',
    });
  };

  const params = PARAMETROS_AMBIENTALES[nuevoRegistro.fase as keyof typeof PARAMETROS_AMBIENTALES];

  const enRango = (valor: number, rango: { min: number; max: number }) => {
    return valor >= rango.min && valor <= rango.max;
  };

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Registros Operativos R-01
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Registros Ambientales</h1>
        <p className="text-tierra-600">Monitoreo de T°, HR y CO₂ — 3 lecturas por día</p>
      </header>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">Nueva Lectura</h3>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Fecha/Hora</label>
                <input
                  type="datetime-local"
                  value={nuevoRegistro.fecha}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fecha: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Fase</label>
                <select
                  value={nuevoRegistro.fase}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, fase: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                >
                  <option value="incubacion">Incubación</option>
                  <option value="fructificacion">Fructificación</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">T° Aire</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevoRegistro.temperaturaAire}
                    onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, temperaturaAire: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                    placeholder="°C"
                  />
                  {nuevoRegistro.temperaturaAire && (
                    <div className="text-xs mt-1">
                      Rango: {params.temperaturaAire.min}–{params.temperaturaAire.max} °C
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">T° Compost</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevoRegistro.temperaturaCompost}
                    onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, temperaturaCompost: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                    placeholder="°C"
                  />
                  {nuevoRegistro.temperaturaCompost && (
                    <div className="text-xs mt-1">
                      Rango: {params.temperaturaCompost.min}–{params.temperaturaCompost.max} °C
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">HR %</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevoRegistro.humedad}
                    onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, humedad: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                    placeholder="%"
                  />
                  {nuevoRegistro.humedad && (
                    <div className="text-xs mt-1">
                      Rango: {params.humedadRelativa.min}–{params.humedadRelativa.max}%
                    </div>
                  )}
                </div>
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">CO₂</label>
                  <input
                    type="number"
                    value={nuevoRegistro.co2}
                    onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, co2: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                    placeholder="ppm"
                  />
                  {nuevoRegistro.co2 && (
                    <div className="text-xs mt-1">
                      Rango: {params.co2.min}–{params.co2.max} ppm
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Notas</label>
                <textarea
                  value={nuevoRegistro.notas}
                  onChange={(e) => setNuevoRegistro({ ...nuevoRegistro, notas: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  rows={3}
                  placeholder="Observaciones..."
                />
              </div>

              <button
                onClick={guardarRegistro}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-micelio-600 text-white rounded-lg hover:bg-micelio-700 text-sm font-medium"
              >
                <Save className="w-4 h-4" /> Guardar Lectura
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">
              Historial de Registros ({registros.length})
            </h3>
            {registros.length === 0 ? (
              <div className="text-center py-12 text-tierra-500">
                <Thermometer className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay registros aún. Agrega la primera lectura para empezar.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {registros.map((r) => {
                  const p = PARAMETROS_AMBIENTALES[r.fase as keyof typeof PARAMETROS_AMBIENTALES];
                  return (
                    <div key={r.id} className="p-3 bg-micelio-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-tierra-600">
                          {format(new Date(r.fecha), "d MMM yyyy · HH:mm", { locale: es })}
                        </div>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-tierra-100 text-tierra-700 capitalize">
                          {r.fase}
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-sm">
                        <Metric icon={Thermometer} label="T° Aire" value={r.temperaturaAire} unidad="°C"
                          ok={enRango(r.temperaturaAire, p.temperaturaAire)} />
                        <Metric icon={Thermometer} label="T° Comp." value={r.temperaturaCompost} unidad="°C"
                          ok={enRango(r.temperaturaCompost, p.temperaturaCompost)} />
                        <Metric icon={Droplets} label="HR" value={r.humedad} unidad="%"
                          ok={enRango(r.humedad, p.humedadRelativa)} />
                        <Metric icon={Wind} label="CO₂" value={r.co2} unidad="ppm"
                          ok={enRango(r.co2, p.co2)} />
                      </div>
                      {r.notas && (
                        <div className="text-xs text-tierra-600 mt-2 italic">{r.notas}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, unidad, ok }: any) {
  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded ${ok ? 'bg-green-50' : 'bg-red-50'}`}>
      <Icon className={`w-3 h-3 ${ok ? 'text-green-700' : 'text-red-700'}`} />
      <div className="text-xs">
        <span className="text-tierra-600">{label}:</span>{' '}
        <span className={`font-medium ${ok ? 'text-green-800' : 'text-red-800'}`}>
          {value}{unidad}
        </span>
      </div>
    </div>
  );
}
