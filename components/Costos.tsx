'use client';

import { useState, useEffect } from 'react';
import { ESCENARIOS_INVERSION, PROYECCION_INGRESOS } from '@/data/seed';
import { dataAPI } from '@/lib/storage';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function Costos() {
  const [inventario, setInventario] = useState<any[]>([]);

  useEffect(() => {
    setInventario(dataAPI.getInventario());
  }, []);

  // Calcular costos reales del inventario
  const costoReal = inventario.reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);
  const costoPorCategoria = inventario.reduce((acc, i) => {
    const cat = i.categoria;
    acc[cat] = (acc[cat] || 0) + i.cantidad * i.precioUnit;
    return acc;
  }, {} as Record<string, number>);

  const dataCategorias = Object.entries(costoPorCategoria).map(([cat, total]) => ({
    categoria: cat,
    total: Math.round(total as number),
  }));

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Análisis Financiero
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Costos & ROI</h1>
        <p className="text-tierra-600">Escenarios de inversión y proyección de ingresos</p>
      </header>

      {/* Escenarios de inversión */}
      <div className="grid lg:grid-cols-3 gap-4">
        {ESCENARIOS_INVERSION.map((e, i) => (
          <div
            key={e.nombre}
            className={`rounded-2xl p-6 border-2 ${
              i === 1
                ? 'bg-micelio-50 border-micelio-500'
                : 'bg-white border-micelio-200'
            }`}
          >
            {i === 1 && (
              <div className="inline-block px-2 py-0.5 bg-micelio-600 text-white text-xs rounded-full mb-2">
                Recomendado
              </div>
            )}
            <div className="text-xs text-tierra-600 uppercase tracking-wider mb-2">
              Escenario {e.nombre}
            </div>
            <div className="font-serif text-4xl text-tierra-900 mb-2">${e.total}</div>
            <p className="text-sm text-tierra-600 mb-4">{e.descripcion}</p>
            <ul className="space-y-1.5">
              {e.items.map((item, j) => (
                <li key={j} className="text-xs text-tierra-700 flex items-start gap-2">
                  <span className="text-micelio-500">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Costo real vs estimado */}
      <div className="bg-white rounded-2xl border border-micelio-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-tierra-900">Costos por Categoría</h3>
          <div className="text-right">
            <div className="text-xs text-tierra-600 uppercase tracking-wider">Total real</div>
            <div className="font-serif text-2xl text-tierra-900">${costoReal.toFixed(0)}</div>
          </div>
        </div>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataCategorias}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc0" />
              <XAxis dataKey="categoria" stroke="#735e42" style={{ fontSize: '12px' }} />
              <YAxis stroke="#735e42" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ background: '#fdfbf7', border: '1px solid #d6c194', borderRadius: '8px' }}
              />
              <Bar dataKey="total" fill="#a88748" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Proyección de ingresos */}
      <div className="bg-white rounded-2xl border border-micelio-200 p-6">
        <h3 className="font-serif text-lg text-tierra-900 mb-4">Proyección de Ingresos por Ciclo</h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={PROYECCION_INGRESOS}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e8dcc0" />
              <XAxis dataKey="ciclo" stroke="#735e42" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={70} />
              <YAxis stroke="#735e42" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{ background: '#fdfbf7', border: '1px solid #d6c194', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="ingreso" fill="#a88748" name="Ingreso USD" radius={[6, 6, 0, 0]} />
              <Bar dataKey="costo" fill="#c5b395" name="Costo USD" radius={[6, 6, 0, 0]} />
              <Bar dataKey="margen" fill="#6e5530" name="Margen USD" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto mt-6">
          <table className="w-full text-sm">
            <thead className="border-b border-micelio-200">
              <tr className="text-xs uppercase tracking-wider text-tierra-600">
                <th className="text-left py-2 pr-3">Ciclo</th>
                <th className="text-right py-2 px-3">Área m²</th>
                <th className="text-right py-2 px-3">kg/m²</th>
                <th className="text-right py-2 px-3">Producción</th>
                <th className="text-right py-2 px-3">Ingreso</th>
                <th className="text-right py-2 px-3">Costo</th>
                <th className="text-right py-2 pl-3">Margen</th>
              </tr>
            </thead>
            <tbody>
              {PROYECCION_INGRESOS.map((p) => (
                <tr key={p.ciclo} className="border-b border-micelio-100">
                  <td className="py-2 pr-3 text-tierra-900 font-medium">{p.ciclo}</td>
                  <td className="py-2 px-3 text-right text-tierra-700">{p.area}</td>
                  <td className="py-2 px-3 text-right text-tierra-700">{p.rendimiento}</td>
                  <td className="py-2 px-3 text-right text-tierra-700">{p.produccion} kg</td>
                  <td className="py-2 px-3 text-right text-tierra-700">${p.ingreso}</td>
                  <td className="py-2 px-3 text-right text-tierra-700">${p.costo}</td>
                  <td className={`py-2 pl-3 text-right font-medium ${p.margen >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    {p.margen >= 0 ? '+' : ''}${p.margen}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-micelio-100 rounded-2xl p-6 border border-micelio-300">
        <h3 className="font-serif text-lg text-tierra-900 mb-2">Nota estratégica</h3>
        <p className="text-sm text-tierra-700">
          El primer ciclo casi siempre no genera utilidad: es la inversión en aprendizaje operativo.
          El objetivo correcto no es la ganancia en ciclo 1; es producir datos confiables, validar proveedores
          y abrir los primeros canales de venta. A partir del ciclo 2, con la curva de aprendizaje mejorada,
          el negocio empieza a ser rentable. <strong>Planificar el capital de trabajo para cubrir 2 ciclos completos
          antes de esperar flujo de caja positivo.</strong>
        </p>
      </div>
    </div>
  );
}
