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
  greenDark: '#15372A',
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

  logo: {
    width: 112,
    height: 58,
    objectFit: 'contain',
    marginBottom: 8,
  },

  coverBox: {
    borderWidth: 1.5,
    borderColor: colors.gold,
    borderRadius: 16,
    padding: 22,
    backgroundColor: colors.paper,
    marginBottom: 18,
  },

  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
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
  },

  confidential: {
    fontSize: 8,
    color: colors.muted,
    textAlign: 'right',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    lineHeight: 1.3,
  },

  brand: {
    fontSize: 34,
    color: colors.green,
    marginBottom: 0,
    lineHeight: 0.95,
  },

  brandGold: {
    color: colors.gold,
  },

  title: {
    fontSize: 24,
    color: colors.green,
    marginTop: 14,
    marginBottom: 6,
    lineHeight: 1.05,
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
    marginTop: 18,
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
    marginBottom: 18,
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
    fontSize: 18,
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

  bullet: {
    fontSize: 8,
    lineHeight: 1.25,
    marginBottom: 2,
  },

  card: {
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

function chunk<T>(arr: T[], size: number) {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function Footer() {
  return (
    <Text style={styles.footer}>
      Micelio Betania × CBI Betania · Manual Operativo Piloto 10 m² · Champiñón Blanco Agaricus bisporus · Documento confidencial generado desde el sistema.
    </Text>
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

function CronogramaTable({ fases }: { fases: any[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.tr}>
        <Text style={[styles.th, { width: '14%' }]}>Semana</Text>
        <Text style={[styles.th, { width: '26%' }]}>Fase</Text>
        <Text style={[styles.th, { width: '18%' }]}>Fechas</Text>
        <Text style={[styles.th, { width: '13%' }]}>Estado</Text>
        <Text style={[styles.th, { width: '29%' }]}>Actividades clave</Text>
      </View>

      {fases.map((f, idx) => {
        const actividades = Array.isArray(f.actividades) ? f.actividades.slice(0, 5) : [];

        return (
          <View key={f.id || idx} style={idx === fases.length - 1 ? styles.trLast : styles.tr} wrap={false}>
            <Text style={[styles.tdBold, { width: '14%' }]}>{f.semana || ''}</Text>
            <Text style={[styles.td, { width: '26%' }]}>{f.nombre || ''}</Text>
            <Text style={[styles.td, { width: '18%' }]}>{fecha(f.fecha_inicio)}{'\n'}→ {fecha(f.fecha_fin)}</Text>
            <Text style={[styles.td, { width: '13%' }]}>{f.estado || ''}</Text>
            <View style={[styles.td, { width: '29%' }]}>
              {actividades.map((a: string, i: number) => (
                <Text key={i} style={styles.bullet}>• {a}</Text>
              ))}
            </View>
          </View>
        );
      })}
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
            <Text key={ci} style={[styles.td, { width: widths[ci] }]}>{String(cell ?? '')}</Text>
          ))}
        </View>
      ))}
    </View>
  );
}

