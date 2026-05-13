'use client';

import { FASES_PILOTO, PROVEEDORES, INVENTARIO_INICIAL } from '@/data/seed';

const KEYS = {
  FASES: 'mb_fases_v1',
  PROVEEDORES: 'mb_proveedores_v1',
  INVENTARIO: 'mb_inventario_v1',
  REGISTROS: 'mb_registros_v1',
  LOTES: 'mb_lotes_v1',
  COSECHAS: 'mb_cosechas_v1',
};

export const storage = {
  get<T>(key: string, fallback: T): T {
    if (typeof window === 'undefined') return fallback;
    try {
      const v = localStorage.getItem(key);
      return v ? JSON.parse(v) : fallback;
    } catch {
      return fallback;
    }
  },
  set<T>(key: string, value: T) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key: string) {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  },
  reset() {
    Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
  },
};

export const dataAPI = {
  getFases: () => storage.get(KEYS.FASES, FASES_PILOTO),
  setFases: (data: any) => storage.set(KEYS.FASES, data),

  getProveedores: () => storage.get(KEYS.PROVEEDORES, PROVEEDORES),
  setProveedores: (data: any) => storage.set(KEYS.PROVEEDORES, data),

  getInventario: () => storage.get(KEYS.INVENTARIO, INVENTARIO_INICIAL),
  setInventario: (data: any) => storage.set(KEYS.INVENTARIO, data),

  getRegistros: () => storage.get(KEYS.REGISTROS, []),
  setRegistros: (data: any) => storage.set(KEYS.REGISTROS, data),

  getLotes: () => storage.get(KEYS.LOTES, []),
  setLotes: (data: any) => storage.set(KEYS.LOTES, data),

  getCosechas: () => storage.get(KEYS.COSECHAS, []),
  setCosechas: (data: any) => storage.set(KEYS.COSECHAS, data),
};
