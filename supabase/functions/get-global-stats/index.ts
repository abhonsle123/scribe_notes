
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { corsHeaders } from '../_shared/cors.ts'

interface GlobalStats {
  totalSummaries: number;
  patientsImpacted: number;
  averageRating: number | null;
  providersUsingLiaise: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin access
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Fetch all summaries (using service role bypasses RLS)
    const { data: summariesData, error: summariesError } = await supabaseAdmin
      .from('summaries')
      .select('id, patient_email, sent_at, user_id');

    if (summariesError) {
      console.error('Error fetching summaries:', summariesError);
      throw summariesError;
    }

    // Count total summaries across all accounts
    const totalSummaries = summariesData?.length || 0;

    // Count unique patients impacted (summaries with emails that were sent) across all accounts
    const sentSummariesWithEmail = summariesData?.filter(s => s.sent_at && s.patient_email) || [];
    const uniqueEmails = new Set(sentSummariesWithEmail.map(s => s.patient_email));

    // Count unique providers (users) who have created summaries
    const uniqueProviders = new Set(summariesData?.map(s => s.user_id) || []);

    // Fetch feedback data from all accounts (using service role bypasses RLS)
    const { data: feedbackData, error: feedbackError } = await supabaseAdmin
      .from('feedback')
      .select('overall_rating')
      .not('overall_rating', 'is', null);

    if (feedbackError) {
      console.error('Error fetching feedback:', feedbackError);
      throw feedbackError;
    }

    let averageRating: number | null = null;
    if (feedbackData && feedbackData.length > 0) {
      const avgRating = feedbackData.reduce((sum, f) => sum + f.overall_rating, 0) / feedbackData.length;
      // Convert from 5-point scale to 10-point scale
      averageRating = avgRating * 2;
    }

    const stats: GlobalStats = {
      totalSummaries,
      patientsImpacted: uniqueEmails.size,
      averageRating,
      providersUsingLiaise: uniqueProviders.size
    };

    return new Response(
      JSON.stringify(stats),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error in get-global-stats function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
