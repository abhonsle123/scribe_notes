
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SendFollowUpEmailRequest {
  summaryId: string;
  patientEmail: string;
  patientName: string;
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

    const { summaryId, patientEmail, patientName }: SendFollowUpEmailRequest = await req.json();

    console.log('Sending follow-up email to:', patientEmail);

    // Generate a unique session ID for feedback tracking
    const sessionId = crypto.randomUUID();
    const feedbackUrl = `${Deno.env.get('SUPABASE_URL')?.replace('supabase.co', 'lovableproject.com') || 'http://localhost:5173'}/feedback?session=${sessionId}&summary=${summaryId}`;

    // Send follow-up email using Resend
    const emailResponse = await resend.emails.send({
      from: "Liaise <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "How was your Liaise experience? We'd love your feedback!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 24px; margin-bottom: 10px;">Thank you for using Liaise! 🏥</h1>
              <p style="color: #6b7280; font-size: 16px; margin: 0;">We hope your medical summary was helpful</p>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
              Hi ${patientName},
            </p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
              We hope the patient-friendly summary we created for you was clear and helpful! Your feedback is incredibly valuable to us and helps us improve our service for everyone.
            </p>
            
            <div style="background-color: #f8fafc; border: 2px solid #e5e7eb; border-radius: 8px; padding: 25px; margin: 25px 0; text-align: center;">
              <h3 style="color: #1f2937; margin-bottom: 15px; font-size: 18px;">📝 Quick Questions (2 minutes)</h3>
              <p style="color: #6b7280; margin-bottom: 20px; font-size: 14px;">Help us understand how we did with these quick questions:</p>
              
              <ul style="color: #6b7280; text-align: left; margin: 15px 0; padding-left: 20px; font-size: 14px;">
                <li>How clear was your medical summary?</li>
                <li>How useful was the information provided?</li>
                <li>How accurate did the summary seem?</li>
                <li>Would you recommend Liaise to others?</li>
              </ul>
              
              <a href="${feedbackUrl}" 
                 style="display: inline-block; background-color: #2563eb; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: bold; margin-top: 15px; font-size: 16px;">
                💭 Share Your Feedback
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; line-height: 1.5; text-align: center;">
              Your responses are anonymous and help us improve our AI-powered medical summaries.
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">
                Thank you for trusting Liaise with your healthcare communication.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 Liaise Health • All rights reserved
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Follow-up email sent successfully:", emailResponse);

    // Update the summary record to mark follow-up as sent
    const { error: updateError } = await supabaseClient
      .from('summaries')
      .update({
        follow_up_sent: true,
        follow_up_sent_at: new Date().toISOString()
      })
      .eq('id', summaryId);

    if (updateError) {
      console.error('Error updating summary record:', updateError);
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id,
      sessionId: sessionId 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-follow-up-email function:", error);
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
