import { NextRequest } from 'next/server';
import { makePdfResponse } from '@/lib/reports/server';
import { ReporteFinancieroPDF } from '@/lib/reports/ReportesPDF';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return makePdfResponse(
    req,
    'Micelio_Betania_Reporte_Financiero.pdf',
    (data) => (
      <ReporteFinancieroPDF
        inventario={data.inventario}
        cosechas={data.cosechas}
        logoSrc={data.logoSrc}
      />
    )
  );
}
