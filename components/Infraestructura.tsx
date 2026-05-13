'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Building2, Layers3, PlusCircle, RefreshCw, QrCode } from 'lucide-react';

export default function Infraestructura() {
  const [estanterias, setEstanterias] = useState<any[]>([]);
  const [bandejas, setBandejas] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const [nuevaEstanteria, setNuevaEstanteria] = useState({
    codigo: '',
    nombre: '',
    ubicacion: 'Cuarto producción 10m²',
    niveles: 3,
    capacidad_bandejas: 20,
    capacidad_kg: 200,
    notas: '',
  });

  const [nuevaBandeja, setNuevaBandeja] = useState({
    codigo: '',
    estanteria_id: '',
    nivel: 1,
    posicion: 1,
    ciclo_id: 'C1',
    lote: 'MB-AB-001',
    profundidad_cm: 20,
    peso_compost_kg: 18,
    fecha_carga: new Date().toISOString().slice(0, 10),
    estado: 'activa',
    notas: '',
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setCargando(true);
    const supabase = getSupabaseBrowserClient();

    if (!supabase) {
      setCargando(false);
      return;
    }

    const [{ data: est }, { data: ban }] = await Promise.all([
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
      supabase.from('bandejas').select('*, estanterias(codigo,nombre)').order('codigo', { ascending: true }),
    ]);

    setEstanterias(est || []);
    setBandejas(ban || []);
    setCargando(false);
  };

  const crearEstanteria = async () => {
    if (!nuevaEstanteria.codigo || !nuevaEstanteria.nombre) {
      alert('Código y nombre son obligatorios.');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.rpc('crear_estanteria_tx', {
      p_codigo: nuevaEstanteria.codigo,
      p_nombre: nuevaEstanteria.nombre,
      p_ubicacion: nuevaEstanteria.ubicacion,
      p_niveles: Number(nuevaEstanteria.niveles || 3),
      p_capacidad_bandejas: Number(nuevaEstanteria.capacidad_bandejas || 0),
      p_capacidad_kg: Number(nuevaEstanteria.capacidad_kg || 0),
      p_notas: nuevaEstanteria.notas || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNuevaEstanteria({
      codigo: '',
      nombre: '',
      ubicacion: 'Cuarto producción 10m²',
      niveles: 3,
      capacidad_bandejas: 20,
      capacidad_kg: 200,
      notas: '',
    });

    await cargarDatos();
  };

  const crearBandeja = async () => {
    if (!nuevaBandeja.codigo || !nuevaBandeja.estanteria_id) {
      alert('Código de bandeja y estantería son obligatorios.');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.rpc('crear_bandeja_tx', {
      p_codigo: nuevaBandeja.codigo,
      p_estanteria_id: nuevaBandeja.estanteria_id,
      p_nivel: Number(nuevaBandeja.nivel || 1),
      p_posicion: Number(nuevaBandeja.posicion || 1),
      p_ciclo_id: nuevaBandeja.ciclo_id,
      p_lote: nuevaBandeja.lote,
      p_profundidad_cm: Number(nuevaBandeja.profundidad_cm || 20),
      p_peso_compost_kg: Number(nuevaBandeja.peso_compost_kg || 0),
      p_fecha_carga: nuevaBandeja.fecha_carga,
      p_estado: nuevaBandeja.estado,
      p_notas: nuevaBandeja.notas || null,
    });

    if (error) {
      alert(error.message);
      return;
    }

    setNuevaBandeja({
      ...nuevaBandeja,
      codigo: '',
      posicion: Number(nuevaBandeja.posicion || 1) + 1,
      notas: '',
    });

    await cargarDatos();
  };

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Infraestructura productiva
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Estanterías & Bandejas</h1>
          <p className="text-tierra-600">
            Registro operativo para automatizar cosechas, QR, IoT y trazabilidad por bandeja.
          </p>
        </div>

        <button
          onClick={cargarDatos}
          disabled={cargando}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm"
        >
          <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
          Refrescar
        </button>
      </header>

      <div className="grid md:grid-cols-3 gap-4">
        <KPI label="Estanterías" value={estanterias.length} icon={Building2} />
        <KPI label="Bandejas" value={bandejas.length} icon={Layers3} />
        <KPI
          label="Compost cargado"
          value={`${bandejas.reduce((s, b) => s + Number(b.peso_compost_kg || 0), 0).toFixed(1)} kg`}
          icon={QrCode}
        />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="mb-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Building2 className="w-5 h-5 text-bosque-700" />
            <h2 className="font-serif text-2xl text-tierra-900">Nueva estantería</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Código" value={nuevaEstanteria.codigo} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, codigo: v })} placeholder="E4" />
            <Input label="Nombre" value={nuevaEstanteria.nombre} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, nombre: v })} placeholder="Estantería 4" />
            <Input label="Ubicación" value={nuevaEstanteria.ubicacion} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, ubicacion: v })} />
            <Input type="number" label="Niveles" value={nuevaEstanteria.niveles} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, niveles: Number(v) })} />
            <Input type="number" label="Capacidad bandejas" value={nuevaEstanteria.capacidad_bandejas} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, capacidad_bandejas: Number(v) })} />
            <Input type="number" label="Capacidad kg" value={nuevaEstanteria.capacidad_kg} onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, capacidad_kg: Number(v) })} />
          </div>

          <button onClick={crearEstanteria} className="mt-4 mb-button-primary w-full inline-flex items-center justify-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Crear estantería
          </button>
        </div>

        <div className="mb-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Layers3 className="w-5 h-5 text-bosque-700" />
            <h2 className="font-serif text-2xl text-tierra-900">Nueva bandeja</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input label="Código" value={nuevaBandeja.codigo} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, codigo: v })} placeholder="B-001" />

            <div>
              <label className="text-xs uppercase tracking-wider text-tierra-600">Estantería</label>
              <select
                value={nuevaBandeja.estanteria_id}
                onChange={(e) => setNuevaBandeja({ ...nuevaBandeja, estanteria_id: e.target.value })}
                className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
              >
                <option value="">Seleccionar</option>
                {estanterias.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.codigo} · {e.nombre}
                  </option>
                ))}
              </select>
            </div>

            <Input type="number" label="Nivel" value={nuevaBandeja.nivel} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, nivel: Number(v) })} />
            <Input type="number" label="Posición" value={nuevaBandeja.posicion} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, posicion: Number(v) })} />
            <Input label="Ciclo" value={nuevaBandeja.ciclo_id} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, ciclo_id: v })} />
            <Input label="Lote" value={nuevaBandeja.lote} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, lote: v })} />
            <Input type="number" label="Profundidad cm" value={nuevaBandeja.profundidad_cm} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, profundidad_cm: Number(v) })} />
            <Input type="number" label="Compost kg" value={nuevaBandeja.peso_compost_kg} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, peso_compost_kg: Number(v) })} />
            <Input type="date" label="Fecha carga" value={nuevaBandeja.fecha_carga} onChange={(v: string) => setNuevaBandeja({ ...nuevaBandeja, fecha_carga: v })} />
          </div>

          <button onClick={crearBandeja} className="mt-4 mb-button-primary w-full inline-flex items-center justify-center gap-2">
            <PlusCircle className="w-4 h-4" />
            Crear bandeja
          </button>
        </div>
      </div>

      <div className="mb-card p-6 overflow-x-auto">
        <h2 className="font-serif text-2xl text-tierra-900 mb-4">Bandejas registradas</h2>

        <table className="w-full min-w-[900px]">
          <thead className="bg-micelio-50 border-b border-micelio-200">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Estantería</th>
              <th className="text-center p-3">Nivel</th>
              <th className="text-center p-3">Posición</th>
              <th className="text-left p-3">Ciclo</th>
              <th className="text-left p-3">Lote</th>
              <th className="text-right p-3">Compost</th>
              <th className="text-center p-3">Estado</th>
              <th className="text-left p-3">QR</th>
            </tr>
          </thead>
          <tbody>
            {bandejas.map((b) => (
              <tr key={b.id} className="border-b border-micelio-100">
                <td className="p-3 font-medium text-tierra-900">{b.codigo || b.id}</td>
                <td className="p-3 text-tierra-700">{b.estanterias?.codigo || b.estanteria_id || '—'}</td>
                <td className="p-3 text-center">{b.nivel || '—'}</td>
                <td className="p-3 text-center">{b.posicion || '—'}</td>
                <td className="p-3">{b.ciclo_id || '—'}</td>
                <td className="p-3">{b.lote || '—'}</td>
                <td className="p-3 text-right">{Number(b.peso_compost_kg || 0).toFixed(1)} kg</td>
                <td className="p-3 text-center">{b.estado}</td>
                <td className="p-3">
                  {b.qr_url ? (
                    <a href={b.qr_url} target="_blank" className="text-bosque-700 underline text-xs">
                      Ver QR
                    </a>
                  ) : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function KPI({ label, value, icon: Icon }: any) {
  return (
    <div className="mb-card p-5">
      <div className="flex items-center gap-2 text-bosque-700 mb-2">
        <Icon className="w-4 h-4" />
        <span className="text-xs uppercase tracking-wider">{label}</span>
      </div>
      <div className="font-serif text-3xl text-tierra-900">{value}</div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '' }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-lg border border-micelio-200"
      />
    </div>
  );
}
