'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Save, Package, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Trazabilidad() {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [cargando, setCargando] = useState(false);

  const [nuevaCosecha, setNuevaCosecha] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    lote: 'MB-AB-001',
    cicloId: 'C1',
    bandejaId: '',
    vuelta: 1,
    estante: '',
    kgPremium: '',
    kgComercial: '',
    kgMerma: '',
    cliente: '',
    destino: '',
    notas: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const mapDbToUi = (c: any) => ({
    id: c.id,
    fecha: c.fecha,
    lote: c.lote,
    cicloId: c.ciclo_id,
    bandejaId: c.bandeja_id,
    vuelta: c.vuelta,
    estante: c.estante,
    kgPremium: Number(c.kg_premium || 0),
    kgComercial: Number(c.kg_comercial || 0),
    kgMerma: Number(c.kg_merma || 0),
    cliente: c.cliente || '',
    destino: c.destino || '',
    notas: c.notas || '',
    createdAt: c.created_at,
  });

  const cargarDatos = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setCosechas(dataAPI.getCosechas());
      setCargando(false);
      return;
    }

    const [{ data: cos, error: cosError }, { data: ban, error: banError }] = await Promise.all([
      supabase
        .from('cosechas')
        .select('*')
        .order('fecha', { ascending: false })
        .order('created_at', { ascending: false }),
      supabase
        .from('bandejas')
        .select('id,codigo,lote,ciclo_id,estante,estanteria_id,nivel,posicion,estado,estanterias(codigo,nombre)')
        .order('codigo', { ascending: true }),
    ]);

    if (cosError) {
      console.error(cosError);
      mostrarMensaje(`No se pudieron cargar cosechas: ${cosError.message}`);
      setCosechas(dataAPI.getCosechas());
    } else {
      const cosechasUi = (cos || []).map(mapDbToUi);
      setCosechas(cosechasUi);
      dataAPI.setCosechas(cosechasUi);
    }

    if (banError) {
      console.error(banError);
      mostrarMensaje(`No se pudieron cargar bandejas: ${banError.message}`);
    } else {
      setBandejas(ban || []);
    }

    setCargando(false);
  };

  const guardarCosecha = async () => {
    if (!nuevaCosecha.lote.trim()) {
      mostrarMensaje('El lote es obligatorio.');
      return;
    }

    const kgPremium = parseFloat(nuevaCosecha.kgPremium) || 0;
    const kgComercial = parseFloat(nuevaCosecha.kgComercial) || 0;
    const kgMerma = parseFloat(nuevaCosecha.kgMerma) || 0;
    const totalKg = kgPremium + kgComercial + kgMerma;

    if (totalKg <= 0) {
      mostrarMensaje('Registra al menos un valor de kg premium, comercial o merma.');
      return;
    }

    setGuardando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      setGuardando(false);
      return;
    }

    const { error } = await supabase.rpc('registrar_cosecha_tx', {
      p_fecha: nuevaCosecha.fecha,
      p_lote: nuevaCosecha.lote.trim(),
      p_ciclo_id: nuevaCosecha.cicloId.trim() || 'C1',
      p_bandeja_id: nuevaCosecha.bandejaId || null,
      p_vuelta: Number(nuevaCosecha.vuelta || 1),
      p_estante: nuevaCosecha.estante.trim() || null,
      p_kg_premium: kgPremium,
      p_kg_comercial: kgComercial,
      p_kg_merma: kgMerma,
      p_cliente: nuevaCosecha.cliente.trim() || null,
      p_destino: nuevaCosecha.destino.trim() || null,
      p_notas: nuevaCosecha.notas.trim() || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setGuardando(false);
      return;
    }

    mostrarMensaje('Cosecha registrada correctamente.');

    setNuevaCosecha({
      ...nuevaCosecha,
      bandejaId: '',
      estante: '',
      kgPremium: '',
      kgComercial: '',
      kgMerma: '',
      cliente: '',
      destino: '',
      notas: '',
    });

    await cargarDatos();
    setGuardando(false);
  };

  const eliminarCosecha = async (id: string) => {
    const confirmar = window.confirm('¿Eliminar este registro de cosecha?');
    if (!confirmar) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.from('cosechas').delete().eq('id', id);

    if (error) {
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje('Cosecha eliminada correctamente.');
    await cargarDatos();
  };

  const totalPremium = cosechas.reduce((s, c) => s + Number(c.kgPremium || 0), 0);
  const totalComercial = cosechas.reduce((s, c) => s + Number(c.kgComercial || 0), 0);
  const totalMerma = cosechas.reduce((s, c) => s + Number(c.kgMerma || 0), 0);
  const totalKg = totalPremium + totalComercial + totalMerma;
  const porcentajeMerma = totalKg > 0 ? (totalMerma / totalKg) * 100 : 0;
  const ingresoEstimado = totalPremium * 4.5 + totalComercial * 3.25;

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Trazabilidad R-05
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Lotes & Cosechas</h1>
          <p className="text-tierra-600">
            Registro transaccional por lote, vuelta, estante y bandeja.
          </p>
        </div>

        <button
          onClick={cargarDatos}
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

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <KPI label="Total cosechado" value={`${totalKg.toFixed(1)} kg`} />
        <KPI label="Premium" value={`${totalPremium.toFixed(1)} kg`} highlight color="green" />
        <KPI label="Comercial" value={`${totalComercial.toFixed(1)} kg`} />
        <KPI label="Merma" value={`${porcentajeMerma.toFixed(1)}%`} color="red" />
        <KPI label="Ingreso est." value={`$${ingresoEstimado.toFixed(0)}`} highlight color="micelio" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">Nueva cosecha</h3>

            <div className="space-y-3">
              <Input
                type="date"
                label="Fecha"
                value={nuevaCosecha.fecha}
                onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, fecha: v })}
              />

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Ciclo"
                  value={nuevaCosecha.cicloId}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, cicloId: v })}
                />

                <Input
                  label="Lote"
                  value={nuevaCosecha.lote}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, lote: v })}
                />
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Bandeja registrada</label>
                <select
                  value={nuevaCosecha.bandejaId}
                  onChange={(e) => {
                    const bandeja = bandejas.find((b) => b.id === e.target.value);
                    setNuevaCosecha({
                      ...nuevaCosecha,
                      bandejaId: e.target.value,
                      lote: bandeja?.lote || nuevaCosecha.lote,
                      cicloId: bandeja?.ciclo_id || nuevaCosecha.cicloId,
                      estante: bandeja?.estanterias?.codigo
                        ? `${bandeja.estanterias.codigo}-N${bandeja.nivel || ''}-P${bandeja.posicion || ''}`
                        : nuevaCosecha.estante,
                    });
                  }}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                >
                  <option value="">Sin bandeja / manual</option>
                  {bandejas.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.codigo || b.id} · {b.estanterias?.codigo || b.estanteria_id || 'Sin estantería'} · N{b.nivel || '-'} P{b.posicion || '-'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Vuelta</label>
                  <select
                    value={nuevaCosecha.vuelta}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, vuelta: parseInt(e.target.value) })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  >
                    <option value={1}>Vuelta 1</option>
                    <option value={2}>Vuelta 2</option>
                    <option value={3}>Vuelta 3</option>
                  </select>
                </div>

                <Input
                  label="Estante / ubicación"
                  value={nuevaCosecha.estante}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, estante: v })}
                  placeholder="Ej: E1-N1-P1"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <Input
                  type="number"
                  step="0.1"
                  label="Premium kg"
                  value={nuevaCosecha.kgPremium}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, kgPremium: v })}
                  className="border-green-200 bg-green-50"
                />

                <Input
                  type="number"
                  step="0.1"
                  label="Comerc. kg"
                  value={nuevaCosecha.kgComercial}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, kgComercial: v })}
                />

                <Input
                  type="number"
                  step="0.1"
                  label="Merma kg"
                  value={nuevaCosecha.kgMerma}
                  onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, kgMerma: v })}
                  className="border-red-200 bg-red-50"
                />
              </div>

              <Input
                label="Cliente"
                value={nuevaCosecha.cliente}
                onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, cliente: v })}
                placeholder="Ej: Restaurante X, CBI"
              />

              <Input
                label="Destino"
                value={nuevaCosecha.destino}
                onChange={(v: string) => setNuevaCosecha({ ...nuevaCosecha, destino: v })}
                placeholder="Ej: D2C, HoReCa, CBI, merma"
              />

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Notas</label>
                <textarea
                  value={nuevaCosecha.notas}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, notas: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  rows={2}
                />
              </div>

              <button
                onClick={guardarCosecha}
                disabled={guardando}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bosque-600 text-white rounded-lg hover:bg-bosque-700 text-sm font-medium disabled:opacity-60"
              >
                <Save className="w-4 h-4" />
                {guardando ? 'Guardando...' : 'Guardar cosecha'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-micelio-200 p-6">
            <h3 className="font-serif text-lg text-tierra-900 mb-4">
              Histórico ({cosechas.length})
            </h3>

            {cosechas.length === 0 ? (
              <div className="text-center py-12 text-tierra-500">
                <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>No hay cosechas registradas aún.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {cosechas.map((c) => {
                  const total = Number(c.kgPremium || 0) + Number(c.kgComercial || 0) + Number(c.kgMerma || 0);

                  return (
                    <div key={c.id} className="p-4 bg-micelio-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2 gap-3">
                        <div className="font-medium text-tierra-900">
                          {c.cicloId || 'C1'} · {c.lote} · Vuelta {c.vuelta}
                          {c.bandejaId && <span className="text-tierra-500 font-normal"> · Bandeja {c.bandejaId}</span>}
                          {c.estante && <span className="text-tierra-500 font-normal"> · {c.estante}</span>}
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="text-xs text-tierra-600">
                            {format(new Date(c.fecha), "d MMM yyyy", { locale: es })}
                          </div>

                          <button
                            onClick={() => eliminarCosecha(c.id)}
                            className="p-1.5 rounded-lg text-red-700 hover:bg-red-50"
                            title="Eliminar cosecha"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div className="px-2 py-1 bg-green-100 text-green-800 rounded">
                          Premium: {c.kgPremium} kg
                        </div>
                        <div className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                          Comercial: {c.kgComercial} kg
                        </div>
                        <div className="px-2 py-1 bg-red-100 text-red-800 rounded">
                          Merma: {c.kgMerma} kg
                        </div>
                        <div className="px-2 py-1 bg-micelio-100 text-micelio-800 rounded font-medium">
                          Total: {total.toFixed(1)} kg
                        </div>
                      </div>

                      {(c.cliente || c.destino || c.notas) && (
                        <div className="text-xs text-tierra-700 mt-2 space-y-1">
                          {c.cliente && <div>Cliente: {c.cliente}</div>}
                          {c.destino && <div>Destino: {c.destino}</div>}
                          {c.notas && <div>Notas: {c.notas}</div>}
                        </div>
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

function KPI({ label, value, color, highlight }: any) {
  const colorMap: any = {
    green: 'bg-green-50 border-green-200',
    red: 'bg-red-50 border-red-200',
    micelio: 'bg-micelio-50 border-micelio-200',
  };

  return (
    <div className={`rounded-2xl p-4 border ${highlight && color ? colorMap[color] : 'bg-white border-micelio-200'}`}>
      <div className="text-xs text-tierra-600 uppercase tracking-wider mb-1">{label}</div>
      <div className="font-serif text-2xl text-tierra-900">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', step, className = '' }: any) {
  return (
    <div>
      <label className="text-xs text-tierra-600 uppercase tracking-wider">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm ${className}`}
      />
    </div>
  );
}
