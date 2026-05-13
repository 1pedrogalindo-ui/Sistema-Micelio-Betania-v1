'use client';

import {
  LayoutDashboard,
  Calendar,
  Users,
  Package,
  ClipboardList,
  GitBranch,
  Warehouse,
  DollarSign,
  DatabaseZap,
  Brain,
  Briefcase,
  Leaf,
} from 'lucide-react';

const items = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'cronograma', label: 'Cronograma', icon: Calendar },
  { id: 'proveedores', label: 'Proveedores', icon: Users },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'registros', label: 'Registros', icon: ClipboardList },
  { id: 'trazabilidad', label: 'Trazabilidad', icon: GitBranch },
  { id: 'infraestructura', label: 'Infraestructura', icon: Warehouse },
  { id: 'costos', label: 'Costos & ROI', icon: DollarSign },
  { id: 'integraciones', label: 'Integraciones', icon: DatabaseZap },
  { id: 'inteligencia', label: 'Inteligencia', icon: Brain },
  { id: 'inversionistas', label: 'Inversionistas', icon: Briefcase },
];

export default function Sidebar({
  seccion,
  setSeccion,
}: {
  seccion: string;
  setSeccion: (s: string) => void;
}) {
  return (
    <aside className="w-64 bg-tierra-900 text-tierra-50 flex flex-col border-r border-tierra-800">
      <div className="p-6 border-b border-tierra-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-micelio-400 flex items-center justify-center">
            <Leaf className="w-5 h-5 text-tierra-900" />
          </div>
          <div>
            <div className="font-serif text-xl text-micelio-100 leading-tight">Micelio</div>
            <div className="font-serif text-xs text-micelio-300 italic">Betania</div>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            const active = seccion === item.id;

            return (
              <li key={item.id}>
                <button
                  onClick={() => setSeccion(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm transition ${
                    active
                      ? 'bg-micelio-500 text-tierra-900 font-medium'
                      : 'text-tierra-200 hover:bg-tierra-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-tierra-800">
        <div className="text-xs text-tierra-400 mb-1">Piloto 10m²</div>
        <div className="text-sm text-tierra-100">Lote MB-AB-001</div>
        <div className="mt-2 inline-block px-2 py-1 rounded bg-micelio-400/20 text-micelio-200 text-xs">
          26/03 → 28/05/2026
        </div>
      </div>
    </aside>
  );
}
