'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Phone,
  Mail,
  Globe,
  MapPin,
  Plus,
  Edit2,
  Save,
  X,
  RefreshCw,
} from 'lucide-react';

const categorias = ['todos', 'spawn', 'compost', 'equipamiento', 'higiene', 'empaque'];

const estados = [
  { id: 'por-contactar', label: 'Por contactar', color: 'bg-red-100 text-red-700' },
  { id: 'contactado', label: 'Contactado', color: 'bg-amber-100 text-amber-700' },
  { id: 'cotizado', label: 'Cotizado', color: 'bg-blue-100 text-blue-700' },
  { id: 'confirmado', label: 'Confirmado', color: 'bg-green-100 text-green-700' },
  { id: 'descartado', label: 'Descartado', color: 'bg-tierra-200 text-tierra-700' },
  { id: 'por-pedir', label: 'Por pedir', color: 'bg-amber-100 text-amber-700' },
  { id: 'por-cotizar', label: 'Por cotizar', color: 'bg-amber-100 text-amber-700' },
  { id: 'disponible', label: 'Disponible', color: 'bg-green-100 text-green-700' },
];

function slug(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [mostrarNuevo, setMostrarNuevo] = useState(false);

  const [nuevoProveedor, setNuevoProveedor] = useState({
    nombre: '',
    categoria: 'equipamiento',
    ubicacion: '',
    telefono: '',
    email: '',
    web: '',
    precio: '',
    notas: '',
    estado: 'por-contactar',
    prioridad: 'media',
  });

  useEffect(() => {
    cargarProveedores();
  }, []);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const cargarProveedores = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setProveedores(dataAPI.getProveedores());
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('proveedores')
      .select('*')
      .order('categoria', { ascending: true })
      .order('nombre', { ascending: true });

    if (error) {
      console.error(error);
      mostrarMensaje(`No se pudieron cargar proveedores: ${error.message}`);
      setProveedores(dataAPI.getProveedores());
      setCargando(false);
      return;
    }

    setProveedores(data || []);
    dataAPI.setProveedores(data || []);
    setCargando(false);
  };

  const proveedoresFiltrados = proveedores.filter(
    (p) => filtroCategoria === 'todos' || p.categoria === filtroCategoria
  );

  const iniciarEdicion = (p: any) => {
    setEditando(p.id);
    setFormData({ ...p });
  };

  const crearProveedor = async () => {
    if (!nuevoProveedor.nombre.trim()) {
      mostrarMensaje('Debes ingresar el nombre del proveedor.');
      return;
    }

    const existe = proveedores.some(
      (p) => p.nombre?.trim().toLowerCase() === nuevoProveedor.nombre.trim().toLowerCase()
    );

    if (existe) {
      mostrarMensaje(`El proveedor ${nuevoProveedor.nombre} ya está registrado.`);
      return;
    }

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      return;
    }

    const { error } = await supabase.rpc('crear_proveedor_tx', {
      p_id: slug(nuevoProveedor.nombre),
      p_nombre: nuevoProveedor.nombre.trim(),
      p_categoria: nuevoProveedor.categoria,
      p_ubicacion: nuevoProveedor.ubicacion.trim() || null,
      p_telefono: nuevoProveedor.telefono.trim() || null,
      p_email: nuevoProveedor.email.trim() || null,
      p_web: nuevoProveedor.web.trim() || null,
      p_precio: nuevoProveedor.precio.trim() || null,
      p_notas: nuevoProveedor.notas.trim() || null,
      p_estado: nuevoProveedor.estado,
      p_prioridad: nuevoProveedor.prioridad,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje(`Proveedor ${nuevoProveedor.nombre} registrado correctamente.`);

    setNuevoProveedor({
      nombre: '',
      categoria: 'equipamiento',
      ubicacion: '',
      telefono: '',
      email: '',
      web: '',
      precio: '',
      notas: '',
      estado: 'por-contactar',
      prioridad: 'media',
    });

    setMostrarNuevo(false);
    await cargarProveedores();
  };

  const guardarCambios = async () => {
    if (!editando) return;

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado. No se puede guardar en producción.');
      return;
    }

    const { error } = await supabase.rpc('actualizar_proveedor_tx', {
      p_id: editando,
      p_nombre: formData.nombre || '',
      p_categoria: formData.categoria || '',
      p_ubicacion: formData.ubicacion || null,
      p_telefono: formData.telefono || null,
      p_email: formData.email || null,
      p_web: formData.web || null,
      p_precio: formData.precio || null,
      p_notas: formData.notas || null,
      p_estado: formData.estado || 'por-contactar',
      p_prioridad: formData.prioridad || 'media',
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje('Proveedor actualizado correctamente.');
    setEditando(null);
    await cargarProveedores();
  };

  const cambiarEstado = async (id: string, nuevoEstado: string) => {
    const proveedor = proveedores.find((p) => p.id === id);
    if (!proveedor) return;

    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      mostrarMensaje('Supabase no está configurado.');
      return;
    }

    const actualizado = { ...proveedor, estado: nuevoEstado };

    const { error } = await supabase.rpc('actualizar_proveedor_tx', {
      p_id: id,
      p_nombre: actualizado.nombre || '',
      p_categoria: actualizado.categoria || '',
      p_ubicacion: actualizado.ubicacion || null,
      p_telefono: actualizado.telefono || null,
      p_email: actualizado.email || null,
      p_web: actualizado.web || null,
      p_precio: actualizado.precio || null,
      p_notas: actualizado.notas || null,
      p_estado: nuevoEstado,
      p_prioridad: actualizado.prioridad || 'media',
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    mostrarMensaje('Estado del proveedor actualizado.');
    await cargarProveedores();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            CRM de Proveedores
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Proveedores</h1>
          <p className="text-tierra-600">Quito & Valle de los Chillos · Guardado en Supabase</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={cargarProveedores}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Refrescar
          </button>

          <button
            onClick={() => setMostrarNuevo(true)}
            className="inline-flex items-center gap-2 bg-bosque-600 hover:bg-bosque-700 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Nuevo proveedor
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-micelio-200 bg-micelio-50 px-4 py-3 text-sm text-tierra-800">
          {mensaje}
        </div>
      )}

      {mostrarNuevo && (
        <div className="bg-white rounded-2xl border border-micelio-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-xl text-tierra-900">Nuevo proveedor</h2>
            <button
              onClick={() => setMostrarNuevo(false)}
              className="p-2 rounded-lg hover:bg-micelio-50 text-tierra-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-3 gap-3">
            <Input label="Nombre" value={nuevoProveedor.nombre} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, nombre: v })} />
            <Select label="Categoría" value={nuevoProveedor.categoria} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, categoria: v })} options={categorias.filter((c) => c !== 'todos')} />
            <Input label="Ubicación" value={nuevoProveedor.ubicacion} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, ubicacion: v })} />
            <Input label="Teléfono" value={nuevoProveedor.telefono} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, telefono: v })} />
            <Input label="Email" value={nuevoProveedor.email} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, email: v })} />
            <Input label="Web" value={nuevoProveedor.web} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, web: v })} />
            <Input label="Precio" value={nuevoProveedor.precio} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, precio: v })} />
            <Select label="Estado" value={nuevoProveedor.estado} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, estado: v })} options={estados.map((e) => e.id)} />
            <Input label="Prioridad" value={nuevoProveedor.prioridad} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, prioridad: v })} />
            <div className="md:col-span-3">
              <Input label="Notas" value={nuevoProveedor.notas} onChange={(v: string) => setNuevoProveedor({ ...nuevoProveedor, notas: v })} />
            </div>
          </div>

          <button
            onClick={crearProveedor}
            className="mt-4 inline-flex items-center gap-2 bg-bosque-600 hover:bg-bosque-700 text-white rounded-xl px-4 py-2 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            Guardar proveedor
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-4 py-2 rounded-full text-sm transition capitalize ${
              filtroCategoria === cat
                ? 'bg-bosque-600 text-white'
                : 'bg-white text-tierra-700 border border-micelio-200 hover:border-micelio-400'
            }`}
          >
            {cat}{' '}
            {filtroCategoria !== cat &&
              `(${proveedores.filter((p) => cat === 'todos' || p.categoria === cat).length})`}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {proveedoresFiltrados.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-micelio-200 p-5">
            {editando === p.id ? (
              <div className="space-y-3">
                <Input label="Nombre" value={formData.nombre || ''} onChange={(v: string) => setFormData({ ...formData, nombre: v })} />
                <Select label="Categoría" value={formData.categoria || ''} onChange={(v: string) => setFormData({ ...formData, categoria: v })} options={categorias.filter((c) => c !== 'todos')} />
                <Input label="Ubicación" value={formData.ubicacion || ''} onChange={(v: string) => setFormData({ ...formData, ubicacion: v })} />
                <Input label="Teléfono" value={formData.telefono || ''} onChange={(v: string) => setFormData({ ...formData, telefono: v })} />
                <Input label="Email" value={formData.email || ''} onChange={(v: string) => setFormData({ ...formData, email: v })} />
                <Input label="Web" value={formData.web || ''} onChange={(v: string) => setFormData({ ...formData, web: v })} />
                <Input label="Precio" value={formData.precio || ''} onChange={(v: string) => setFormData({ ...formData, precio: v })} />

                <textarea
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.notas || ''}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Notas"
                  rows={3}
                />

                <div className="flex gap-2">
                  <button
                    onClick={guardarCambios}
                    className="flex items-center gap-1 px-3 py-1.5 bg-bosque-600 text-white text-sm rounded-lg hover:bg-bosque-700"
                  >
                    <Save className="w-3 h-3" /> Guardar
                  </button>
                  <button
                    onClick={() => setEditando(null)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-tierra-100 text-tierra-700 text-sm rounded-lg hover:bg-tierra-200"
                  >
                    <X className="w-3 h-3" /> Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="text-xs text-bosque-700 uppercase tracking-wider mb-1">
                      {p.categoria}
                    </div>
                    <h3 className="font-serif text-lg text-tierra-900">{p.nombre}</h3>
                  </div>

                  <button
                    onClick={() => iniciarEdicion(p)}
                    className="p-1.5 text-tierra-500 hover:text-tierra-700 hover:bg-micelio-50 rounded"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                </div>

                <div className="space-y-1.5 text-sm text-tierra-700 mb-3">
                  {p.ubicacion && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 text-tierra-500" />
                      <span>{p.ubicacion}</span>
                    </div>
                  )}

                  {p.telefono && p.telefono !== 'Pendiente' && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 text-tierra-500" />
                      <span>{p.telefono}</span>
                    </div>
                  )}

                  {p.email && p.email !== 'Pendiente' && p.email !== 'N/A' && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3 h-3 text-tierra-500" />
                      <span className="truncate">{p.email}</span>
                    </div>
                  )}

                  {p.web && p.web !== 'Pendiente' && (
                    <div className="flex items-center gap-2">
                      <Globe className="w-3 h-3 text-tierra-500" />
                      <a href={p.web} target="_blank" rel="noopener noreferrer" className="text-bosque-700 hover:underline truncate">
                        {p.web.replace(/https?:\/\//, '')}
                      </a>
                    </div>
                  )}
                </div>

                <div className="text-xs text-tierra-600 mb-3 italic">{p.notas}</div>

                <div className="flex items-center justify-between pt-3 border-t border-micelio-100">
                  <div className="text-xs">
                    <span className="text-tierra-500">Precio: </span>
                    <span className="font-medium text-tierra-900">{p.precio}</span>
                  </div>

                  <select
                    value={p.estado}
                    onChange={(e) => cambiarEstado(p.id, e.target.value)}
                    className="text-xs px-2 py-1 rounded-full border border-micelio-200 bg-white"
                  >
                    {estados.map((e) => (
                      <option key={e.id} value={e.id}>{e.label}</option>
                    ))}
                  </select>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text' }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200 text-sm"
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
        className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200 text-sm"
      >
        {options.map((o: string) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
    </div>
  );
}
