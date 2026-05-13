export function calcularRendimientoKgM2(totalKg: number, areaM2: number) {
  return areaM2 > 0 ? totalKg / areaM2 : 0;
}

export function calcularMermaPct(kgMerma: number, totalKg: number) {
  return totalKg > 0 ? (kgMerma / totalKg) * 100 : 0;
}

export function proyectarRendimiento(ciclos: any[]) {
  const validos = ciclos.filter((c) => Number(c.rendimiento || 0) > 0);
  if (!validos.length) {
    return {
      rendimientoEsperado: 0,
      produccionEsperada: 0,
      confianza: 'Sin datos',
      recomendacion: 'Registrar cosechas reales para activar predicción.',
    };
  }

  const promedio =
    validos.reduce((sum, c) => sum + Number(c.rendimiento || 0), 0) / validos.length;

  return {
    rendimientoEsperado: promedio * 1.08,
    produccionEsperada: promedio * 1.08 * 10,
    confianza: validos.length >= 3 ? 'Media' : 'Baja',
    recomendacion:
      promedio >= 8
        ? 'El piloto apunta a escalamiento prudente si la merma se mantiene controlada.'
        : 'Conviene estabilizar rendimiento antes de escalar.',
  };
}
