import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pdf } from '@react-pdf/renderer';
import React from 'react';
import fs from 'fs';
import path from 'path';

function getLogoDataUri() {
  try {
    const logoPath = path.join(process.cwd(), 'public', 'micelio-betania-logo-transparent.png');

    if (!fs.existsSync(logoPath)) return undefined;

    const file = fs.readFileSync(logoPath);
    return `data:image/png;base64,${file.toString('base64')}`;
  } catch {
    return undefined;
  }
}

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !anon || !service) {
    throw new Error('Faltan variables de Supabase.');
  }

  return { url, anon, service };
}

export async function makePdfResponse(
  req: NextRequest,
  filename: string,
  buildDocument: (data: any) => React.ReactElement
) {
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
      avancesRes,
      inventarioRes,
      proveedoresRes,
      registrosRes,
      cosechasRes,
      bandejasRes,
      estanteriasRes,
      auditRes,
    ] = await Promise.all([
      supabase.from('fases').select('*').order('fecha_inicio', { ascending: true }),
      supabase.from('avances_cronograma').select('*').order('fecha', { ascending: false }),
      supabase.from('inventario').select('*').order('categoria', { ascending: true }),
      supabase.from('proveedores').select('*').order('nombre', { ascending: true }),
      supabase.from('registros_ambientales').select('*').order('fecha', { ascending: false }),
      supabase.from('cosechas').select('*').order('fecha', { ascending: false }),
      supabase.from('bandejas').select('*').order('codigo', { ascending: true }),
      supabase.from('estanterias').select('*').order('codigo', { ascending: true }),
      supabase.from('audit_log').select('*').order('created_at', { ascending: false }).limit(50),
    ]);

    const errors = [
      fasesRes.error,
      avancesRes.error,
      inventarioRes.error,
      proveedoresRes.error,
      registrosRes.error,
      cosechasRes.error,
      bandejasRes.error,
      estanteriasRes.error,
      auditRes.error,
    ].filter(Boolean);

    if (errors.length) {
      return NextResponse.json({ error: errors[0]?.message }, { status: 500 });
    }

    const document = buildDocument({
      fases: fasesRes.data || [],
      avances: avancesRes.data || [],
      inventario: inventarioRes.data || [],
      proveedores: proveedoresRes.data || [],
      registros: registrosRes.data || [],
      cosechas: cosechasRes.data || [],
      bandejas: bandejasRes.data || [],
      estanterias: estanteriasRes.data || [],
      auditLog: auditRes.data || [],
      logoSrc: getLogoDataUri(),
    });

    const blob = await pdf(document).toBlob();
    const arrayBuffer = await blob.arrayBuffer();

    return new NextResponse(arrayBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
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
