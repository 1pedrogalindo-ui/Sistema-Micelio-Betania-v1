'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { registrarAuditLog } from '@/lib/audit';
import { Save, Package, Trash2, RefreshCw } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Trazabilidad() {
  const [cosechas, setCosechas] = useState<any[]>([]);
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
    cargarCosechas();
  }, []);

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

  const cargarCosechas = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setCosechas(dataAPI.getCosechas());
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('cosechas')
      .select('*')
      .order('fecha', { ascending: false })
      .order('created_at', { ascending: false });

    if (error) {
      console.error(error);
      alert('No se pudieron cargar cosechas desde Supabase. Se mostrará respaldo local.');
      setCosechas(dataAPI.getCosechas());
      setCargando(false);
      return;
    }

    const cosechasUi = (data || []).map(mapDbToUi);
    setCosechas(cosechasUi);
    dataAPI.setCosechas(cosechasUi);
    setCargando(false);
  };

  const guardarCosecha = async () => {
    if (!nuevaCosecha.lote.trim()) {
      alert('El lote es obligatorio.');
      return;
    }

    const kgPremium = parseFloat(nuevaCosecha.kgPremium) || 0;
    const kgComercial = parseFloat(nuevaCosecha.kgComercial) || 0;
    const kgMerma = parseFloat(nuevaCosecha.kgMerma) || 0;
    const totalKg = kgPremium + kgComercial + kgMerma;

    if (totalKg <= 0) {
      alert('Registra al menos un valor de kg premium, comercial o merma.');
      return;
    }

    setGuardando(true);

    const payloadDb = {
      fecha: nuevaCosecha.fecha,
      lote: nuevaCosecha.lote.trim(),
      ciclo_id: nuevaCosecha.cicloId.trim() || 'C1',
      bandeja_id: nuevaCosecha.bandejaId.trim() || null,
      vuelta: Number(nuevaCosecha.vuelta || 1),
      estante: nuevaCosecha.estante.trim() || null,
      kg_premium: kgPremium,
      kg_comercial: kgComercial,
      kg_merma: kgMerma,
      cliente: nuevaCosecha.cliente.trim() || null,
      destino: nuevaCosecha.destino.trim() || null,
      notas: nuevaCosecha.notas.trim() || null,
    };

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      const nuevaLocal = {
        id: `cos-${Date.now()}`,
        ...nuevaCosecha,
        kgPremium,
        kgComercial,
        kgMerma,
      };

      const nuevas = [nuevaLocal, ...cosechas];
      setCosechas(nuevas);
      dataAPI.setCosechas(nuevas);
      setGuardando(false);
      return;
    }

    const { data, error } = await supabase
      .from('cosechas')
      .insert(payloadDb)
      .select()
      .single();

    if (error) {
      console.error(error);
      alert(`No se pudo guardar la cosecha en Supabase: ${error.message}`);
      setGuardando(false);
      return;
    }

    await registrarAuditLog({
      accion: 'crear',
      tabla: 'cosechas',
      registroId: data.id,
      descripcion: `Registro de cosecha ${payloadDb.lote} · Vuelta ${payloadDb.vuelta}`,
      valoresNuevos: {
        ...payloadDb,
        totalKg,
      },
    });

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

    await cargarCosechas();
    setGuardando(false);
  };

  const eliminarCosecha = async (id: string) => {
    const cosecha = cosechas.find((c) => c.id === id);
    if (!cosecha) return;

    const confirmar = window.confirm(`¿Eliminar cosecha del lote ${cosecha.lote}?`);
    if (!confirmar) return;

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      const nuevas = cosechas.filter((c) => c.id !== id);
      setCosechas(nuevas);
      dataAPI.setCosechas(nuevas);
      return;
    }

    const { error } = await supabase
      .from('cosechas')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      alert(`No se pudo eliminar la cosecha: ${error.message}`);
      return;
    }

    await registrarAuditLog({
      accion: 'eliminar',
      tabla: 'cosechas',
      registroId: id,
      descripcion: `Eliminación de cosecha ${cosecha.lote}`,
      valoresAnteriores: cosecha,
    });

    await cargarCosechas();
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
            Registro transaccional de cada cosecha por lote, vuelta, estante y bandeja.
          </p>
        </div>

        <button
          onClick={cargarCosechas}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </header>

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
              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Fecha</label>
                <input
                  type="date"
                  value={nuevaCosecha.fecha}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, fecha: e.target.value })}
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Ciclo</label>
                  <input
                    value={nuevaCosecha.cicloId}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, cicloId: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Lote</label>
                  <input
                    value={nuevaCosecha.lote}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, lote: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  />
                </div>
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

                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Bandeja ID</label>
                  <input
                    value={nuevaCosecha.bandejaId}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, bandejaId: e.target.value })}
                    placeholder="B-001"
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Estante / bandeja</label>
                <input
                  value={nuevaCosecha.estante}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, estante: e.target.value })}
                  placeholder="Ej: E1-B5"
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Premium kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevaCosecha.kgPremium}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, kgPremium: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-green-200 bg-green-50 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Comerc. kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevaCosecha.kgComercial}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, kgComercial: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  />
                </div>

                <div>
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Merma kg</label>
                  <input
                    type="number"
                    step="0.1"
                    value={nuevaCosecha.kgMerma}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, kgMerma: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-red-200 bg-red-50 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Cliente</label>
                <input
                  value={nuevaCosecha.cliente}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, cliente: e.target.value })}
                  placeholder="Ej: Restaurante X, CBI"
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Destino</label>
                <input
                  value={nuevaCosecha.destino}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, destino: e.target.value })}
                  placeholder="Ej: D2C, HoReCa, CBI, merma"
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>

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
                <p className="text-xs mt-1">Primera cosecha esperada: 30/04/2026</p>
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
