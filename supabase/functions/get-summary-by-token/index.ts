
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface GetSummaryRequest {
  summaryId: string;
  token: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { summaryId, token }: GetSummaryRequest = await req.json();

    if (!summaryId || !token) {
      return new Response(JSON.stringify({ error: 'Missing summaryId or token' }), { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
    );

    // 1. Verify the token
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('patient_access_tokens')
      .select('expires_at')
      .eq('summary_id', summaryId)
      .eq('token', token)
      .single();

    if (tokenError || !tokenData) {
      console.error('Token verification error:', tokenError);
      return new Response(JSON.stringify({ error: 'Invalid or expired access link.' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 2. Check if token is expired
    if (new Date(tokenData.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: 'This access link has expired.' }), { status: 401, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    // 3. Fetch the summary
    const { data: summaryData, error: summaryError } = await supabaseAdmin
      .from('summaries')
      .select('id, patient_name, summary_content, created_at, chat_history')
      .eq('id', summaryId)
      .single();

    if (summaryError || !summaryData) {
      console.error('Summary fetch error:', summaryError);
      return new Response(JSON.stringify({ error: 'Could not retrieve summary.' }), { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } });
    }

    return new Response(JSON.stringify(summaryData), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });

  } catch (error) {
    console.error('Unexpected error in get-summary-by-token:', error);
    return new Response(JSON.stringify({ error: 'An unexpected error occurred.' }), { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } });
  }
};

serve(handler);
