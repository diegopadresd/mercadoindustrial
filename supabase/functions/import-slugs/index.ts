import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { autoRefreshToken: false, persistSession: false } }
    );

    // Verify admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('No authorization header');
    
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) throw new Error('Invalid token');

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!adminRole) throw new Error('Unauthorized: Admin access required');

    const { rows, batchIndex, totalBatches } = await req.json();

    if (!rows || !Array.isArray(rows)) {
      throw new Error('rows array is required');
    }

    // Validate each row has id and slug
    for (const row of rows) {
      if (!row.id || !row.slug) {
        throw new Error(`Invalid row: id and slug are required. Got: ${JSON.stringify(row)}`);
      }
      // Sanitize slug: only lowercase letters, numbers, hyphens
      if (!/^[a-z0-9-]+$/.test(row.slug)) {
        throw new Error(`Invalid slug format for id ${row.id}: "${row.slug}"`);
      }
    }

    // Batch update slugs
    let updated = 0;
    const errors: string[] = [];

    for (const row of rows) {
      const { error } = await supabaseAdmin
        .from('products')
        .update({ slug: row.slug })
        .eq('id', String(row.id));

      if (error) {
        errors.push(`id ${row.id}: ${error.message}`);
      } else {
        updated++;
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        updated,
        errors: errors.length > 0 ? errors.slice(0, 10) : undefined,
        batch: `${batchIndex || 0}/${totalBatches || 0}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('import-slugs error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
