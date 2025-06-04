
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendSummaryEmailRequest {
  summaryId: string;
  patientEmail: string;
  patientName: string;
  summaryContent: string;
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
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    const { summaryId, patientEmail, patientName, summaryContent }: SendSummaryEmailRequest = await req.json();

    console.log('Sending summary email to:', patientEmail);

    // Send email using Resend
    const emailResponse = await resend.emails.send({
      from: "Medical Summary <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "Your Medical Summary",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #333; border-bottom: 2px solid #4F46E5; padding-bottom: 10px;">Your Medical Summary</h1>
          
          <p style="color: #666; margin-bottom: 20px;">Dear ${patientName},</p>
          
          <p style="color: #666; margin-bottom: 20px;">
            Please find your medical summary below. This has been written in easy-to-understand language 
            to help you better understand your recent medical care.
          </p>
          
          <div style="background-color: #f8f9fa; border-left: 4px solid #4F46E5; padding: 20px; margin: 20px 0;">
            <div style="white-space: pre-line; color: #333; line-height: 1.6;">
              ${summaryContent}
            </div>
          </div>
          
          <p style="color: #666; margin-top: 30px;">
            If you have any questions about this summary, please don't hesitate to contact your healthcare provider.
          </p>
          
          <p style="color: #666; margin-top: 20px;">
            Best regards,<br>
            Your Healthcare Team
          </p>
          
          <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
          <p style="color: #999; font-size: 12px;">
            This summary was generated using AI technology to convert medical language into patient-friendly terms.
            Please contact your healthcare provider if you need clarification on any medical information.
          </p>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    // Update the summary record to mark it as sent
    const { error: updateError } = await supabaseClient
      .from('summaries')
      .update({
        patient_email: patientEmail,
        sent_at: new Date().toISOString()
      })
      .eq('id', summaryId);

    if (updateError) {
      console.error('Error updating summary record:', updateError);
      // Don't fail the request if updating the record fails
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-summary-email function:", error);
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
