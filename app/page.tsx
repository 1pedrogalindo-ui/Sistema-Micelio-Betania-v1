'use client';

import { useState, useEffect } from 'react';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Cronograma from '@/components/Cronograma';
import Proveedores from '@/components/Proveedores';
import Inventario from '@/components/Inventario';
import Registros from '@/components/Registros';
import Trazabilidad from '@/components/Trazabilidad';
import Costos from '@/components/Costos';
import AuthGate from '@/components/AuthGate';

export default function Home() {
  const [seccion, setSeccion] = useState('dashboard');
  const [montado, setMontado] = useState(false);

  useEffect(() => {
    setMontado(true);
  }, []);

  if (!montado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-micelio-50">
        <div className="text-micelio-700">Cargando sistema...</div>
      </div>
    );
  }

  return (
    <AuthGate>
      <div className="flex h-screen bg-micelio-50">
        <Sidebar seccion={seccion} setSeccion={setSeccion} />
        <main className="flex-1 overflow-y-auto">
          <div className="p-6 md:p-10 max-w-7xl mx-auto">
            {seccion === 'dashboard' && <Dashboard setSeccion={setSeccion} />}
            {seccion === 'cronograma' && <Cronograma />}
            {seccion === 'proveedores' && <Proveedores />}
            {seccion === 'inventario' && <Inventario />}
            {seccion === 'registros' && <Registros />}
            {seccion === 'trazabilidad' && <Trazabilidad />}
            {seccion === 'costos' && <Costos />}
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
