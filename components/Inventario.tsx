'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { Check, AlertTriangle, ShoppingCart } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

const urgenciaColor: Record<string, string> = {
  critica: 'bg-red-100 text-red-700 border-red-200',
  alta: 'bg-amber-100 text-amber-700 border-amber-200',
  media: 'bg-blue-100 text-blue-700 border-blue-200',
};

const estados = [
  { id: 'pendiente', label: 'Pendiente' },
  { id: 'pedido', label: 'Pedido' },
  { id: 'recibido', label: 'Recibido' },
];

export default function Inventario() {
  const [items, setItems] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');

  useEffect(() => {
    setItems(dataAPI.getInventario());
  }, []);

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    const nuevos = items.map((i) => (i.id === id ? { ...i, estado: nuevoEstado } : i));
    setItems(nuevos);
    dataAPI.setInventario(nuevos);
  };

  const categorias = ['todos', ...Array.from(new Set(items.map((i) => i.categoria)))];

  const itemsFiltrados = items.filter((i) => {
    if (filtroCategoria !== 'todos' && i.categoria !== filtroCategoria) return false;
    if (filtroUrgencia !== 'todos' && i.urgencia !== filtroUrgencia) return false;
    return true;
  });

  const total = items.reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);
  const totalPendiente = items
    .filter((i) => i.estado === 'pendiente')
    .reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);
  const totalCritico = items
    .filter((i) => i.urgencia === 'critica' && i.estado === 'pendiente')
    .reduce((sum, i) => sum + i.cantidad * i.precioUnit, 0);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
          Compras & Inventario
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Inventario</h1>
        <p className="text-tierra-600">{items.length} items · {items.filter((i) => i.estado === 'pendiente').length} pendientes</p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <KPI label="Inversión total" value={`$${total.toFixed(0)}`} color="micelio" />
        <KPI label="Pendiente de comprar" value={`$${totalPendiente.toFixed(0)}`} color="amber" />
        <KPI label="Crítico (urgente)" value={`$${totalCritico.toFixed(0)}`} color="red" highlight />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition capitalize ${
                filtroCategoria === cat ? 'bg-micelio-600 text-white' : 'bg-white text-tierra-700 border border-micelio-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="w-px h-6 bg-micelio-200" />
        <div className="flex gap-2">
          {['todos', 'critica', 'alta', 'media'].map((u) => (
            <button
              key={u}
              onClick={() => setFiltroUrgencia(u)}
              className={`px-3 py-1.5 rounded-full text-xs transition capitalize ${
                filtroUrgencia === u ? 'bg-tierra-700 text-white' : 'bg-white text-tierra-700 border border-micelio-200'
              }`}
            >
              {u}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-micelio-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-micelio-50 border-b border-micelio-200">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left p-4">Item</th>
              <th className="text-left p-4">Categoría</th>
              <th className="text-center p-4">Cant.</th>
              <th className="text-right p-4">P. Unit</th>
              <th className="text-right p-4">Total</th>
              <th className="text-center p-4">Urgencia</th>
              <th className="text-center p-4">Deadline</th>
              <th className="text-center p-4">Estado</th>
            </tr>
          </thead>
          <tbody>
            {itemsFiltrados.map((item) => (
              <tr key={item.id} className="border-b border-micelio-100 hover:bg-micelio-50/50">
                <td className="p-4 text-sm text-tierra-900 font-medium">{item.item}</td>
                <td className="p-4 text-sm text-tierra-600">{item.categoria}</td>
                <td className="p-4 text-sm text-center text-tierra-700">{item.cantidad}</td>
                <td className="p-4 text-sm text-right text-tierra-700">${item.precioUnit.toFixed(2)}</td>
                <td className="p-4 text-sm text-right font-medium text-tierra-900">
                  ${(item.cantidad * item.precioUnit).toFixed(2)}
                </td>
                <td className="p-4 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full border ${urgenciaColor[item.urgencia]}`}>
                    {item.urgencia}
                  </span>
                </td>
                <td className="p-4 text-xs text-center text-tierra-600">
                  {format(parseISO(item.fechaLimite), "d MMM", { locale: es })}
                </td>
                <td className="p-4 text-center">
                  <select
                    value={item.estado}
                    onChange={(e) => cambiarEstado(item.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full border ${
                      item.estado === 'recibido' ? 'bg-green-100 text-green-700 border-green-200' :
                      item.estado === 'pedido' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                      'bg-red-100 text-red-700 border-red-200'
                    }`}
                  >
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.label}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, color, highlight }: any) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-micelio-200'}`}>
      <div className="text-xs text-tierra-600 uppercase tracking-wider mb-2">{label}</div>
      <div className="font-serif text-3xl text-tierra-900">{value}</div>
    </div>
  );
}
