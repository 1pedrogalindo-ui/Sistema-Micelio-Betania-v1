import { NextRequest } from 'next/server';
import { makePdfResponse } from '@/lib/reports/server';
import { ReporteInversionistasPDF } from '@/lib/reports/ReportesPDF';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return makePdfResponse(
    req,
    'Micelio_Betania_Reporte_Inversionistas.pdf',
    (data) => (
      <ReporteInversionistasPDF
        fases={data.fases}
        inventario={data.inventario}
        cosechas={data.cosechas}
        registros={data.registros}
        auditLog={data.auditLog}
        logoSrc={data.logoSrc}
      />
    )
  );
}
