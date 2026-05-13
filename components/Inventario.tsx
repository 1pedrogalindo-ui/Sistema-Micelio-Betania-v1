'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { registrarAuditLog } from '@/lib/audit';
import { Save, Trash2, PlusCircle, X } from 'lucide-react';
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

const urgencias = [
  { id: 'critica', label: 'Crítica' },
  { id: 'alta', label: 'Alta' },
  { id: 'media', label: 'Media' },
];

function crearIdDesdeTexto(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 50) || `item-${Date.now()}`;
}

export default function Inventario() {
  const [items, setItems] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [nuevoItem, setNuevoItem] = useState({
    item: '',
    categoria: '',
    cantidad: 1,
    precioUnit: 0,
    urgencia: 'media',
    fechaLimite: '',
    estado: 'pendiente',
    notas: '',
  });

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

  const agregarItem = async () => {
    if (!nuevoItem.item.trim()) {
      alert('Escribe el nombre del item.');
      return;
    }

    if (!nuevoItem.categoria.trim()) {
      alert('Escribe la categoría.');
      return;
    }

    const baseId = crearIdDesdeTexto(nuevoItem.item);
    const id = items.some((i) => i.id === baseId) ? `${baseId}-${Date.now()}` : baseId;

    const itemPayload = {
      id,
      item: nuevoItem.item.trim(),
      categoria: nuevoItem.categoria.trim(),
      cantidad: Number(nuevoItem.cantidad || 0),
      precioUnit: Number(nuevoItem.precioUnit || 0),
      urgencia: nuevoItem.urgencia,
      fechaLimite: nuevoItem.fechaLimite || new Date().toISOString().slice(0, 10),
      estado: nuevoItem.estado,
      notas: nuevoItem.notas.trim(),
    };

    const nuevos = [itemPayload, ...items];
    guardarLocal(nuevos);

    const supabase = getSupabaseBrowserClient();

    if (supabase) {
      const { error } = await supabase.from('inventario').insert({
        id: itemPayload.id,
        item: itemPayload.item,
        categoria: itemPayload.categoria,
        cantidad: itemPayload.cantidad,
        precio_unit: itemPayload.precioUnit,
        urgencia: itemPayload.urgencia,
        fecha_limite: itemPayload.fechaLimite,
        estado: itemPayload.estado,
        notas: itemPayload.notas,
      });

      if (error) {
        console.error(error);
        alert('No se pudo guardar el nuevo item en Supabase. Quedó guardado localmente.');
      }
    }

    await registrarAuditLog({
      accion: 'crear',
      tabla: 'inventario',
      registroId: itemPayload.id,
      descripcion: `Nuevo item de inventario: ${itemPayload.item}`,
      valoresNuevos: {
        ...itemPayload,
        total: itemPayload.cantidad * itemPayload.precioUnit,
      },
    });

    setNuevoItem({
      item: '',
      categoria: '',
      cantidad: 1,
      precioUnit: 0,
      urgencia: 'media',
      fechaLimite: '',
      estado: 'pendiente',
      notas: '',
    });

    setMostrarNuevo(false);
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

  const categorias = ['todos', ...Array.from(new Set(items.map((i) => i.categoria).filter(Boolean)))];

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
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Compras & Inventario
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Inventario</h1>
          <p className="text-tierra-600">
            {items.length} items · {items.filter((i) => i.estado === 'pendiente').length} pendientes
          </p>
        </div>

        <button
          onClick={() => setMostrarNuevo(true)}
          className="inline-flex items-center gap-2 bg-bosque-600 hover:bg-bosque-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium"
        >
          <PlusCircle className="w-4 h-4" />
          Agregar item
        </button>
      </header>

      {mostrarNuevo && (
        <div className="bg-white border border-micelio-200 rounded-2xl p-5 shadow-card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-tierra-900">Nuevo item de inventario</h2>
            <button
              onClick={() => setMostrarNuevo(false)}
              className="p-2 rounded-lg hover:bg-micelio-50 text-tierra-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs uppercase tracking-wider text-tierra-600">Item</label>
              <input
                value={nuevoItem.item}
                onChange={(e) => setNuevoItem({ ...nuevoItem, item: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
                placeholder="Ej: Guantes nitrilo"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Categoría</label>
              <input
                value={nuevoItem.categoria}
                onChange={(e) => setNuevoItem({ ...nuevoItem, categoria: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
                placeholder="Ej: EPP"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Urgencia</label>
              <select
                value={nuevoItem.urgencia}
                onChange={(e) => setNuevoItem({ ...nuevoItem, urgencia: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
              >
                {urgencias.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Cantidad</label>
              <input
                type="number"
                min="0"
                step="1"
                value={nuevoItem.cantidad}
                onChange={(e) => setNuevoItem({ ...nuevoItem, cantidad: Number(e.target.value || 0) })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Precio unitario</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={nuevoItem.precioUnit}
                onChange={(e) => setNuevoItem({ ...nuevoItem, precioUnit: Number(e.target.value || 0) })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
              />
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Total</label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-micelio-50 border border-micelio-200 font-medium text-tierra-900">
                ${(Number(nuevoItem.cantidad || 0) * Number(nuevoItem.precioUnit || 0)).toFixed(2)}
              </div>
            </div>

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Deadline</label>
              <input
                type="date"
                value={nuevoItem.fechaLimite}
                onChange={(e) => setNuevoItem({ ...nuevoItem, fechaLimite: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs uppercase tracking-wider text-tierra-600">Notas</label>
              <input
                value={nuevoItem.notas}
                onChange={(e) => setNuevoItem({ ...nuevoItem, notas: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
                placeholder="Opcional"
              />
            </div>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={agregarItem}
              className="inline-flex items-center gap-2 bg-bosque-600 hover:bg-bosque-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium"
            >
              <Save className="w-4 h-4" />
              Guardar nuevo item
            </button>
          </div>
        </div>
      )}

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

      <div className="bg-white rounded-2xl border border-micelio-200 overflow-x-auto">
        <table className="w-full min-w-[1100px]">
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
                        <option key={e.id} value={e.id}>{e.label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => guardarItem(item.id)}
                        disabled={guardandoId === item.id}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-bosque-600 text-white text-xs hover:bg-bosque-700 disabled:opacity-60"
                      >
                        <Save className="w-3.5 h-3.5" />
                        {guardandoId === item.id ? 'Guardando' : 'Guardar'}
                      </button>

                      <button
                        onClick={() => eliminarItem(item.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-50 text-red-700 border border-red-200 text-xs hover:bg-red-100"
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
