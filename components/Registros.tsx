'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { PARAMETROS_AMBIENTALES } from '@/data/seed';
import { Thermometer, Droplets, Wind, Save, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Registros() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

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
    cargarRegistros();
  }, []);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const mapDbToUi = (r: any) => ({
    id: r.id,
    fecha: r.fecha,
    fase: r.fase,
    temperaturaAire: Number(r.temperatura_aire || 0),
    temperaturaCompost: Number(r.temperatura_compost || 0),
    humedad: Number(r.humedad || 0),
    co2: Number(r.co2 || 0),
    notas: r.notas || '',
    deviceId: r.device_id || '',
  });

  const cargarRegistros = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setRegistros(dataAPI.getRegistros());
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('registros_ambientales')
      .select('*')
      .order('fecha', { ascending: false })
      .limit(200);

    if (error) {
      console.error(error);
      mostrarMensaje(`No se pudieron cargar registros: ${error.message}`);
      setRegistros(dataAPI.getRegistros());
      setCargando(false);
      return;
    }

    const ui = (data || []).map(mapDbToUi);
    setRegistros(ui);
    dataAPI.setRegistros(ui);
    setCargando(false);
  };

  const guardarRegistro = async () => {
    const temperaturaAire = parseFloat(nuevoRegistro.temperaturaAire) || 0;
    const temperaturaCompost = parseFloat(nuevoRegistro.temperaturaCompost) || 0;
    const humedad = parseFloat(nuevoRegistro.humedad) || 0;
    const co2 = parseFloat(nuevoRegistro.co2) || 0;

    if (!temperaturaAire && !temperaturaCompost && !humedad && !co2) {
      mostrarMensaje('Registra al menos una lectura ambiental.');
      return;
    }

    setGuardando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      setGuardando(false);
      return;
    }

    const { error } = await supabase.rpc('registrar_lectura_ambiental_tx', {
      p_fecha: new Date(nuevoRegistro.fecha).toISOString(),
      p_fase: nuevoRegistro.fase,
      p_temperatura_aire: temperaturaAire,
      p_temperatura_compost: temperaturaCompost,
      p_humedad: humedad,
      p_co2: co2,
      p_notas: nuevoRegistro.notas.trim() || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setGuardando(false);
      return;
    }

    mostrarMensaje('Lectura ambiental registrada correctamente.');

    setNuevoRegistro({
      fecha: new Date().toISOString().slice(0, 16),
      fase: nuevoRegistro.fase,
      temperaturaAire: '',
      temperaturaCompost: '',
      humedad: '',
      co2: '',
      notas: '',
    });

    await cargarRegistros();
    setGuardando(false);
  };

  const eliminarRegistro = async (id: string) => {
    const confirmar = window.confirm('¿Eliminar esta lectura ambiental?');
    if (!confirmar) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase
      .from('registros_ambientales')
      .delete()
      .eq('id', id);

    if (error) {
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje('Lectura ambiental eliminada correctamente.');
    await cargarRegistros();
  };

  const params = PARAMETROS_AMBIENTALES[nuevoRegistro.fase as keyof typeof PARAMETROS_AMBIENTALES];

  const enRango = (valor: number, rango: { min: number; max: number }) => {
    return valor >= rango.min && valor <= rango.max;
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Registros Operativos R-01
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Registros Ambientales</h1>
          <p className="text-tierra-600">Monitoreo de T°, HR y CO₂ — guardado en Supabase</p>
        </div>

        <button
          onClick={cargarRegistros}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-micelio-200 bg-micelio-50 px-4 py-3 text-sm text-tierra-800">
          {mensaje}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">Nueva lectura</h3>

            <div className="space-y-3">
              <Input
                type="datetime-local"
                label="Fecha/Hora"
                value={nuevoRegistro.fecha}
                onChange={(v: string) => setNuevoRegistro({ ...nuevoRegistro, fecha: v })}
              />

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
                <Input
                  type="number"
                  step="0.1"
                  label="T° Aire"
                  value={nuevoRegistro.temperaturaAire}
                  placeholder="°C"
                  onChange={(v: string) => setNuevoRegistro({ ...nuevoRegistro, temperaturaAire: v })}
                  helper={`Rango: ${params.temperaturaAire.min}–${params.temperaturaAire.max} °C`}
                />

                <Input
                  type="number"
                  step="0.1"
                  label="T° Compost"
                  value={nuevoRegistro.temperaturaCompost}
                  placeholder="°C"
                  onChange={(v: string) => setNuevoRegistro({ ...nuevoRegistro, temperaturaCompost: v })}
                  helper={`Rango: ${params.temperaturaCompost.min}–${params.temperaturaCompost.max} °C`}
                />

                <Input
                  type="number"
                  step="0.1"
                  label="HR %"
                  value={nuevoRegistro.humedad}
                  placeholder="%"
                  onChange={(v: string) => setNuevoRegistro({ ...nuevoRegistro, humedad: v })}
                  helper={`Rango: ${params.humedadRelativa.min}–${params.humedadRelativa.max}%`}
                />

                <Input
                  type="number"
                  label="CO₂"
                  value={nuevoRegistro.co2}
                  placeholder="ppm"
                  onChange={(v: string) => setNuevoRegistro({ ...nuevoRegistro, co2: v })}
                  helper={`Rango: ${params.co2.min}–${params.co2.max} ppm`}
                />
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
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bosque-600 text-white rounded-lg hover:bg-bosque-700 text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar lectura'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">
              Historial de registros ({registros.length})
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
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <div className="text-xs text-tierra-600">
                          {format(new Date(r.fecha), "d MMM yyyy · HH:mm", { locale: es })}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-tierra-100 text-tierra-700 capitalize">
                            {r.fase}
                          </span>

                          <button
                            onClick={() => eliminarRegistro(r.id)}
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                            title="Eliminar lectura"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
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

function Input({ label, value, onChange, type = 'text', placeholder = '', step, helper }: any) {
  return (
    <div>
      <label className="text-xs text-tierra-600 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
      />
      {helper && <div className="text-xs mt-1 text-tierra-500">{helper}</div>}
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
