'use client';

import { useEffect, useMemo, useState } from 'react';
import { dataAPI } from '@/lib/storage';
import { Briefcase, DollarSign, Sprout, TrendingUp, ShieldCheck } from 'lucide-react';

export default function Inversionistas() {
  const [cosechas, setCosechas] = useState<any[]>([]);
  const [inventario, setInventario] = useState<any[]>([]);
  const [fases, setFases] = useState<any[]>([]);

  useEffect(() => {
    setCosechas(dataAPI.getCosechas());
    setInventario(dataAPI.getInventario());
    setFases(dataAPI.getFases());
  }, []);

  const m = useMemo(() => {
    const premium = cosechas.reduce((s, c) => s + Number(c.kgPremium || c.kg_premium || 0), 0);
    const comercial = cosechas.reduce((s, c) => s + Number(c.kgComercial || c.kg_comercial || 0), 0);
    const merma = cosechas.reduce((s, c) => s + Number(c.kgMerma || c.kg_merma || 0), 0);
    const totalKg = premium + comercial + merma;
    const ingreso = premium * 4.5 + comercial * 3.25;
    const costo = inventario.reduce((s, i) => s + Number(i.cantidad || 0) * Number(i.precioUnit || 0), 0);
    const avance = fases.length ? (fases.filter((f) => f.estado === 'completado').length / fases.length) * 100 : 0;
    const kgM2 = totalKg / 10;
    const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;

    return { premium, comercial, merma, totalKg, ingreso, costo, margen: ingreso - costo, avance, kgM2, mermaPct };
  }, [cosechas, inventario, fases]);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">Momento 2</div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Dashboard para inversionistas</h1>
        <p className="text-tierra-600">Vista ejecutiva para decidir escalamiento con evidencia.</p>
      </header>

      <div className="rounded-3xl p-7 bg-gradient-to-br from-tierra-950 via-tierra-900 to-bosque-900 text-micelio-50 shadow-soft">
        <div className="flex gap-4">
          <div className="w-14 h-14 rounded-2xl bg-micelio-400 flex items-center justify-center">
            <Briefcase className="w-7 h-7 text-tierra-950" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-widest text-micelio-200 mb-1">Tesis de inversión</div>
            <h2 className="font-serif text-3xl mb-2">Escalar solo con evidencia operativa</h2>
            <p className="text-sm text-micelio-100 max-w-4xl">
              El piloto debe validar rendimiento por m², merma, costo real por kg, avance operativo y capacidad comercial antes de Momento 2.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-5 gap-4">
        <KPI icon={Sprout} label="Producción" value={`${m.totalKg.toFixed(1)} kg`} />
        <KPI icon={TrendingUp} label="Rendimiento" value={`${m.kgM2.toFixed(2)} kg/m²`} />
        <KPI icon={DollarSign} label="Ingreso" value={`$${m.ingreso.toFixed(0)}`} />
        <KPI icon={DollarSign} label="Margen" value={`$${m.margen.toFixed(0)}`} />
        <KPI icon={ShieldCheck} label="Avance" value={`${m.avance.toFixed(0)}%`} />
      </div>

      <div className="mb-card p-6">
        <h3 className="font-serif text-2xl text-tierra-900 mb-4">Semáforo de escalamiento</h3>
        <div className={`rounded-2xl p-5 border ${m.kgM2 >= 8 && m.mermaPct <= 10 ? 'bg-green-50 border-green-200 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
          <div className="text-lg font-semibold mb-2">
            {m.kgM2 >= 8 && m.mermaPct <= 10 ? 'Listo para evaluar Momento 2' : 'Todavía en validación'}
          </div>
          <p className="text-sm">Meta: 8 kg/m² o más, merma menor a 10% y costos reales documentados.</p>
        </div>
      </div>
    </div>
  );
}

function KPI({ icon: Icon, label, value }: any) {
  return (
    <div className="mb-card p-5">
      <div className="flex items-center gap-2 text-bosque-700 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-2xl text-tierra-900">{value}</div>
    </div>
  );
}
