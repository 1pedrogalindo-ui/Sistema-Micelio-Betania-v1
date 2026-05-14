'use client';

import { useState, useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  Save,
  History,
  PlusCircle,
  Edit2,
  Trash2,
  X,
  RefreshCw,
  Download,
} from 'lucide-react';

const estados = [
  { id: 'pendiente', label: 'Pendiente', color: 'bg-tierra-100 text-tierra-700' },
  { id: 'en-curso', label: 'En curso', color: 'bg-micelio-200 text-micelio-800' },
  { id: 'completado', label: 'Completado', color: 'bg-green-100 text-green-700' },
  { id: 'retrasado', label: 'Retrasado', color: 'bg-red-100 text-red-700' },
];

const urgencias = [
  { id: 'baja', label: 'Baja' },
  { id: 'media', label: 'Media' },
  { id: 'alta', label: 'Alta' },
  { id: 'critica', label: 'Crítica' },
];

function slug(texto: string) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 60);
}



function formatDateOnly(value: any) {
  if (!value) return 'Sin fecha';
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);

  if (!year || !month || !day) return 'Sin fecha';

  const meses = [
    'ene', 'feb', 'mar', 'abr', 'may', 'jun',
    'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
  ];

  return `${day} de ${meses[month - 1]}`;
}

function toDateInputValue(value: any) {
  if (!value) return '';
  if (typeof value === 'string') return value.slice(0, 10);
  try {
    return new Date(value).toISOString().slice(0, 10);
  } catch {
    return '';
  }
}


function toExcelDate(value: any) {
  if (!value) return null;
  const raw = String(value).slice(0, 10);
  const [year, month, day] = raw.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0);
}

function diffDays(start: Date, end: Date) {
  const one = 1000 * 60 * 60 * 24;
  return Math.round((end.getTime() - start.getTime()) / one);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function estadoExcelLabel(estado: string) {
  const map: Record<string, string> = {
    pendiente: 'Pendiente',
    'en-curso': 'En curso',
    completado: 'Completado',
    retrasado: 'Retrasado',
  };
  return map[estado] || estado || 'Pendiente';
}

function urgenciaExcelLabel(urgencia: string) {
  const map: Record<string, string> = {
    baja: 'Baja',
    media: 'Media',
    alta: 'Alta',
    critica: 'Crítica',
  };
  return map[urgencia] || urgencia || 'Media';
}

function estadoArgb(estado: string) {
  if (estado === 'completado') return 'FF2E7D32';
  if (estado === 'en-curso') return 'FF1F4F3A';
  if (estado === 'retrasado') return 'FFB91C1C';
  return 'FFC9A76A';
}

function urgenciaArgb(urgencia: string) {
  if (urgencia === 'critica') return 'FFB91C1C';
  if (urgencia === 'alta') return 'FFB45309';
  if (urgencia === 'media') return 'FFC9A76A';
  return 'FF6F7C75';
}

function progressBarExcel(value: number) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  const filled = Math.round(safe / 10);
  return `${'█'.repeat(filled)}${'░'.repeat(10 - filled)} ${safe}%`;
}

function mapDbToUi(f: any) {
  return {
    id: f.id,
    nombre: f.nombre || '',
    semana: f.semana || '',
    fechaInicio: toDateInputValue(f.fecha_inicio),
    fechaFin: toDateInputValue(f.fecha_fin),
    estado: f.estado || 'pendiente',
    descripcion: f.descripcion || '',
    actividades: Array.isArray(f.actividades) ? f.actividades : [],
    urgencia: f.urgencia || 'media',
    porcentajeAvance: Number(f.porcentaje_avance || 0),
    responsable: f.responsable || '',
  };
}