export default function ManualOperativoPDF({
  fases,
  inventario,
  cosechas,
  registros,
  logoSrc,
}: {
  fases: any[];
  inventario: any[];
  cosechas: any[];
  registros: any[];
  logoSrc?: string;
}) {
  const costoInventario = inventario.reduce(
    (s, i) => s + Number(i.cantidad || 0) * Number(i.precio_unit || 0),
    0
  );

  const premium = cosechas.reduce((s, c) => s + Number(c.kg_premium || 0), 0);
  const comercial = cosechas.reduce((s, c) => s + Number(c.kg_comercial || 0), 0);
  const merma = cosechas.reduce((s, c) => s + Number(c.kg_merma || 0), 0);
  const totalKg = premium + comercial + merma;
  const ingreso = premium * 4.5 + comercial * 3.25;
  const margen = ingreso - costoInventario;
  const mermaPct = totalKg > 0 ? (merma / totalKg) * 100 : 0;
  const avance = fases.length > 0
    ? (fases.filter((f) => f.estado === 'completado').length / fases.length) * 100
    : 0;

  const paginasCronograma = chunk(fases, 5);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.coverBox}>
          <View style={styles.topRow}>
            <Text style={styles.badge}>Documento operativo actualizado</Text>
            <Text style={styles.confidential}>Documento operativo{'\n'}Confidencial{'\n'}Versión sistema</Text>
          </View>

          {logoSrc ? (
            <Image src={logoSrc} style={styles.logo} />
          ) : (
            <>
              <Text style={styles.brand}>Micelio</Text>
              <Text style={[styles.brand, styles.brandGold]}>Betania</Text>
            </>
          )}

          <Text style={styles.title}>Manual Operativo Actualizado — Piloto de Champiñón Blanco</Text>
          <Text style={styles.subtitle}>Cuarto cerrado de 10 m² · Betania, Alangasí · Valle de los Chillos</Text>
          <Text style={styles.subtitle}>Especie: Agaricus bisporus · Champiñón blanco</Text>
          <Text style={styles.subtitle}>Área piloto: 10 m² físicos · hasta 30 m² efectivos</Text>
          <Text style={styles.small}>Documento generado desde el Sistema Micelio Betania con cronograma parametrizado en Supabase.</Text>
        </View>

        <View style={styles.kpiGrid}>
          <Kpi label="Avance" value={`${num(avance, 0)}%`} />
          <Kpi label="Producción" value={`${num(totalKg)} kg`} />
          <Kpi label="Ingreso est." value={money(ingreso)} />
          <Kpi label="Merma" value={`${num(mermaPct)}%`} />
        </View>

        <Text style={styles.sectionTitle}>Resumen ejecutivo</Text>
        <Text style={styles.paragraph}>
          Este manual operativo consolida el proceso del piloto de champiñón blanco de Micelio Betania,
          integrando el cronograma operativo actualizado, registros de control, producción, costos,
          trazabilidad e indicadores para la toma de decisiones.
        </Text>

        <Text style={styles.sectionTitle}>Principio de decisión</Text>
        <View style={styles.card}>
          <Text style={styles.paragraph}>
            El ciclo debe evaluarse por rendimiento kg/m², estabilidad ambiental, merma,
            costo real por kg, trazabilidad y capacidad de vender producto premium/comercial.
            No se recomienda escalar por entusiasmo, sino por evidencia operativa documentada.
          </Text>
        </View>

        <Footer />
      </Page>

      {paginasCronograma.map((grupo, index) => (
        <Page key={index} size="A4" style={styles.page}>
          <Text style={styles.sectionTitle}>
            Cronograma actualizado {paginasCronograma.length > 1 ? `(${index + 1}/${paginasCronograma.length})` : ''}
          </Text>
          <CronogramaTable fases={grupo} />
          <Footer />
        </Page>
      ))}

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Parámetros técnicos base</Text>
        <SimpleTable
          headers={['Etapa', 'Temperatura', 'Humedad', 'CO₂', 'Observación']}
          widths={['16%', '23%', '15%', '17%', '29%']}
          rows={[
            ['Incubación', 'Compost 23–25 °C · Aire 20–24 °C', '85–90%', '8.000–15.000 ppm tolerado', 'No ventilar en exceso; controlar temperatura del compost.'],
            ['Fructificación', 'Aire 15–18 °C · Compost 16–20 °C', '88–95%', '<1.500 ppm', 'Aumentar ventilación progresivamente sin secar casing.'],
            ['Postcosecha', '2–4 °C', 'Cadena de frío', 'No aplica', 'Cosechar, clasificar, empacar y enfriar en menos de 60 minutos.'],
          ]}
        />

        <Text style={styles.sectionTitle}>Registros operativos requeridos</Text>
        <SimpleTable
          headers={['Código', 'Registro', 'Frecuencia', 'Datos clave']}
          widths={['12%', '25%', '22%', '41%']}
          rows={[
            ['R-01', 'Ambiente del cuarto', '3 veces al día', 'Temperatura, HR, CO₂ y acción tomada.'],
            ['R-02', 'Temperatura compost', 'Diario', 'Temperatura interior del compost y acciones correctivas.'],
            ['R-03', 'Riegos', 'Cada evento', 'Hora, cantidad aproximada y condición del casing.'],
            ['R-04', 'Incidencias sanitarias', 'Cuando ocurran', 'Foto, descripción, bandeja afectada y acción correctiva.'],
            ['R-05', 'Cosecha', 'Cada cosecha', 'Lote, kg premium, comercial, merma y cliente destino.'],
            ['R-08', 'Datos del lote', 'Apertura y cierre', 'Compost, spawn, siembra, casing, cosecha y kg totales.'],
          ]}
        />

        <Footer />
      </Page>

      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>Indicadores actuales del sistema</Text>
        <SimpleTable
          headers={['Indicador', 'Valor']}
          widths={['55%', '45%']}
          rows={[
            ['Producción premium', `${num(premium)} kg`],
            ['Producción comercial', `${num(comercial)} kg`],
            ['Merma', `${num(merma)} kg · ${num(mermaPct)}%`],
            ['Producción total', `${num(totalKg)} kg`],
            ['Rendimiento', `${num(totalKg / 10, 2)} kg/m²`],
            ['Ingreso estimado', money(ingreso)],
            ['Costo inventario', money(costoInventario)],
            ['Margen estimado', money(margen)],
            ['Registros ambientales', registros.length],
          ]}
        />

        <Footer />
      </Page>
    </Document>
  );
}
