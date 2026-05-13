'use client';

import { useState, useEffect } from 'react';
import { dataAPI } from '@/lib/storage';
import { Phone, Mail, Globe, MapPin, Plus, Edit2, Save, X } from 'lucide-react';

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

export default function Proveedores() {
  const [proveedores, setProveedores] = useState<any[]>([]);
  const [filtroCategoria, setFiltroCategoria] = useState('todos');
  const [editando, setEditando] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});

  useEffect(() => {
    setProveedores(dataAPI.getProveedores());
  }, []);

  const proveedoresFiltrados = proveedores.filter(
    (p) => filtroCategoria === 'todos' || p.categoria === filtroCategoria
  );

  const iniciarEdicion = (p: any) => {
    setEditando(p.id);
    setFormData({ ...p });
  };

  const guardarCambios = () => {
    const nuevos = proveedores.map((p) => (p.id === editando ? formData : p));
    setProveedores(nuevos);
    dataAPI.setProveedores(nuevos);
    setEditando(null);
  };

  const cambiarEstado = (id: string, nuevoEstado: string) => {
    const nuevos = proveedores.map((p) =>
      p.id === id ? { ...p, estado: nuevoEstado } : p
    );
    setProveedores(nuevos);
    dataAPI.setProveedores(nuevos);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-micelio-700 mb-2">
            CRM de Proveedores
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Proveedores</h1>
          <p className="text-tierra-600">Quito & Valle de los Chillos</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-tierra-500 uppercase tracking-wider mb-1">
            Total proveedores
          </div>
          <div className="font-serif text-3xl text-tierra-900">{proveedores.length}</div>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        {categorias.map((cat) => (
          <button
            key={cat}
            onClick={() => setFiltroCategoria(cat)}
            className={`px-4 py-2 rounded-full text-sm transition capitalize ${
              filtroCategoria === cat
                ? 'bg-micelio-600 text-white'
                : 'bg-white text-tierra-700 border border-micelio-200 hover:border-micelio-400'
            }`}
          >
            {cat} {filtroCategoria !== cat && `(${proveedores.filter((p) => cat === 'todos' || p.categoria === cat).length})`}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {proveedoresFiltrados.map((p) => (
          <div key={p.id} className="bg-white rounded-2xl border border-micelio-200 p-5">
            {editando === p.id ? (
              <div className="space-y-3">
                <input
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Nombre"
                />
                <input
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.telefono}
                  onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                  placeholder="Teléfono"
                />
                <input
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Email"
                />
                <input
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.precio}
                  onChange={(e) => setFormData({ ...formData, precio: e.target.value })}
                  placeholder="Precio"
                />
                <textarea
                  className="w-full px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                  value={formData.notas}
                  onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
                  placeholder="Notas"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={guardarCambios}
                    className="flex items-center gap-1 px-3 py-1.5 bg-micelio-600 text-white text-sm rounded-lg hover:bg-micelio-700"
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
                    <div className="text-xs text-micelio-700 uppercase tracking-wider mb-1">
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
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-tierra-500" />
                    <span>{p.ubicacion}</span>
                  </div>
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
                      <a href={p.web} target="_blank" rel="noopener noreferrer" className="text-micelio-700 hover:underline truncate">
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
