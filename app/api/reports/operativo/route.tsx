import { NextRequest } from 'next/server';
import { makePdfResponse } from '@/lib/reports/server';
import { ReporteOperativoPDF } from '@/lib/reports/ReportesPDF';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  return makePdfResponse(
    req,
    'Micelio_Betania_Reporte_Operativo.pdf',
    (data) => (
      <ReporteOperativoPDF
        fases={data.fases}
        registros={data.registros}
        bandejas={data.bandejas}
        estanterias={data.estanterias}
        logoSrc={data.logoSrc}
      />
    )
  );
}
