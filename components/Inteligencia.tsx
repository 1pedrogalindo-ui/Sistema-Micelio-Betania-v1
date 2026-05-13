'use client';

import { useEffect, useMemo, useState } from 'react';
import { dataAPI } from '@/lib/storage';
import { calcularMermaPct, calcularRendimientoKgM2, proyectarRendimiento } from '@/lib/intelligence';
import { Brain, TrendingUp, BarChart3, Target } from 'lucide-react';

export default function Inteligencia() {
  const [cosechas, setCosechas] = useState<any[]>([]);

  useEffect(() => {
    setCosechas(dataAPI.getCosechas());
  }, []);

  const ciclos = useMemo(() => {
    const grupos: Record<string, any> = {};

    cosechas.forEach((c) => {
      const ciclo = c.ciclo_id || c.cicloId || 'C1';
      if (!grupos[ciclo]) {
        grupos[ciclo] = { ciclo, areaM2: ciclo === 'C1' ? 10 : ciclo === 'C2' ? 21 : 30, premium: 0, comercial: 0, merma: 0 };
      }
      grupos[ciclo].premium += Number(c.kgPremium || c.kg_premium || 0);
      grupos[ciclo].comercial += Number(c.kgComercial || c.kg_comercial || 0);
      grupos[ciclo].merma += Number(c.kgMerma || c.kg_merma || 0);
    });

    const lista = Object.values(grupos).map((c: any) => {
      const total = c.premium + c.comercial + c.merma;
      return {
        ...c,
        total,
        rendimiento: calcularRendimientoKgM2(total, c.areaM2),
        mermaPct: calcularMermaPct(c.merma, total),
        ingreso: c.premium * 4.5 + c.comercial * 3.25,
      };
    });

    return lista.length ? lista : [{ ciclo: 'C1', areaM2: 10, premium: 0, comercial: 0, merma: 0, total: 0, rendimiento: 0, mermaPct: 0, ingreso: 0 }];
  }, [cosechas]);

  const prediccion = proyectarRendimiento(ciclos);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">Fase 5</div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Inteligencia</h1>
        <p className="text-tierra-600">Comparativa C1 vs C2 vs C3 y predicción básica de rendimiento.</p>
      </header>

      <div className="grid md:grid-cols-4 gap-4">
        <KPI icon={TrendingUp} label="Rendimiento esperado" value={`${prediccion.rendimientoEsperado.toFixed(2)} kg/m²`} />
        <KPI icon={BarChart3} label="Producción esperada" value={`${prediccion.produccionEsperada.toFixed(1)} kg`} />
        <KPI icon={Brain} label="Confianza" value={prediccion.confianza} />
        <KPI icon={Target} label="Ciclos analizados" value={`${ciclos.length}`} />
      </div>

      <div className="mb-card p-6">
        <h2 className="font-serif text-2xl text-tierra-900 mb-2">Recomendación</h2>
        <p className="text-tierra-700">{prediccion.recomendacion}</p>
      </div>

      <div className="mb-card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead className="bg-micelio-50 border-b border-micelio-200">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left p-4">Ciclo</th>
              <th className="text-right p-4">Área</th>
              <th className="text-right p-4">Total kg</th>
              <th className="text-right p-4">Kg/m²</th>
              <th className="text-right p-4">Merma</th>
              <th className="text-right p-4">Ingreso</th>
            </tr>
          </thead>
          <tbody>
            {ciclos.map((c: any) => (
              <tr key={c.ciclo} className="border-b border-micelio-100">
                <td className="p-4 font-medium">{c.ciclo}</td>
                <td className="p-4 text-right">{c.areaM2} m²</td>
                <td className="p-4 text-right">{c.total.toFixed(1)}</td>
                <td className="p-4 text-right">{c.rendimiento.toFixed(2)}</td>
                <td className="p-4 text-right">{c.mermaPct.toFixed(1)}%</td>
                <td className="p-4 text-right">${c.ingreso.toFixed(0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
