import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from '@react-pdf/renderer';

const colors = {
  green: '#1F4F3A',
  gold: '#C9A76A',
  cream: '#F7F6F2',
  paper: '#FFFDF8',
  text: '#2B241D',
  muted: '#6F7C75',
  line: '#E3D4B7',
};

const styles = StyleSheet.create({
  page: {
    size: 'A4',
    backgroundColor: colors.cream,
    paddingTop: 34,
    paddingBottom: 32,
    paddingHorizontal: 38,
    fontFamily: 'Times-Roman',
    color: colors.text,
  },
  coverBox: {
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 16,
    padding: 20,
    backgroundColor: colors.paper,
    marginBottom: 16,
  },
  logo: {
    width: 118,
    height: 72,
    objectFit: 'contain',
    marginBottom: 8,
  },
  badge: {
    backgroundColor: colors.green,
    color: colors.cream,
    fontSize: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    letterSpacing: 1.4,
    textTransform: 'uppercase',
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  title: {
    fontSize: 25,
    color: colors.green,
    marginBottom: 6,
    lineHeight: 1.08,
  },
  subtitle: {
    fontSize: 11,
    color: colors.text,
    marginBottom: 4,
  },
  small: {
    fontSize: 9,
    color: colors.muted,
    lineHeight: 1.3,
  },
  sectionTitle: {
    fontSize: 18,
    color: colors.green,
    marginTop: 16,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.gold,
    paddingBottom: 4,
  },
  paragraph: {
    fontSize: 10.5,
    lineHeight: 1.45,
    marginBottom: 8,
  },
  kpiGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  kpi: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 10,
    padding: 10,
    backgroundColor: colors.paper,
  },
  kpiLabel: {
    fontSize: 7,
    color: colors.muted,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    marginBottom: 5,
  },
  kpiValue: {
    fontSize: 17,
    color: colors.green,
  },
  table: {
    width: '100%',
    borderWidth: 1,
    borderColor: colors.line,
    marginTop: 8,
    marginBottom: 12,
  },
  tr: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  trLast: {
    flexDirection: 'row',
  },
  th: {
    backgroundColor: '#EFE5D1',
    fontSize: 7,
    color: colors.text,
    padding: 5,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  td: {
    fontSize: 8.5,
    padding: 5,
    lineHeight: 1.25,
  },
  tdBold: {
    fontSize: 8.5,
    padding: 5,
    lineHeight: 1.25,
    fontFamily: 'Times-Bold',
  },
  decisionBox: {
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    padding: 12,
    backgroundColor: colors.paper,
    marginTop: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 18,
    left: 38,
    right: 38,
    borderTopWidth: 1,
    borderTopColor: colors.line,
    paddingTop: 6,
    fontSize: 7,
    color: colors.muted,
  },
});

function money(n: number) {
  return `$${Number(n || 0).toFixed(2)}`;
}

function num(n: number, d = 1) {
  return Number(n || 0).toFixed(d);
}

function fecha(value: any) {
  if (!value) return '';
  const raw = String(value).slice(0, 10);
  const [y, m, d] = raw.split('-');
  if (!y || !m || !d) return raw;
  return `${d}/${m}/${y}`;
}

function Footer({ title }: { title: string }) {
  return (
    <Text style={styles.footer}>
      Micelio Betania · {title} · Documento generado automáticamente desde el sistema.
    </Text>
  );
}

function Cover({
  logoSrc,
  badge,
  title,
  subtitle,
}: {
  logoSrc?: string;
  badge: string;
  title: string;
  subtitle: string;
}) {
  return (
    <View style={styles.coverBox}>
      {logoSrc ? <Image src={logoSrc} style={styles.logo} /> : null}
      <Text style={styles.badge}>{badge}</Text>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>{subtitle}</Text>
      <Text style={styles.small}>Documento generado desde el Sistema Micelio Betania.</Text>
    </View>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.kpi}>
      <Text style={styles.kpiLabel}>{label}</Text>
      <Text style={styles.kpiValue}>{value}</Text>
    </View>
  );
}

