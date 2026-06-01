'use client';

import { useEffect, useState } from 'react';

import AuthGate from '@/components/AuthGate';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import Especies from '@/components/Especies';
import Cronograma from '@/components/Cronograma';
import Proveedores from '@/components/Proveedores';
import Inventario from '@/components/Inventario';
import Registros from '@/components/Registros';
import Trazabilidad from '@/components/Trazabilidad';
import Infraestructura from '@/components/Infraestructura';
import Costos from '@/components/Costos';
import Integraciones from '@/components/Integraciones';
import Inteligencia from '@/components/Inteligencia';
import Inversionistas from '@/components/Inversionistas';
import Reportes from '@/components/Reportes';

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
            {seccion === 'dashboard' && <Dashboard setSeccion={setSeccion} 
          {seccion === 'especies' && <Especies />}/>}
            {seccion === 'cronograma' && <Cronograma />}
            {seccion === 'proveedores' && <Proveedores />}
            {seccion === 'inventario' && <Inventario />}
            {seccion === 'registros' && <Registros />}
            {seccion === 'trazabilidad' && <Trazabilidad />}
            {seccion === 'infraestructura' && <Infraestructura />}
            {seccion === 'costos' && <Costos />}
            {seccion === 'integraciones' && <Integraciones />}
            {seccion === 'inteligencia' && <Inteligencia />}
            {seccion === 'inversionistas' && <Inversionistas />}
            {seccion === 'reportes' && <Reportes />}
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
