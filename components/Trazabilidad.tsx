'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { Plus, Save, Package } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

export default function Trazabilidad() {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [nuevaCosecha, setNuevaCosecha] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    lote: 'MB-AB-001',
    vuelta: 1,
    estante: '',
    kgPremium: '',
    kgComercial: '',
    kgMerma: '',
    cliente: '',
    notas: '',
  });

  useEffect(() => {
    setCosechas(dataAPI.getCosechas());
  }, []);

  const guardarCosecha = () => {
    const nueva = {
      id: `cos-${Date.now()}`,
      ...nuevaCosecha,
      kgPremium: parseFloat(nuevaCosecha.kgPremium) || 0,
      kgComercial: parseFloat(nuevaCosecha.kgComercial) || 0,
      kgMerma: parseFloat(nuevaCosecha.kgMerma) || 0,
    };
    const nuevas = [nueva, ...cosechas];
    setCosechas(nuevas);
    dataAPI.setCosechas(nuevas);
    setNuevaCosecha({
      ...nuevaCosecha,
      estante: '',
      kgPremium: '',
      kgComercial: '',
      kgMerma: '',
      cliente: '',
      notas: '',
    });
  };

  const totalPremium = cosechas.reduce((s, c) => s + c.kgPremium, 0);
  const totalComercial = cosechas.reduce((s, c) => s + c.kgComercial, 0);
  const totalMerma = cosechas.reduce((s, c) => s + c.kgMerma, 0);
  const totalKg = totalPremium + totalComercial + totalMerma;
  const porcentajeMerma = totalKg > 0 ? (totalMerma / totalKg) * 100 : 0;
  const ingresoEstimado = totalPremium * 4.5 + totalComercial * 3.25;

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Trazabilidad R-05
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Lotes & Cosechas</h1>
        <p className="text-tierra-600">Registro de cada cosecha por vuelta y estante</p>
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
            <h3 className="font-serif text-lg text-tierra-900 mb-4">Nueva Cosecha</h3>
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
                  <label className="text-xs text-tierra-600 uppercase tracking-wider">Lote</label>
                  <input
                    type="text"
                    value={nuevaCosecha.lote}
                    onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, lote: e.target.value })}
                    className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  />
                </div>
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
              </div>
              <div>
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Estante / Bandeja</label>
                <input
                  type="text"
                  value={nuevaCosecha.estante}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, estante: e.target.value })}
                  placeholder="ej: E1-B5"
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
                <label className="text-xs text-tierra-600 uppercase tracking-wider">Cliente / Destino</label>
                <input
                  type="text"
                  value={nuevaCosecha.cliente}
                  onChange={(e) => setNuevaCosecha({ ...nuevaCosecha, cliente: e.target.value })}
                  placeholder="ej: Restaurante X, CBI, etc."
                  className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                />
              </div>
              <button
                onClick={guardarCosecha}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-micelio-600 text-white rounded-lg hover:bg-micelio-700 text-sm font-medium"
              >
                <Save className="w-4 h-4" /> Guardar Cosecha
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
                  const total = c.kgPremium + c.kgComercial + c.kgMerma;
                  return (
                    <div key={c.id} className="p-4 bg-micelio-50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium text-tierra-900">
                          {c.lote} · Vuelta {c.vuelta}
                          {c.estante && <span className="text-tierra-500 font-normal"> · {c.estante}</span>}
                        </div>
                        <div className="text-xs text-tierra-600">
                          {format(new Date(c.fecha), "d MMM yyyy", { locale: es })}
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
                      {c.cliente && (
                        <div className="text-xs text-tierra-700 mt-2">→ {c.cliente}</div>
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
