'use client';

import { useEffect, useState } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { Building2, PlusCircle, RefreshCw } from 'lucide-react';

export default function Infraestructura() {
  const [estanterias, setEstanterias] = useState<any[]>([]);
  const [cargando, setCargando] = useState(false);

  const [nuevaEstanteria, setNuevaEstanteria] = useState({
    codigo: '',
    nombre: '',
    ubicacion: 'Cuarto producción 10m²',
    niveles: 3,
    capacidad_bandejas: 0,
    capacidad_kg: 200,
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

    const { data, error } = await supabase
      .from('estanterias')
      .select('*')
      .order('codigo', { ascending: true });

    if (error) {
      console.error(error);
      alert('No se pudieron cargar las estanterías.');
      setCargando(false);
      return;
    }

    setEstanterias(data || []);
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
      p_capacidad_bandejas: 0,
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
      capacidad_bandejas: 0,
      capacidad_kg: 200,
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
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">
            Estanterías
          </h1>
          <p className="text-tierra-600">
            Registro de estanterías del cuarto de producción. Las cosechas se registran por lote, vuelta y estante.
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

      <div className="grid md:grid-cols-2 gap-4">
        <KPI label="Estanterías" value={estanterias.length} icon={Building2} />
        <KPI
          label="Capacidad estructural"
          value={`${estanterias.reduce((s, e) => s + Number(e.capacidad_kg || 0), 0).toFixed(0)} kg`}
          icon={Building2}
        />
      </div>

      <div className="mb-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="w-5 h-5 text-bosque-700" />
          <h2 className="font-serif text-2xl text-tierra-900">Nueva estantería</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-3">
          <Input
            label="Código"
            value={nuevaEstanteria.codigo}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, codigo: v })}
            placeholder="E1"
          />

          <Input
            label="Nombre"
            value={nuevaEstanteria.nombre}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, nombre: v })}
            placeholder="Estantería 1"
          />

          <Input
            label="Ubicación"
            value={nuevaEstanteria.ubicacion}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, ubicacion: v })}
          />

          <Input
            type="number"
            label="Niveles"
            value={nuevaEstanteria.niveles}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, niveles: Number(v) })}
          />

          <Input
            type="number"
            label="Capacidad kg"
            value={nuevaEstanteria.capacidad_kg}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, capacidad_kg: Number(v) })}
          />

          <Input
            label="Notas"
            value={nuevaEstanteria.notas}
            onChange={(v: string) => setNuevaEstanteria({ ...nuevaEstanteria, notas: v })}
          />
        </div>

        <button
          onClick={crearEstanteria}
          className="mt-4 mb-button-primary inline-flex items-center justify-center gap-2"
        >
          <PlusCircle className="w-4 h-4" />
          Crear estantería
        </button>
      </div>

      <div className="mb-card p-6 overflow-x-auto">
        <h2 className="font-serif text-2xl text-tierra-900 mb-4">
          Estanterías registradas
        </h2>

        <table className="w-full min-w-[760px]">
          <thead className="bg-micelio-50 border-b border-micelio-200">
            <tr className="text-xs uppercase tracking-wider text-tierra-600">
              <th className="text-left p-3">Código</th>
              <th className="text-left p-3">Nombre</th>
              <th className="text-left p-3">Ubicación</th>
              <th className="text-center p-3">Niveles</th>
              <th className="text-right p-3">Capacidad kg</th>
              <th className="text-center p-3">Estado</th>
            </tr>
          </thead>

          <tbody>
            {estanterias.map((e) => (
              <tr key={e.id} className="border-b border-micelio-100">
                <td className="p-3 font-medium text-tierra-900">{e.codigo}</td>
                <td className="p-3 text-tierra-700">{e.nombre}</td>
                <td className="p-3 text-tierra-700">{e.ubicacion || '—'}</td>
                <td className="p-3 text-center">{e.niveles || '—'}</td>
                <td className="p-3 text-right">{Number(e.capacidad_kg || 0).toFixed(0)} kg</td>
                <td className="p-3 text-center">{e.estado || 'activa'}</td>
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
