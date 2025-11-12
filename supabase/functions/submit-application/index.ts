import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Initialize Supabase Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const data = await req.json();

    // Validation
    if (!data.fubk_email || !data.fubk_email.endsWith('@fubk.edu.ng')) {
        return new Response(JSON.stringify({ error: 'Invalid email domain' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        });
    }

    // Insert Data into your specific table 'fubk-launchpad-pipeline'
    const { error } = await supabase
      .from('fubk-launchpad-pipeline')
      .insert({
        full_name: data.full_name,
        fubk_email: data.fubk_email,
        admission_no: data.admission_no,
        current_level: data.current_level,
        preferred_roles: data.preferred_roles, // Array
        reason_for_joining: data.reason_for_joining,
        status: 'New - Awaiting Review',
        challenge_response: data.challenge_response,
        tool_familiarity: data.tool_familiarity // Array
      });

    if (error) throw error;

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
