import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pdf } from '@react-pdf/renderer';
import ManualOperativoPDF from '@/lib/reports/ManualOperativoPDF';

export const runtime = 'nodejs';

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service) {
    throw new Error('Faltan variables de Supabase.');
  }

  return { url, anon, service };
}

export async function GET(req: NextRequest) {
  try {
    const { url, anon, service } = getEnv();

    const authHeader = req.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const authClient = createClient(url, anon, {
      global: {
        headers: {
          Authorization: authHeader,
        },
      },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser();

    if (userError || !userData.user) {
      return NextResponse.json({ error: 'Sesión inválida' }, { status: 401 });
    }

    const supabase = createClient(url, service);

    const [
      fasesRes,
      inventarioRes,
      cosechasRes,
      registrosRes,
    ] = await Promise.all([
      supabase.from('fases').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }),
    ]);

    const errors = [
      fasesRes.error,
      inventarioRes.error,
      cosechasRes.error,
      registrosRes.error,
    ].filter(Boolean);

    if (errors.length) {
      return NextResponse.json({ error: errors[0]?.message }, { status: 500 });
    }

    const blob = await pdf(
      <ManualOperativoPDF
        fases={fasesRes.data || []}
        inventario={inventarioRes.data || []}
        cosechas={cosechasRes.data || []}
        registros={registrosRes.data || []}
      />
    ).toBlob();

    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Micelio_Betania_Manual_Operativo_Actualizado.pdf"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error?.message || 'Error generando PDF' },
      { status: 500 }
    );
  }
}
