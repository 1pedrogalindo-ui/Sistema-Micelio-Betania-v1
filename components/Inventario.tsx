'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Save, Trash2, PlusCircle, X, RefreshCw } from 'lucide-react';
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
    .slice(0, 50);
}

export default function Inventario() {
  const [items, setItems] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [filtroUrgencia, setFiltroUrgencia] = useState('todos');
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);

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
    cargarInventario();
  }, []);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const mapDbToUi = (i: any) => ({
    id: i.id,
    item: i.item,
    categoria: i.categoria || '',
    cantidad: Number(i.cantidad || 0),
    precioUnit: Number(i.precio_unit || 0),
    urgencia: i.urgencia || 'media',
    fechaLimite: i.fecha_limite || '',
    estado: i.estado || 'pendiente',
    notas: i.notas || '',
    createdAt: i.created_at,
    updatedAt: i.updated_at,
  });

  const cargarInventario = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setItems(dataAPI.getInventario());
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('inventario')
      .select('*')
      .order('categoria', { ascending: true })
      .order('item', { ascending: true });

    if (error) {
      console.error(error);
      mostrarMensaje(`No se pudo cargar inventario: ${error.message}`);
      setItems(dataAPI.getInventario());
      setCargando(false);
      return;
    }

    const ui = (data || []).map(mapDbToUi);
    setItems(ui);
    dataAPI.setInventario(ui);
    setCargando(false);
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

    setItems(nuevos);
  };

  const agregarItem = async () => {
    if (!nuevoItem.item.trim()) {
      mostrarMensaje('Escribe el nombre del item.');
      return;
    }

    if (!nuevoItem.categoria.trim()) {
      mostrarMensaje('Escribe la categoría.');
      return;
    }

    const existe = items.some(
      (i) => i.item?.trim().toLowerCase() === nuevoItem.item.trim().toLowerCase()
    );

    if (existe) {
      mostrarMensaje(`El item ${nuevoItem.item} ya está registrado en inventario.`);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      return;
    }

    const { error } = await supabase.rpc('crear_inventario_tx', {
      p_id: crearIdDesdeTexto(nuevoItem.item),
      p_item: nuevoItem.item.trim(),
      p_categoria: nuevoItem.categoria.trim(),
      p_cantidad: Number(nuevoItem.cantidad || 0),
      p_precio_unit: Number(nuevoItem.precioUnit || 0),
      p_urgencia: nuevoItem.urgencia,
      p_fecha_limite: nuevoItem.fechaLimite || null,
      p_estado: nuevoItem.estado,
      p_notas: nuevoItem.notas.trim() || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje(`Item ${nuevoItem.item} registrado correctamente.`);

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
    await cargarInventario();
  };

  const guardarItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    if (!item.item?.trim()) {
      mostrarMensaje('El item no puede estar vacío.');
      return;
    }

    setGuardandoId(id);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      setGuardandoId(null);
      return;
    }

    const { error } = await supabase.rpc('actualizar_inventario_tx', {
      p_id: id,
      p_item: item.item.trim(),
      p_categoria: item.categoria || null,
      p_cantidad: Number(item.cantidad || 0),
      p_precio_unit: Number(item.precioUnit || 0),
      p_urgencia: item.urgencia || 'media',
      p_fecha_limite: item.fechaLimite || null,
      p_estado: item.estado || 'pendiente',
      p_notas: item.notas || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setGuardandoId(null);
      return;
    }

    mostrarMensaje(`Item ${item.item} actualizado correctamente.`);
    await cargarInventario();
    setGuardandoId(null);
  };

  const eliminarItem = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    const confirmar = window.confirm(`¿Eliminar del inventario: ${item.item}?`);
    if (!confirmar) return;

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado.');
      return;
    }

    const { error } = await supabase.rpc('eliminar_inventario_tx', {
      p_id: id,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje(`Item ${item.item} eliminado correctamente.`);
    await cargarInventario();
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
            {items.length} items · {items.filter((i) => i.estado === 'pendiente').length} pendientes · Guardado en Supabase
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={cargarInventario}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Refrescar
          </button>

          <button
            onClick={() => setMostrarNuevo(true)}
            className="inline-flex items-center gap-2 bg-bosque-600 hover:bg-bosque-700 text-white rounded-xl px-4 py-2.5 text-sm font-medium"
          >
            <PlusCircle className="w-4 h-4" />
            Agregar item
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-micelio-200 bg-micelio-50 px-4 py-3 text-sm text-tierra-800">
          {mensaje}
        </div>
      )}

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
            <Input label="Item" value={nuevoItem.item} onChange={(v: string) => setNuevoItem({ ...nuevoItem, item: v })} placeholder="Ej: Guantes nitrilo" className="md:col-span-2" />
            <Input label="Categoría" value={nuevoItem.categoria} onChange={(v: string) => setNuevoItem({ ...nuevoItem, categoria: v })} placeholder="Ej: EPP" />

            <Select label="Urgencia" value={nuevoItem.urgencia} onChange={(v: string) => setNuevoItem({ ...nuevoItem, urgencia: v })} options={urgencias} />

            <Input type="number" label="Cantidad" value={nuevoItem.cantidad} onChange={(v: string) => setNuevoItem({ ...nuevoItem, cantidad: Number(v || 0) })} />
            <Input type="number" step="0.01" label="Precio unitario" value={nuevoItem.precioUnit} onChange={(v: string) => setNuevoItem({ ...nuevoItem, precioUnit: Number(v || 0) })} />

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Total</label>
              <div className="mt-1 px-3 py-2 rounded-lg bg-micelio-50 border border-micelio-200 font-medium text-tierra-900">
                ${(Number(nuevoItem.cantidad || 0) * Number(nuevoItem.precioUnit || 0)).toFixed(2)}
              </div>
            </div>

            <Input type="date" label="Deadline" value={nuevoItem.fechaLimite} onChange={(v: string) => setNuevoItem({ ...nuevoItem, fechaLimite: v })} />
            <Input label="Notas" value={nuevoItem.notas} onChange={(v: string) => setNuevoItem({ ...nuevoItem, notas: v })} placeholder="Opcional" className="md:col-span-4" />
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
        <table className="w-full min-w-[1150px]">
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
                  <td className="p-4 text-sm text-tierra-900 font-medium">
                    <input
                      value={item.item}
                      onChange={(e) => actualizarCampo(item.id, 'item', e.target.value)}
                      className="w-52 px-2 py-1.5 rounded-lg border border-micelio-200 bg-white"
                    />
                  </td>

                  <td className="p-4 text-sm text-tierra-600">
                    <input
                      value={item.categoria}
                      onChange={(e) => actualizarCampo(item.id, 'categoria', e.target.value)}
                      className="w-32 px-2 py-1.5 rounded-lg border border-micelio-200 bg-white"
                    />
                  </td>

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
                    <select
                      value={item.urgencia}
                      onChange={(e) => actualizarCampo(item.id, 'urgencia', e.target.value)}
                      className={`text-xs px-2 py-1 rounded-full border ${urgenciaColor[item.urgencia] || urgenciaColor.media}`}
                    >
                      {urgencias.map((u) => (
                        <option key={u.id} value={u.id}>{u.label}</option>
                      ))}
                    </select>
                  </td>

                  <td className="p-4 text-xs text-center text-tierra-600">
                    <input
                      type="date"
                      value={item.fechaLimite || ''}
                      onChange={(e) => actualizarCampo(item.id, 'fechaLimite', e.target.value)}
                      className="px-2 py-1.5 rounded-lg border border-micelio-200 bg-white"
                    />
                    {item.fechaLimite && (
                      <div className="mt-1">
                        {format(parseISO(item.fechaLimite), "d MMM", { locale: es })}
                      </div>
                    )}
                  </td>

                  <td className="p-4 text-center">
                    <select
                      value={item.estado}
                      onChange={(e) => actualizarCampo(item.id, 'estado', e.target.value)}
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

            {itemsFiltrados.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-tierra-500">
                  No hay items registrados en inventario.
                </td>
              </tr>
            )}
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

function Input({ label, value, onChange, type = 'text', placeholder = '', step, className = '' }: any) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
      >
        {options.map((o: any) => (
          <option key={o.id} value={o.id}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}