export default function Cronograma() {
  const [fases, setFases] = useState<any[]>([]);
  const [seleccionada, setSeleccionada] = useState<string | null>(null);
  const [avances, setAvances] = useState<any[]>([]);
  const [mensaje, setMensaje] = useState('');
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [modoNueva, setModoNueva] = useState(false);
  const [editando, setEditando] = useState<string | null>(null);

  const faseVacia = {
    id: '',
    nombre: '',
    semana: '',
    fechaInicio: '',
    fechaFin: '',
    estado: 'pendiente',
    descripcion: '',
    actividadesTexto: '',
    urgencia: 'media',
    porcentajeAvance: 0,
    responsable: '',
  };

  const [formFase, setFormFase] = useState<any>(faseVacia);

  const [nuevoAvance, setNuevoAvance] = useState({
    porcentaje: 0,
    estado: 'en-curso',
    descripcion: '',
    responsable: '',
    evidencia_url: '',
    bloqueo: '',
    siguiente_accion: '',
  });

  useEffect(() => {
    cargarFases();
  }, []);

  useEffect(() => {
    if (seleccionada) {
      cargarAvances(seleccionada);
      const fase = fases.find((f) => f.id === seleccionada);
      if (fase) {
        setNuevoAvance((prev) => ({
          ...prev,
          porcentaje: Number(fase.porcentajeAvance || 0),
          estado: fase.estado || 'en-curso',
        }));
      }
    }
  }, [seleccionada, fases]);

  const mostrarMensaje = (texto: string) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(''), 6000);
  };

  const cargarFases = async () => {
    setCargando(true);

    const supabase = getSupabaseBrowserClient();
    if (!supabase) {
      mostrarMensaje('La base de datos no está configurada.');
      setCargando(false);
      return;
    }

    const { data, error } = await supabase
      .from('fases')
      .select('*')
      .order('fecha_inicio', { ascending: true });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setCargando(false);
      return;
    }

    setFases((data || []).map(mapDbToUi));
    setCargando(false);
  };

  const cargarAvances = async (faseId: string) => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { data, error } = await supabase
      .from('avances_cronograma')
      .select('*')
      .eq('fase_id', faseId)
      .order('fecha', { ascending: false });

    if (error) {
      console.error(error);
      setAvances([]);
      return;
    }

    setAvances(data || []);
  };

  const iniciarNuevaFase = () => {
    setModoNueva(true);
    setEditando(null);
    setFormFase(faseVacia);
  };

  const iniciarEdicion = (fase: any) => {
    setModoNueva(false);
    setEditando(fase.id);
    setFormFase({
      id: fase.id,
      nombre: fase.nombre,
      semana: fase.semana,
      fechaInicio: fase.fechaInicio,
      fechaFin: fase.fechaFin,
      estado: fase.estado,
      descripcion: fase.descripcion,
      actividadesTexto: (fase.actividades || []).join('\n'),
      urgencia: fase.urgencia,
      porcentajeAvance: fase.porcentajeAvance,
      responsable: fase.responsable || '',
    });
  };

  const cancelarFormulario = () => {
    setModoNueva(false);
    setEditando(null);
    setFormFase(faseVacia);
  };

  const actividadesJson = () => {
    return String(formFase.actividadesTexto || '')
      .split('\n')
      .map((a) => a.trim())
      .filter(Boolean);
  };

  const guardarFase = async () => {
    if (!formFase.nombre.trim()) {
      mostrarMensaje('Debes ingresar el nombre de la fase.');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setGuardando(true);

    const rpc = editando ? 'actualizar_fase_tx' : 'crear_fase_tx';

    const { error } = await supabase.rpc(rpc, {
      p_id: editando || formFase.id || slug(formFase.nombre),
      p_nombre: formFase.nombre.trim(),
      p_semana: formFase.semana || null,
      p_fecha_inicio: formFase.fechaInicio ? String(formFase.fechaInicio).slice(0, 10) : null,
      p_fecha_fin: formFase.fechaFin ? String(formFase.fechaFin).slice(0, 10) : null,
      p_estado: formFase.estado || 'pendiente',
      p_descripcion: formFase.descripcion || null,
      p_actividades: actividadesJson(),
      p_urgencia: formFase.urgencia || 'media',
      p_porcentaje_avance: Number(formFase.porcentajeAvance || 0),
      p_responsable: formFase.responsable || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setGuardando(false);
      return;
    }

    mostrarMensaje(editando ? 'Fase actualizada correctamente.' : 'Fase creada correctamente.');
    cancelarFormulario();
    await cargarFases();
    setGuardando(false);
  };

  const eliminarFase = async (fase: any) => {
    const confirmar = window.confirm(`¿Eliminar la fase "${fase.nombre}"? También se eliminarán sus avances.`);
    if (!confirmar) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.rpc('eliminar_fase_tx', {
      p_id: fase.id,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      return;
    }

    if (seleccionada === fase.id) {
      setSeleccionada(null);
      setAvances([]);
    }

    mostrarMensaje('Fase eliminada correctamente.');
    await cargarFases();
  };

  const actualizarEstado = async (id: string, nuevoEstado: string) => {
    const fase = fases.find((f) => f.id === id);
    if (!fase) return;

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    const { error } = await supabase.rpc('actualizar_fase_tx', {
      p_id: id,
      p_nombre: fase.nombre,
      p_semana: fase.semana || null,
      p_fecha_inicio: fase.fechaInicio ? String(fase.fechaInicio).slice(0, 10) : null,
      p_fecha_fin: fase.fechaFin ? String(fase.fechaFin).slice(0, 10) : null,
      p_estado: nuevoEstado,
      p_descripcion: fase.descripcion || null,
      p_actividades: fase.actividades || [],
      p_urgencia: fase.urgencia || 'media',
      p_porcentaje_avance: Number(fase.porcentajeAvance || 0),
      p_responsable: fase.responsable || null,
    });

    if (error) {
      mostrarMensaje(error.message);
      return;
    }

    await cargarFases();
  };

  const registrarAvance = async () => {
    if (!seleccionada) return;

    if (!nuevoAvance.descripcion.trim()) {
      mostrarMensaje('Escribe una descripción del avance.');
      return;
    }

    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;

    setGuardando(true);

    const { error } = await supabase.rpc('registrar_avance_cronograma_tx', {
      p_fase_id: seleccionada,
      p_porcentaje: Number(nuevoAvance.porcentaje || 0),
      p_estado: nuevoAvance.estado,
      p_descripcion: nuevoAvance.descripcion.trim(),
      p_responsable: nuevoAvance.responsable.trim() || null,
      p_evidencia_url: nuevoAvance.evidencia_url.trim() || null,
      p_bloqueo: nuevoAvance.bloqueo.trim() || null,
      p_siguiente_accion: nuevoAvance.siguiente_accion.trim() || null,
    });

    if (error) {
      console.error(error);
      mostrarMensaje(error.message);
      setGuardando(false);
      return;
    }

    setNuevoAvance({
      porcentaje: Number(nuevoAvance.porcentaje || 0),
      estado: nuevoAvance.estado,
      descripcion: '',
      responsable: nuevoAvance.responsable,
      evidencia_url: '',
      bloqueo: '',
      siguiente_accion: '',
    });

    mostrarMensaje('Avance registrado correctamente.');
    await cargarFases();
    await cargarAvances(seleccionada);
    setGuardando(false);
  };


  const descargarCronogramaExcel = async () => {
    if (!fases.length) {
      mostrarMensaje('No hay fases para exportar.');
      return;
    }

    const ExcelJS = await import('exceljs');
    const workbook = new ExcelJS.Workbook();

    workbook.creator = 'Sistema Micelio Betania';
    workbook.created = new Date();
    workbook.modified = new Date();

    const forest = 'FF1F4F3A';
    const forestDark = 'FF15372A';
    const gold = 'FFC9A76A';
    const cream = 'FFF7F6F2';
    const paper = 'FFFFFDF8';
    const text = 'FF2B241D';
    const muted = 'FF6F7C75';
    const line = 'FFE3D4B7';

    const excelFases = fases.map((f, index) => {
      const inicio = toExcelDate(f.fechaInicio);
      const fin = toExcelDate(f.fechaFin);
      const duracion = inicio && fin ? diffDays(inicio, fin) + 1 : 0;

      return {
        numero: index + 1,
        semana: f.semana || f.id,
        nombre: f.nombre || '',
        inicio,
        fin,
        duracion,
        estado: estadoExcelLabel(f.estado),
        estadoRaw: f.estado,
        urgencia: urgenciaExcelLabel(f.urgencia),
        urgenciaRaw: f.urgencia,
        avance: Number(f.porcentajeAvance || 0),
        responsable: f.responsable || '',
        descripcion: f.descripcion || '',
        actividades: Array.isArray(f.actividades) ? f.actividades.join('\n') : '',
      };
    });

    const fechasValidas = excelFases.flatMap((f) => [f.inicio, f.fin]).filter(Boolean) as Date[];
    const fechaMin = fechasValidas.length ? new Date(Math.min(...fechasValidas.map((d) => d.getTime()))) : new Date();
    const fechaMax = fechasValidas.length ? new Date(Math.max(...fechasValidas.map((d) => d.getTime()))) : new Date();
    const totalDias = diffDays(fechaMin, fechaMax) + 1;

    const completadas = excelFases.filter((f) => f.estadoRaw === 'completado').length;
    const enCurso = excelFases.filter((f) => f.estadoRaw === 'en-curso').length;
    const retrasadas = excelFases.filter((f) => f.estadoRaw === 'retrasado').length;
    const avancePromedio = excelFases.length
      ? Math.round(excelFases.reduce((s, f) => s + f.avance, 0) / excelFases.length)
      : 0;

    // =========================
    // HOJA 1: RESUMEN
    // =========================
    const resumen = workbook.addWorksheet('Resumen Ejecutivo', {
      views: [{ showGridLines: false }],
    });

    resumen.mergeCells('A1:H1');
    resumen.getCell('A1').value = 'MICELIO BETANIA · CRONOGRAMA OPERATIVO';
    resumen.getCell('A1').font = { bold: true, color: { argb: cream }, size: 18 };
    resumen.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forest } };
    resumen.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };
    resumen.getRow(1).height = 34;

    resumen.mergeCells('A2:H2');
    resumen.getCell('A2').value = `Descargado desde el sistema · ${new Date().toLocaleString('es-EC')}`;
    resumen.getCell('A2').font = { italic: true, color: { argb: muted }, size: 10 };
    resumen.getCell('A2').alignment = { horizontal: 'center' };

    const cards = [
      ['A4:B6', 'Fases', excelFases.length],
      ['C4:D6', 'Avance promedio', `${avancePromedio}%`],
      ['E4:F6', 'En curso', enCurso],
      ['G4:H6', 'Retrasadas', retrasadas],
      ['A8:B10', 'Completadas', completadas],
      ['C8:D10', 'Fecha inicio', fechaMin],
      ['E8:F10', 'Fecha fin', fechaMax],
      ['G8:H10', 'Duración total', `${totalDias} días`],
    ];

    cards.forEach(([range, label, value]: any) => {
      resumen.mergeCells(range);
      const cell = resumen.getCell(String(range).split(':')[0]);
      cell.value = `${label}\n${value instanceof Date ? value.toLocaleDateString('es-EC') : value}`;
      cell.font = { bold: true, color: { argb: text }, size: 13 };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: paper } };
      cell.border = {
        top: { style: 'thin', color: { argb: line } },
        left: { style: 'thin', color: { argb: line } },
        bottom: { style: 'thin', color: { argb: line } },
        right: { style: 'thin', color: { argb: line } },
      };
    });

    resumen.mergeCells('A12:H12');
    resumen.getCell('A12').value = 'Leyenda visual';
    resumen.getCell('A12').font = { bold: true, color: { argb: forest }, size: 14 };

    const legend = [
      ['Completado', '2E7D32'],
      ['En curso', '1F4F3A'],
      ['Pendiente', 'C9A76A'],
      ['Retrasado', 'B91C1C'],
    ];

    legend.forEach((item, idx) => {
      const row = 13 + idx;
      resumen.getCell(`A${row}`).value = item[0];
      resumen.getCell(`B${row}`).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: `FF${item[1]}` } };
      resumen.getCell(`B${row}`).border = {
        top: { style: 'thin', color: { argb: line } },
        left: { style: 'thin', color: { argb: line } },
        bottom: { style: 'thin', color: { argb: line } },
        right: { style: 'thin', color: { argb: line } },
      };
    });

    resumen.columns = [
      { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
      { width: 18 }, { width: 18 }, { width: 18 }, { width: 18 },
    ];

    // =========================
    // HOJA 2: CRONOGRAMA
    // =========================
    const detalle = workbook.addWorksheet('Cronograma', {
      views: [{ state: 'frozen', ySplit: 4, showGridLines: false }],
    });

    detalle.mergeCells('A1:L1');
    detalle.getCell('A1').value = 'Cronograma operativo parametrizable';
    detalle.getCell('A1').font = { bold: true, color: { argb: cream }, size: 16 };
    detalle.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forest } };
    detalle.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
    detalle.getRow(1).height = 30;

    detalle.mergeCells('A2:L2');
    detalle.getCell('A2').value = 'Micelio Betania · Piloto de champiñón blanco 10 m² · Hoja generada desde Supabase';
    detalle.getCell('A2').font = { italic: true, color: { argb: muted }, size: 10 };
    detalle.getCell('A2').alignment = { horizontal: 'center' };

    const headers = [
      '#',
      'Semana',
      'Fase',
      'Inicio',
      'Fin',
      'Días',
      'Estado',
      'Urgencia',
      'Avance visual',
      'Responsable',
      'Descripción',
      'Actividades',
    ];

    detalle.getRow(4).values = headers;
    detalle.getRow(4).height = 26;
    detalle.getRow(4).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: cream }, size: 10 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forestDark } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
      cell.border = {
        top: { style: 'thin', color: { argb: line } },
        left: { style: 'thin', color: { argb: line } },
        bottom: { style: 'thin', color: { argb: line } },
        right: { style: 'thin', color: { argb: line } },
      };
    });

    excelFases.forEach((f, idx) => {
      const rowNumber = 5 + idx;
      const row = detalle.getRow(rowNumber);

      row.values = [
        f.numero,
        f.semana,
        f.nombre,
        f.inicio,
        f.fin,
        f.duracion,
        f.estado,
        f.urgencia,
        progressBarExcel(f.avance),
        f.responsable,
        f.descripcion,
        f.actividades,
      ];

      row.height = 46;

      row.eachCell((cell, colNumber) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { size: 9, color: { argb: text } };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: idx % 2 === 0 ? 'FFFFFFFF' : cream },
        };
        cell.border = {
          top: { style: 'thin', color: { argb: line } },
          left: { style: 'thin', color: { argb: line } },
          bottom: { style: 'thin', color: { argb: line } },
          right: { style: 'thin', color: { argb: line } },
        };

        if ([1, 4, 5, 6, 7, 8, 9].includes(colNumber)) {
          cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        }
      });

      detalle.getCell(`D${rowNumber}`).numFmt = 'dd/mm/yyyy';
      detalle.getCell(`E${rowNumber}`).numFmt = 'dd/mm/yyyy';

      detalle.getCell(`G${rowNumber}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: estadoArgb(f.estadoRaw) },
      };
      detalle.getCell(`G${rowNumber}`).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };

      detalle.getCell(`H${rowNumber}`).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: urgenciaArgb(f.urgenciaRaw) },
      };
      detalle.getCell(`H${rowNumber}`).font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 9 };

      detalle.getCell(`I${rowNumber}`).font = {
        bold: true,
        color: { argb: estadoArgb(f.estadoRaw) },
        size: 9,
      };
    });

    detalle.columns = [
      { width: 5 },
      { width: 18 },
      { width: 34 },
      { width: 13 },
      { width: 13 },
      { width: 8 },
      { width: 14 },
      { width: 12 },
      { width: 18 },
      { width: 18 },
      { width: 42 },
      { width: 46 },
    ];

    detalle.autoFilter = {
      from: { row: 4, column: 1 },
      to: { row: 4, column: 12 },
    };

    // =========================
    // HOJA 3: GANTT VISUAL
    // =========================
    const gantt = workbook.addWorksheet('Gantt Visual', {
      views: [{ state: 'frozen', xSplit: 3, ySplit: 4, showGridLines: false }],
    });

    gantt.mergeCells('A1:C1');
    gantt.getCell('A1').value = 'Gantt visual';
    gantt.getCell('A1').font = { bold: true, color: { argb: cream }, size: 16 };
    gantt.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forest } };
    gantt.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    gantt.getCell('A3').value = 'Semana';
    gantt.getCell('B3').value = 'Fase';
    gantt.getCell('C3').value = 'Avance';

    ['A3', 'B3', 'C3'].forEach((addr) => {
      const cell = gantt.getCell(addr);
      cell.font = { bold: true, color: { argb: cream } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forestDark } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    for (let i = 0; i < totalDias; i++) {
      const col = 4 + i;
      const current = addDays(fechaMin, i);
      const cell = gantt.getCell(3, col);
      cell.value = current;
      cell.numFmt = 'dd/mm';
      cell.alignment = { textRotation: 90, horizontal: 'center', vertical: 'middle' };
      cell.font = { size: 8, color: { argb: text } };

      const isWeekend = current.getDay() === 0 || current.getDay() === 6;
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: isWeekend ? 'FFEFE5D1' : cream },
      };

      gantt.getColumn(col).width = 3.2;
    }

    gantt.getRow(3).height = 50;

    excelFases.forEach((f, idx) => {
      const rowNumber = 4 + idx;
      gantt.getCell(`A${rowNumber}`).value = f.semana;
      gantt.getCell(`B${rowNumber}`).value = f.nombre;
      gantt.getCell(`C${rowNumber}`).value = `${f.avance}%`;

      gantt.getRow(rowNumber).height = 24;

      ['A', 'B', 'C'].forEach((colLetter) => {
        const cell = gantt.getCell(`${colLetter}${rowNumber}`);
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.font = { size: 9, color: { argb: text } };
        cell.border = {
          top: { style: 'thin', color: { argb: line } },
          left: { style: 'thin', color: { argb: line } },
          bottom: { style: 'thin', color: { argb: line } },
          right: { style: 'thin', color: { argb: line } },
        };
      });

      const barColor = estadoArgb(f.estadoRaw);

      for (let i = 0; i < totalDias; i++) {
        const col = 4 + i;
        const current = addDays(fechaMin, i);
        const cell = gantt.getCell(rowNumber, col);

        const active =
          f.inicio &&
          f.fin &&
          current.getTime() >= f.inicio.getTime() &&
          current.getTime() <= f.fin.getTime();

        const isWeekend = current.getDay() === 0 || current.getDay() === 6;

        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: active ? barColor : isWeekend ? 'FFFFF3D6' : 'FFFFFFFF' },
        };

        cell.border = {
          top: { style: 'thin', color: { argb: 'FFEDE3CC' } },
          left: { style: 'thin', color: { argb: 'FFEDE3CC' } },
          bottom: { style: 'thin', color: { argb: 'FFEDE3CC' } },
          right: { style: 'thin', color: { argb: 'FFEDE3CC' } },
        };
      }
    });

    gantt.columns[0].width = 18;
    gantt.columns[1].width = 36;
    gantt.columns[2].width = 10;

    // =========================
    // HOJA 4: ACTIVIDADES
    // =========================
    const actividades = workbook.addWorksheet('Actividades', {
      views: [{ state: 'frozen', ySplit: 3, showGridLines: false }],
    });

    actividades.mergeCells('A1:F1');
    actividades.getCell('A1').value = 'Actividades por fase';
    actividades.getCell('A1').font = { bold: true, color: { argb: cream }, size: 16 };
    actividades.getCell('A1').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forest } };
    actividades.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };

    actividades.getRow(3).values = ['#', 'Fase', 'Actividad', 'Estado fase', 'Urgencia', 'Responsable'];
    actividades.getRow(3).eachCell((cell) => {
      cell.font = { bold: true, color: { argb: cream } };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: forestDark } };
      cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    let actRow = 4;

    excelFases.forEach((f) => {
      const acts = String(f.actividades || '')
        .split('\n')
        .map((a) => a.trim())
        .filter(Boolean);

      if (!acts.length) {
        actividades.getRow(actRow).values = [f.numero, f.nombre, 'Sin actividades registradas', f.estado, f.urgencia, f.responsable];
        actRow += 1;
        return;
      }

      acts.forEach((a) => {
        actividades.getRow(actRow).values = [f.numero, f.nombre, a, f.estado, f.urgencia, f.responsable];
        actRow += 1;
      });
    });

    for (let r = 3; r < actRow; r++) {
      actividades.getRow(r).eachCell((cell) => {
        cell.alignment = { vertical: 'middle', wrapText: true };
        cell.border = {
          top: { style: 'thin', color: { argb: line } },
          left: { style: 'thin', color: { argb: line } },
          bottom: { style: 'thin', color: { argb: line } },
          right: { style: 'thin', color: { argb: line } },
        };
      });
    }

    actividades.columns = [
      { width: 6 },
      { width: 34 },
      { width: 58 },
      { width: 16 },
      { width: 14 },
      { width: 18 },
    ];

    // Seguridad visual final
    workbook.eachSheet((sheet) => {
      sheet.eachRow((row) => {
        row.eachCell((cell) => {
          cell.alignment = { ...(cell.alignment || {}), vertical: 'middle' };
        });
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const date = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `Micelio_Betania_Cronograma_${date}.xlsx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);

    mostrarMensaje('Cronograma descargado en Excel correctamente.');
  };


  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-bosque-700 mb-2">
            Gestión de Fases
          </div>
          <h1 className="font-serif text-4xl text-tierra-900 mb-2">Cronograma</h1>
          <p className="text-tierra-600">
            Cronograma parametrizable, editable y auditado desde Supabase.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={cargarFases}
            disabled={cargando}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-micelio-200 bg-white text-tierra-700 hover:bg-micelio-50 text-sm disabled:opacity-60"
          >
            <RefreshCw className={`w-4 h-4 ${cargando ? 'animate-spin' : ''}`} />
            Refrescar
          </button>

          <button
            onClick={descargarCronogramaExcel}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-micelio-200 bg-white text-bosque-700 hover:bg-micelio-50 text-sm"
          >
            <Download className="w-4 h-4" />
            Descargar Excel
          </button>

          <button
            onClick={iniciarNuevaFase}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bosque-600 text-white hover:bg-bosque-700 text-sm"
          >
            <PlusCircle className="w-4 h-4" />
            Nueva fase
          </button>
        </div>
      </header>

      {mensaje && (
        <div className="rounded-xl border border-micelio-200 bg-micelio-50 px-4 py-3 text-sm text-tierra-800">
          {mensaje}
        </div>
      )}

      {(modoNueva || editando) && (
        <div className="bg-white rounded-2xl border border-micelio-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-2xl text-tierra-900">
              {editando ? 'Editar fase' : 'Nueva fase'}
            </h2>
            <button onClick={cancelarFormulario} className="p-2 rounded-lg hover:bg-micelio-50">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <Input label="ID" value={formFase.id} disabled={!!editando} onChange={(v: string) => setFormFase({ ...formFase, id: v })} placeholder="fase-1" />
            <Input label="Nombre" value={formFase.nombre} onChange={(v: string) => setFormFase({ ...formFase, nombre: v })} className="md:col-span-2" />
            <Input label="Semana" value={formFase.semana} onChange={(v: string) => setFormFase({ ...formFase, semana: v })} />
            <Input type="date" label="Fecha inicio" value={formFase.fechaInicio} onChange={(v: string) => setFormFase({ ...formFase, fechaInicio: v })} />
            <Input type="date" label="Fecha fin" value={formFase.fechaFin} onChange={(v: string) => setFormFase({ ...formFase, fechaFin: v })} />

            <Select label="Estado" value={formFase.estado} options={estados} onChange={(v: string) => setFormFase({ ...formFase, estado: v })} />
            <Select label="Urgencia" value={formFase.urgencia} options={urgencias} onChange={(v: string) => setFormFase({ ...formFase, urgencia: v })} />

            <Input type="number" label="Avance %" value={formFase.porcentajeAvance} onChange={(v: string) => setFormFase({ ...formFase, porcentajeAvance: Number(v || 0) })} />
            <Input label="Responsable" value={formFase.responsable} onChange={(v: string) => setFormFase({ ...formFase, responsable: v })} className="md:col-span-3" />

            <div className="md:col-span-4">
              <label className="text-xs uppercase tracking-wider text-tierra-600">Descripción</label>
              <textarea
                value={formFase.descripcion}
                onChange={(e) => setFormFase({ ...formFase, descripcion: e.target.value })}
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-xl text-sm"
              />
            </div>

            <div className="md:col-span-4">
              <label className="text-xs uppercase tracking-wider text-tierra-600">
                Actividades — una por línea
              </label>
              <textarea
                value={formFase.actividadesTexto}
                onChange={(e) => setFormFase({ ...formFase, actividadesTexto: e.target.value })}
                rows={5}
                className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-xl text-sm"
                placeholder={'Comprar insumos\nPreparar cuarto\nValidar humedad'}
              />
            </div>
          </div>

          <button
            onClick={guardarFase}
            disabled={guardando}
            className="mt-5 inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bosque-600 text-white hover:bg-bosque-700 text-sm disabled:opacity-60"
          >
            <Save className="w-4 h-4" />
            {guardando ? 'Guardando...' : 'Guardar fase'}
          </button>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-3">
          {fases.map((fase, idx) => {
            const porcentaje = Number(fase.porcentajeAvance || 0);

            return (
              <div
                key={fase.id}
                onClick={() => setSeleccionada(fase.id)}
                className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition ${
                  seleccionada === fase.id
                    ? 'border-bosque-600'
                    : 'border-micelio-200 hover:border-micelio-400'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                      fase.estado === 'completado' ? 'bg-green-500 text-white' :
                      fase.estado === 'en-curso' ? 'bg-bosque-600 text-white' :
                      fase.estado === 'retrasado' ? 'bg-red-500 text-white' :
                      'bg-micelio-100 text-bosque-700'
                    }`}>
                      {fase.estado === 'completado' ? <CheckCircle2 className="w-5 h-5" /> :
                       fase.estado === 'retrasado' ? <AlertTriangle className="w-5 h-5" /> :
                       <Circle className="w-5 h-5" />}
                    </div>
                    {idx < fases.length - 1 && <div className="w-0.5 h-12 bg-micelio-200 mt-2" />}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-bosque-700 uppercase tracking-wider mb-1">
                          {fase.semana || fase.id}
                        </div>
                        <h3 className="font-serif text-lg text-tierra-900">{fase.nombre}</h3>
                      </div>

                      <div className="flex items-center gap-2">
                        {fase.urgencia === 'critica' && (
                          <span className="text-xs px-2 py-1 rounded-full bg-red-100 text-red-700">
                            Crítica
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            iniciarEdicion(fase);
                          }}
                          className="p-2 rounded-lg hover:bg-micelio-50 text-tierra-600"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            eliminarFase(fase);
                          }}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-700"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p className="text-sm text-tierra-600 mt-2 mb-3">{fase.descripcion}</p>

                    <div className="flex items-center gap-2 text-xs text-tierra-500 mb-3">
                      <Clock className="w-3 h-3" />
                      <span>
                        {formatDateOnly(fase.fechaInicio)}
                        {' → '}
                        {formatDateOnly(fase.fechaFin)}
                      </span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-tierra-500 mb-1">
                        <span>Avance</span>
                        <span>{porcentaje}%</span>
                      </div>
                      <div className="h-2 bg-micelio-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-bosque-600 rounded-full transition-all"
                          style={{ width: `${Math.min(100, Math.max(0, porcentaje))}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {fases.length === 0 && (
            <div className="bg-white rounded-2xl border border-micelio-200 p-8 text-center text-tierra-500">
              No hay fases registradas. Crea la primera fase del cronograma.
            </div>
          )}
        </div>

        <div className="space-y-4">
          {seleccionada && (() => {
            const fase = fases.find((f) => f.id === seleccionada);
            if (!fase) return null;

            return (
              <div className="space-y-4 sticky top-6">
                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="text-xs text-bosque-700 uppercase tracking-wider mb-2">
                    Detalle de fase
                  </div>

                  <h3 className="font-serif text-xl text-tierra-900 mb-4">{fase.nombre}</h3>

                  <div className="mb-4">
                    <div className="text-xs text-tierra-500 uppercase tracking-wider mb-2">Estado rápido</div>
                    <div className="flex flex-wrap gap-2">
                      {estados.map((e) => (
                        <button
                          key={e.id}
                          onClick={() => actualizarEstado(fase.id, e.id)}
                          className={`text-xs px-3 py-1.5 rounded-full transition ${
                            fase.estado === e.id
                              ? e.color + ' ring-2 ring-offset-1 ring-micelio-400'
                              : 'bg-micelio-50 text-tierra-600 hover:bg-micelio-100'
                          }`}
                        >
                          {e.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs text-tierra-500 uppercase tracking-wider mb-2">
                      Actividades ({fase.actividades.length})
                    </div>
                    <ul className="space-y-2">
                      {fase.actividades.map((a: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-tierra-700">
                          <Circle className="w-3 h-3 mt-1 text-bosque-600 flex-shrink-0" />
                          <span>{a}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Save className="w-4 h-4 text-bosque-700" />
                    <h3 className="font-serif text-lg text-tierra-900">Registrar avance</h3>
                  </div>

                  <div className="space-y-3">
                    <Input type="number" label="Porcentaje" value={nuevoAvance.porcentaje} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, porcentaje: Number(v || 0) })} />
                    <Select label="Estado" value={nuevoAvance.estado} options={estados} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, estado: v })} />

                    <div>
                      <label className="text-xs text-tierra-600 uppercase tracking-wider">Descripción del avance</label>
                      <textarea
                        value={nuevoAvance.descripcion}
                        onChange={(e) => setNuevoAvance({ ...nuevoAvance, descripcion: e.target.value })}
                        className="w-full mt-1 px-3 py-2 border border-micelio-200 rounded-lg text-sm"
                        rows={3}
                      />
                    </div>

                    <Input label="Responsable" value={nuevoAvance.responsable} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, responsable: v })} />
                    <Input label="Bloqueo / problema" value={nuevoAvance.bloqueo} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, bloqueo: v })} />
                    <Input label="Siguiente acción" value={nuevoAvance.siguiente_accion} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, siguiente_accion: v })} />
                    <Input label="Evidencia URL" value={nuevoAvance.evidencia_url} onChange={(v: string) => setNuevoAvance({ ...nuevoAvance, evidencia_url: v })} />

                    <button
                      onClick={registrarAvance}
                      disabled={guardando}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-bosque-600 text-white rounded-lg hover:bg-bosque-700 text-sm font-medium disabled:opacity-60"
                    >
                      <Save className="w-4 h-4" />
                      {guardando ? 'Guardando...' : 'Guardar avance'}
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-micelio-200 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <History className="w-4 h-4 text-bosque-700" />
                    <h3 className="font-serif text-lg text-tierra-900">Historial</h3>
                  </div>

                  {avances.length === 0 ? (
                    <p className="text-sm text-tierra-500">Aún no hay avances registrados para esta fase.</p>
                  ) : (
                    <div className="space-y-3">
                      {avances.map((a) => (
                        <div key={a.id} className="p-3 bg-micelio-50 rounded-lg">
                          <div className="flex justify-between gap-2 mb-1">
                            <span className="text-xs font-medium text-bosque-800">
                              {a.estado} · {a.porcentaje}%
                            </span>
                            <span className="text-xs text-tierra-500">
                              {a.fecha ? format(new Date(a.fecha), "d MMM · HH:mm", { locale: es }) : ''}
                            </span>
                          </div>

                          <p className="text-sm text-tierra-800">{a.descripcion}</p>
                          {a.responsable && <p className="text-xs text-tierra-600 mt-1">Responsable: {a.responsable}</p>}
                          {a.bloqueo && <p className="text-xs text-red-700 mt-1">Bloqueo: {a.bloqueo}</p>}
                          {a.siguiente_accion && <p className="text-xs text-tierra-600 mt-1">Siguiente: {a.siguiente_accion}</p>}
                          {a.evidencia_url && (
                            <a
                              href={a.evidencia_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-bosque-700 underline mt-1 inline-block"
                            >
                              Ver evidencia
                            </a>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {!seleccionada && (
            <div className="bg-micelio-50 rounded-2xl border border-dashed border-micelio-300 p-8 text-center">
              <Circle className="w-8 h-8 text-micelio-400 mx-auto mb-2" />
              <p className="text-sm text-tierra-600">
                Selecciona una fase para editar estado, actividades y avances.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', placeholder = '', className = '', disabled = false }: any) {
  return (
    <div className={className}>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <input
        type={type}
        value={value || ''}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-xl border border-micelio-200 text-sm disabled:bg-micelio-50 disabled:text-tierra-400"
      />
    </div>
  );
}

function Select({ label, value, onChange, options }: any) {
  return (
    <div>
      <label className="text-xs uppercase tracking-wider text-tierra-600">{label}</label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-full mt-1 px-3 py-2 rounded-xl border border-micelio-200 text-sm"
      >
        {options.map((o: any) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
