
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SubmitFeedbackRequest {
  sessionId: string;
  summaryId: string | null;
  ratings: {
    overall: number;
    clarity: number;
    usefulness: number;
    accuracy: number;
    recommendation: number;
  };
  openFeedback: string | null;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    )

    const { sessionId, summaryId, ratings, openFeedback }: SubmitFeedbackRequest = await req.json();

    console.log('Submitting feedback for session:', sessionId);

    // Insert feedback into database
    const { data, error } = await supabaseClient
      .from('feedback')
      .insert({
        session_id: sessionId,
        summary_id: summaryId,
        overall_rating: ratings.overall || null,
        clarity_rating: ratings.clarity || null,
        usefulness_rating: ratings.usefulness || null,
        accuracy_rating: ratings.accuracy || null,
        recommendation_rating: ratings.recommendation || null,
        open_feedback: openFeedback,
        user_id: null // Anonymous feedback
      })
      .select()
      .single();

    if (error) {
      console.error('Error inserting feedback:', error);
      throw error;
    }

    console.log('Feedback submitted successfully:', data.id);

    return new Response(JSON.stringify({ 
      success: true,
      feedbackId: data.id
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in submit-feedback function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