function SimpleTable({
  headers,
  rows,
  widths,
}: {
  headers: string[];
  rows: any[][];
  widths: string[];
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tr}>
        {headers.map((h, i) => (
          <Text key={h} style={[styles.th, { width: widths[i] }]}>{h}</Text>
        ))}
      </View>

      {rows.map((row, ri) => (
        <View key={ri} style={ri === rows.length - 1 ? styles.trLast : styles.tr} wrap={false}>
          {row.map((cell, ci) => (
            <Text key={ci} style={[ci === 0 ? styles.tdBold : styles.td, { width: widths[ci] }]}>
              {String(cell ?? '')}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}


function chunkRows<T>(arr: T[], size: number) {
  const chunks: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
  return chunks;
}

function fixed(n: any, d = 1) {
  const value = Number(n || 0);
  return Number.isFinite(value) ? value.toFixed(d) : '';
}

function metricasBase({ fases = [], inventario = [], cosechas = [] }: any) {
  const costo = inventario.reduce(
    (s: number, i: any) => s + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
    0
  );

  const premium = cosechas.reduce((s: number, c: any) => s + Number(c.kg_premium || 0), 0);
  const comercial = cosechas.reduce((s: number, c: any) => s + Number(c.kg_comercial || 0), 0);
  const merma = cosechas.reduce((s: number, c: any) => s + Number(c.kg_merma || 0), 0);
  const totalKg = premium + comercial + merma;
  const vendible = premium + comercial;
  const ingreso = premium * 4.5 + comercial * 3.25;
  const margen = ingreso - costo;
  const kgM2 = totalKg / 10;
  const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;
  const avance = fases.length
    ? (fases.filter((f: any) => f.estado === 'completado').length / fases.length) * 100
    : 0;

  return { costo, premium, comercial, merma, totalKg, vendible, ingreso, margen, kgM2, mermaPct, avance };
}

export function ReporteOperativoPDF({ fases, registros, bandejas, estanterias, logoSrc }: any) {
  const avance = fases.length
    ? (fases.filter((f: any) => f.estado === 'completado').length / fases.length) * 100
    : 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Cover
          logoSrc={logoSrc}
          badge="Reporte operativo"
          title="Micelio Betania · Reporte Operativo"
          subtitle="Piloto 10 m² · Champiñón blanco · Betania, Alangasí"
        />

        <View style={styles.kpiGrid}>
          <Kpi label="Fases" value={`${fases.length}`} />
          <Kpi label="Avance" value={`${num(avance, 0)}%`} />
          <Kpi label="Bandejas" value={`${bandejas.length}`} />
          <Kpi label="Registros" value={`${registros.length}`} />
        </View>

        <Text style={styles.sectionTitle}>Cronograma</Text>
        <SimpleTable
          headers={['Fase', 'Inicio', 'Fin', 'Estado', 'Avance']}
          widths={['40%', '15%', '15%', '15%', '15%']}
          rows={fases.map((f: any) => [
            f.nombre,
            fecha(f.fecha_inicio),
            fecha(f.fecha_fin),
            f.estado,
            `${Number(f.porcentaje_avance || 0)}%`,
          ])}
        />

        <Text style={styles.sectionTitle}>Infraestructura</Text>
        <SimpleTable
          headers={['Indicador', 'Valor']}
          widths={['55%', '45%']}
          rows={[
            ['Estanterías registradas', estanterias.length],
            ['Bandejas registradas', bandejas.length],
            ['Registros ambientales', registros.length],
          ]}
        />

        <Footer title="Reporte Operativo" />
      </Page>

      {chunkRows(registros.slice(0, 32), 16).map((grupo: any[], index: number) => (
        <Page key={`registros-${index}`} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            Últimos registros ambientales {index + 1}/{chunkRows(registros.slice(0, 32), 16).length}
          </Text>

          <SimpleTable
            headers={['Fecha', 'Fase', 'T. aire', 'T. compost', 'HR', 'CO₂']}
            widths={['24%', '18%', '14%', '16%', '12%', '16%']}
            rows={grupo.map((r: any) => [
              String(r.fecha || '').slice(0, 16),
              r.fase || '',
              fixed(r.temperatura_aire, 1),
              fixed(r.temperatura_compost, 1),
              fixed(r.humedad, 1),
              fixed(r.co2, 0),
            ])}
          />

          <Footer title="Reporte Operativo" />
        </Page>
      ))}
    </Document>
  );
}

export function ReporteFinancieroPDF({ inventario, cosechas, logoSrc }: any) {
  const m = metricasBase({ inventario, cosechas });

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Cover
          logoSrc={logoSrc}
          badge="Reporte financiero"
          title="Micelio Betania · Costos & ROI"
          subtitle="Costos reales, producción, ingreso estimado y margen operativo."
        />

        <View style={styles.kpiGrid}>
          <Kpi label="Costo" value={money(m.costo)} />
          <Kpi label="Ingreso" value={money(m.ingreso)} />
          <Kpi label="Margen" value={money(m.margen)} />
          <Kpi label="Kg/m²" value={num(m.kgM2, 2)} />
        </View>

        <Text style={styles.sectionTitle}>Resumen financiero</Text>
        <SimpleTable
          headers={['Indicador', 'Valor']}
          widths={['55%', '45%']}
          rows={[
            ['Producción premium', `${num(m.premium)} kg`],
            ['Producción comercial', `${num(m.comercial)} kg`],
            ['Merma', `${num(m.merma)} kg · ${num(m.mermaPct)}%`],
            ['Producción total', `${num(m.totalKg)} kg`],
            ['Producto vendible', `${num(m.vendible)} kg`],
            ['Costo acumulado', money(m.costo)],
            ['Ingreso estimado', money(m.ingreso)],
            ['Margen estimado', money(m.margen)],
          ]}
        />

        <Text style={styles.sectionTitle}>Inventario valorizado</Text>
        <SimpleTable
          headers={['Item', 'Categoría', 'Cant.', 'P. Unit', 'Total']}
          widths={['36%', '22%', '12%', '15%', '15%']}
          rows={inventario.slice(0, 28).map((i: any) => {
            const total = Number(i.cantidad || 0) * Number(i.precio_unit || 0);
            return [i.item, i.categoria, i.cantidad, money(i.precio_unit), money(total)];
          })}
        />

        <Footer title="Reporte Financiero" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Cosechas registradas</Text>
        <SimpleTable
          headers={['Fecha', 'Lote', 'Bandeja', 'Premium', 'Comercial', 'Merma']}
          widths={['15%', '22%', '18%', '15%', '15%', '15%']}
          rows={cosechas.slice(0, 34).map((c: any) => [
            fecha(c.fecha),
            c.lote,
            c.bandeja_id,
            c.kg_premium,
            c.kg_comercial,
            c.kg_merma,
          ])}
        />
        <Footer title="Reporte Financiero" />
      </Page>
    </Document>
  );
}

export function ReporteInversionistasPDF({ fases, inventario, cosechas, registros, auditLog, logoSrc }: any) {
  const m = metricasBase({ fases, inventario, cosechas });

  const listo =
    m.avance >= 80 &&
    m.kgM2 >= 8 &&
    m.mermaPct <= 10 &&
    m.totalKg > 0;

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Cover
          logoSrc={logoSrc}
          badge="Reporte inversionistas"
          title="Micelio Betania · Reporte Ejecutivo Momento 2"
          subtitle="Evidencia para decisión de escalamiento."
        />

        <View style={styles.kpiGrid}>
          <Kpi label="Avance" value={`${num(m.avance, 0)}%`} />
          <Kpi label="Producción" value={`${num(m.totalKg)} kg`} />
          <Kpi label="Kg/m²" value={num(m.kgM2, 2)} />
          <Kpi label="Merma" value={`${num(m.mermaPct)}%`} />
        </View>

        <Text style={styles.sectionTitle}>Tesis de inversión</Text>
        <Text style={styles.paragraph}>
          El piloto busca validar producción, control ambiental, trazabilidad, costo real por kg,
          merma y capacidad de venta antes de escalar. El Momento 2 debe decidirse por evidencia operativa.
        </Text>

        <Text style={styles.sectionTitle}>Semáforo Momento 2</Text>
        <SimpleTable
          headers={['Criterio', 'Estado']}
          widths={['70%', '30%']}
          rows={[
            ['Avance operativo ≥80%', m.avance >= 80 ? 'Cumple' : 'Pendiente'],
            ['Rendimiento ≥8 kg/m²', m.kgM2 >= 8 ? 'Cumple' : 'Pendiente'],
            ['Merma ≤10%', m.mermaPct <= 10 && m.totalKg > 0 ? 'Cumple' : 'Pendiente'],
            ['Producto vendible registrado', m.vendible > 0 ? 'Cumple' : 'Pendiente'],
            ['Decisión', listo ? 'Listo para evaluar expansión' : 'Continuar validación'],
          ]}
        />

        <View style={styles.decisionBox}>
          <Text style={styles.paragraph}>
            Decisión ejecutiva: {listo ? 'El sistema permite iniciar evaluación de expansión.' : 'Conviene continuar generando datos antes de comprometer inversión de expansión.'}
          </Text>
        </View>

        <Footer title="Reporte Inversionistas" />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Evidencia de actividad reciente</Text>
        <SimpleTable
          headers={['Fecha', 'Usuario', 'Acción', 'Tabla', 'Descripción']}
          widths={['20%', '22%', '13%', '15%', '30%']}
          rows={auditLog.slice(0, 28).map((a: any) => [
            String(a.created_at || '').slice(0, 16),
            a.user_email || '',
            a.accion || '',
            a.tabla || '',
            a.descripcion || '',
          ])}
        />

        <Text style={styles.sectionTitle}>Base operativa</Text>
        <SimpleTable
          headers={['Indicador', 'Valor']}
          widths={['60%', '40%']}
          rows={[
            ['Registros ambientales', registros.length],
            ['Cosechas registradas', cosechas.length],
            ['Fases del cronograma', fases.length],
            ['Eventos de auditoría incluidos', auditLog.length],
          ]}
        />

        <Footer title="Reporte Inversionistas" />
      </Page>
    </Document>
  );
}
