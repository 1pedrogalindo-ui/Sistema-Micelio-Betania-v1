'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase/client';

export async function registrarAuditLog({
  accion,
  tabla,
  registroId,
  descripcion,
  valoresAnteriores,
  valoresNuevos,
}: {
  accion: string;
  tabla: string;
  registroId?: string;
  descripcion?: string;
  valoresAnteriores?: any;
  valoresNuevos?: any;
}) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;

  const { data: sessionData } = await supabase.auth.getSession();
  const user = sessionData.session?.user;

  if (!user) return;

  await supabase.from('audit_log').insert({
    user_id: user.id,
    user_email: user.email,
    accion,
    tabla,
    registro_id: registroId || null,
    descripcion: descripcion || null,
    valores_anteriores: valoresAnteriores || null,
    valores_nuevos: valoresNuevos || null,
  });
}
