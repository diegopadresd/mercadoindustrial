import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseTags(tagsStr: string): string[] {
  if (!tagsStr) return [];
  return tagsStr.split('\n').map(t => t.trim()).filter(Boolean);
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
    // Use getClaims for local JWT verification (avoids extra network round-trip per batch)
    const { data: claimsData, error: claimsError } = await supabaseAdmin.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) throw new Error('Invalid token');
    const userId = claimsData.claims.sub;

    const { data: adminRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!adminRole) throw new Error('Unauthorized: Admin access required');

    const { csvData, batchIndex, totalBatches } = await req.json();

    if (!csvData || !Array.isArray(csvData)) {
      throw new Error('csvData array is required');
    }

    const rows = csvData.map((row: any) => ({
      id: parseInt(row.id),
      email: row.email || null,
      first_name: row.first_name || null,
      last_name: row.last_name || null,
      phone: row.phone || null,
      mobile: row.mobile || null,
      company: row.company || null,
      website: row.website || null,
      country: row.country || null,
      region: row.region || null,
      city: row.city || null,
      address: row.address || null,
      postal_code: row.postal_code || null,
      contact_type: row.contact_type || null,
      vat: row.vat || null,
      source: row.source || null,
      created_at: row.created_at || new Date().toISOString(),
      marketing_emails: row.marketing_emails || null,
      tags: parseTags(row.tags || ''),
      custom_fields: row.custom_fields || null,
      notes: row.notes || null,
    }));

    const { error: insertError, count } = await supabaseAdmin
      .from('clients')
      .upsert(rows, { onConflict: 'id', ignoreDuplicates: false })
      .select('id');

    if (insertError) {
      throw new Error(`Insert error: ${insertError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        inserted: rows.length,
        batch: `${batchIndex || 0}/${totalBatches || 0}`,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('import-clients error:', message);
    return new Response(
      JSON.stringify({ error: message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
