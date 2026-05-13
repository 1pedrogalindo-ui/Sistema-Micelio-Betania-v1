'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { registrarAuditLog } from '@/lib/audit';
import { Check, AlertTriangle, ShoppingCart, Save, Trash2 } from 'lucide-react';
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
  const [guardandoId, setGuardandoId] = useState<string | null>(null);

  useEffect(() => {
    setItems(dataAPI.getInventario());
  }, []);

  const guardarLocal = (nuevos: any[]) => {
    setItems(nuevos);
    dataAPI.setInventario(nuevos);
  };

  const actualizarCampo = (id: string, campo: string, valor: any) => {
    const nuevos = items.map((i) => {
      if (i.id !== id) return i;

      return {
        ...i,
        [campo]: campo === 'cantidad' || campo === 'precioUnit'
          ? Number(valor || 0)
          : valor,
      };
    });

    guardarLocal(nuevos);
  };

  const guardarItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    setGuardandoId(id);

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const { error } = await supabase
        .from('inventario')
        .update({
          cantidad: Number(item.cantidad || 0),
          precio_unit: Number(item.precioUnit || 0),
          estado: item.estado,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) {
        console.error(error);
        alert('No se pudo guardar el item en Supabase.');
        setGuardandoId(null);
        return;
      }
    }

    await registrarAuditLog({
      accion: 'actualizar',
      tabla: 'inventario',
      registroId: id,
      descripcion: `Actualización de inventario: ${item.item}`,
      valoresNuevos: {
        cantidad: Number(item.cantidad || 0),
        precioUnit: Number(item.precioUnit || 0),
        total: Number(item.cantidad || 0) * Number(item.precioUnit || 0),
        estado: item.estado,
      },
    });

    setGuardandoId(null);
  };

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    actualizarCampo(id, 'estado', nuevoEstado);
  };

  const eliminarItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const confirmar = window.confirm(`¿Eliminar del inventario: ${item.item}?`);
    if (!confirmar) return;

    const nuevos = items.filter((i) => i.id !== id);
    guardarLocal(nuevos);

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const { error } = await supabase
        .from('inventario')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(error);
        alert('No se pudo eliminar en Supabase. Se eliminó solo localmente.');
      }
    }

    await registrarAuditLog({
      accion: 'eliminar',
      tabla: 'inventario',
      registroId: id,
      descripcion: `Eliminación de inventario: ${item.item}`,
      valoresAnteriores: item,
    });
  };

  const categorias = ['todos', ...Array.from(new Set(items.map((i) => i.categoria)))];

  const itemsFiltrados = items.filter((i) => {
    if (filtroCategoria !== 'todos' && i.categoria !== filtroCategoria) return false;
    if (filtroUrgencia !== 'todos' && i.urgencia !== filtroUrgencia) return false;
    return true;
  });

  const total = items.reduce((sum, i) => sum + Number(i.cantidad || 0) * Number(i.precioUnit || 0), 0);
  const totalPendiente = items
    .filter((i) => i.estado === 'pendiente')
    .reduce((sum, i) => sum + Number(i.cantidad || 0) * Number(i.precioUnit || 0), 0);
  const totalCritico = items
    .filter((i) => i.urgencia === 'critica' && i.estado === 'pendiente')
    .reduce((sum, i) => sum + Number(i.cantidad || 0) * Number(i.precioUnit || 0), 0);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
          Compras & Inventario
        </div>
        <h1 className="font-serif text-4xl text-tierra-900 mb-2">Inventario</h1>
        <p className="text-tierra-600">
          {items.length} items · {items.filter((i) => i.estado === 'pendiente').length} pendientes
        </p>
      </header>

      <div className="grid grid-cols-3 gap-4">
        <KPI label="Inversión total" value={`$${total.toFixed(0)}`} />
        <KPI label="Pendiente de comprar" value={`$${totalPendiente.toFixed(0)}`} />
        <KPI label="Crítico urgente" value={`$${totalCritico.toFixed(0)}`} highlight />
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="flex flex-wrap gap-2">
          {categorias.map((cat) => (
            <button
              key={cat}
              onClick={() => setFiltroCategoria(cat)}
              className={`px-3 py-1.5 rounded-full text-xs transition capitalize ${
                filtroCategoria === cat
                  ? 'bg-bosque-600 text-white'
                  : 'bg-white text-tierra-700 border border-micelio-200'
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
                filtroUrgencia === u
                  ? 'bg-tierra-800 text-white'
                  : 'bg-white text-tierra-700 border border-micelio-200'
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
              <th className="text-center p-4">Acciones</th>
            </tr>
          </thead>

          <tbody>
            {itemsFiltrados.map((item) => {
              const cantidad = Number(item.cantidad || 0);
              const precioUnit = Number(item.precioUnit || 0);
              const totalItem = cantidad * precioUnit;

              return (
                <tr key={item.id} className="border-b border-micelio-100 hover:bg-micelio-50/50">
                  <td className="p-4 text-sm text-tierra-900 font-medium">{item.item}</td>

                  <td className="p-4 text-sm text-tierra-600">{item.categoria}</td>

                  <td className="p-4 text-sm text-center text-tierra-700">
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={cantidad}
                      onChange={(e) => actualizarCampo(item.id, 'cantidad', e.target.value)}
                      className="w-20 text-center px-2 py-1.5 rounded-lg border border-micelio-200 bg-white focus:outline-none focus:ring-2 focus:ring-bosque-500"
                    />
                  </td>

                  <td className="p-4 text-sm text-right text-tierra-700">
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={precioUnit}
                      onChange={(e) => actualizarCampo(item.id, 'precioUnit', e.target.value)}
                      className="w-24 text-right px-2 py-1.5 rounded-lg border border-micelio-200 bg-white focus:outline-none focus:ring-2 focus:ring-bosque-500"
                    />
                  </td>

                  <td className="p-4 text-sm text-right font-semibold text-tierra-900">
                    ${totalItem.toFixed(2)}
                  </td>

                  <td className="p-4 text-center">
                    <span className={`text-xs px-2 py-1 rounded-full border ${urgenciaColor[item.urgencia]}`}>
                      {item.urgencia}
                    </span>
                  </td>

                  <td className="p-4 text-xs text-center text-tierra-600">
                    {item.fechaLimite ? format(parseISO(item.fechaLimite), "d MMM", { locale: es }) : '—'}
                  </td>

                  <td className="p-4 text-center">
                    <select
                      value={item.estado}
                      onChange={(e) => cambiarEstado(item.id, e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border ${
                        item.estado === 'recibido'
                          ? 'bg-green-100 text-green-700 border-green-200'
                          : item.estado === 'pedido'
                          ? 'bg-blue-100 text-blue-700 border-blue-200'
                          : 'bg-red-100 text-red-700 border-red-200'
                      }`}
                    >
                      {estados.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.label}
                        </option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => guardarItem(item.id)}
                        disabled={guardandoId === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bosque-600 text-white text-xs hover:bg-bosque-700 disabled:opacity-60"
                        title="Guardar cambios"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {guardandoId === item.id ? 'Guardando' : 'Guardar'}
                      </button>

                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs hover:bg-red-100"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, highlight }: any) {
  return (
    <div className={`rounded-2xl p-5 border ${highlight ? 'bg-red-50 border-red-200' : 'bg-white border-micelio-200'}`}>
      <div className="text-xs text-tierra-600 uppercase tracking-wider mb-2">{label}</div>
      <div className="font-serif text-3xl text-tierra-900">{value}</div>
    </div>
  );
}
