import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { Resend } from "npm:resend@2.0.0";
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { createSecureErrorResponse, logSecurityEvent, validateRequestSize } from '../_shared/errorHandler.ts';
import { addSecurityHeaders } from '../_shared/securityHeaders.ts';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const secureHeaders = addSecurityHeaders(corsHeaders);

interface SendSummaryEmailRequest {
  summaryId: string;
  patientEmail: string;
  patientName: string;
  summaryContent: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: secureHeaders });
  }

  try {
    // Validate request size
    if (!validateRequestSize(req, 1024 * 1024)) { // 1MB limit
      return createSecureErrorResponse('Request too large', 413, corsHeaders, 'send-summary-email');
    }

    console.log('send-summary-email function called');

    // Check if RESEND_API_KEY is available
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error('RESEND_API_KEY is not set');
      return createSecureErrorResponse('Email service not configured', 500, corsHeaders, 'send-summary-email');
    }

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

    // Verify authentication
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();
    if (authError || !user) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Invalid authentication for email sending'
      });
      return createSecureErrorResponse('Authentication required', 401, corsHeaders, 'send-summary-email');
    }

    // Check rate limiting
    const rateLimitResult = checkRateLimit(req, user.id);
    if (!rateLimitResult.allowed) {
      logSecurityEvent({
        type: 'rate_limit',
        userId: user.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString()
      });
      return createSecureErrorResponse('Too many requests', 429, {
        ...corsHeaders,
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': rateLimitResult.resetTime.toString()
      }, 'send-summary-email');
    }

    const { summaryId, patientEmail, patientName, summaryContent }: SendSummaryEmailRequest = await req.json();

    console.log('Request data:', { summaryId, patientEmail, patientName: patientName ? 'Present' : 'Missing' });

    // Validate required fields
    if (!summaryId || !patientEmail || !patientName || !summaryContent) {
      console.error('Missing required fields:', { summaryId: !!summaryId, patientEmail: !!patientEmail, patientName: !!patientName, summaryContent: !!summaryContent });
      return createSecureErrorResponse('Missing required fields', 400, corsHeaders, 'send-summary-email');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      console.error('Invalid email format:', patientEmail);
      return createSecureErrorResponse('Invalid email format', 400, corsHeaders, 'send-summary-email');
    }

    // Validate content length
    if (summaryContent.length > 50000) { // 50KB limit
      return createSecureErrorResponse('Summary content too long', 400, corsHeaders, 'send-summary-email');
    }

    // Verify summary ownership
    const { data: summaryData, error: fetchError } = await supabaseClient
      .from('summaries')
      .select('user_id')
      .eq('id', summaryId)
      .single();

    if (fetchError || !summaryData) {
      return createSecureErrorResponse('Summary not found', 404, corsHeaders, 'send-summary-email');
    }

    if (summaryData.user_id !== user.id) {
      logSecurityEvent({
        type: 'unauthorized_access',
        userId: user.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Attempted to send email for summary ${summaryId}`
      });
      return createSecureErrorResponse('Unauthorized access', 403, corsHeaders, 'send-summary-email');
    }

    console.log('Sending summary email to:', patientEmail);

    // Send email using Resend with the correct default sender
    const emailResponse = await resend.emails.send({
      from: `Liaise Health <onboarding@resend.dev>`,
      to: [patientEmail],
      subject: "Your Visit Summary from Liaise",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
            <p style="color: #333; font-size: 16px; margin-bottom: 20px; line-height: 1.5;">
              Hi ${patientName},
            </p>
            
            <p style="color: #333; font-size: 16px; margin-bottom: 25px; line-height: 1.5;">
              Thank you for visiting your care provider. Below is a simplified summary of your recent medical visit, created by Liaise to help you and your loved ones better understand what happened and what to do next.
            </p>
            
            <h2 style="color: #2563eb; font-size: 18px; margin-bottom: 20px; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;">
              📄 Summary of Your Visit:
            </h2>
            
            <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 20px; margin: 20px 0; border-radius: 4px;">
              <div style="white-space: pre-line; color: #374151; line-height: 1.6; font-size: 15px;">
                ${summaryContent}
              </div>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-top: 30px; line-height: 1.5;">
              If you have any questions or need further clarification, we recommend reaching out to your healthcare provider directly.
            </p>
            
            <p style="color: #333; font-size: 16px; margin-top: 25px; margin-bottom: 30px; line-height: 1.5;">
              Stay well,<br>
              <strong>The Liaise Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">
                This message was sent securely via Liaise.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 Liaise Health • All rights reserved
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Resend API response:", emailResponse);

    // Check if email sending failed
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return createSecureErrorResponse('Email sending failed', 500, corsHeaders, 'send-summary-email');
    }

    // Ensure we have a successful response
    if (!emailResponse.data || !emailResponse.data.id) {
      console.error("No email ID in response:", emailResponse);
      return createSecureErrorResponse('Email sending failed', 500, corsHeaders, 'send-summary-email');
    }

    console.log("Email sent successfully with ID:", emailResponse.data.id);

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
      // Don't fail the request if updating the record fails, email was sent successfully
    } else {
      console.log('Summary record updated successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data.id,
      message: 'Email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...secureHeaders,
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      },
    });

  } catch (error: any) {
    console.error("Error in send-summary-email function:", error);
    return createSecureErrorResponse(error, 500, corsHeaders, 'send-summary-email');
  }
};

serve(handler);
