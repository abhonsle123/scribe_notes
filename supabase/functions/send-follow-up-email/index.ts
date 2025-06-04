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

interface SendFollowUpEmailRequest {
  summaryId: string;
  patientEmail: string;
  patientName: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: secureHeaders });
  }

  try {
    // Validate request size
    if (!validateRequestSize(req, 1024 * 1024)) { // 1MB limit
      return createSecureErrorResponse('Request too large', 413, corsHeaders, 'send-follow-up-email');
    }

    console.log('send-follow-up-email function called');

    // Check if RESEND_API_KEY is available
    if (!Deno.env.get("RESEND_API_KEY")) {
      console.error('RESEND_API_KEY is not set');
      return createSecureErrorResponse('Email service not configured', 500, corsHeaders, 'send-follow-up-email');
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
        details: 'Invalid authentication for follow-up email'
      });
      return createSecureErrorResponse('Authentication required', 401, corsHeaders, 'send-follow-up-email');
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
      }, 'send-follow-up-email');
    }

    const { summaryId, patientEmail, patientName }: SendFollowUpEmailRequest = await req.json();

    console.log('Request data:', { summaryId, patientEmail, patientName: patientName ? 'Present' : 'Missing' });

    // Validate required fields
    if (!summaryId || !patientEmail || !patientName) {
      console.error('Missing required fields:', { summaryId: !!summaryId, patientEmail: !!patientEmail, patientName: !!patientName });
      return createSecureErrorResponse('Missing required fields', 400, corsHeaders, 'send-follow-up-email');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(patientEmail)) {
      console.error('Invalid email format:', patientEmail);
      return createSecureErrorResponse('Invalid email format', 400, corsHeaders, 'send-follow-up-email');
    }

    // Verify summary ownership
    const { data: summaryData, error: fetchError } = await supabaseClient
      .from('summaries')
      .select('user_id')
      .eq('id', summaryId)
      .single();

    if (fetchError || !summaryData) {
      return createSecureErrorResponse('Summary not found', 404, corsHeaders, 'send-follow-up-email');
    }

    if (summaryData.user_id !== user.id) {
      logSecurityEvent({
        type: 'unauthorized_access',
        userId: user.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Attempted to send follow-up email for summary ${summaryId}`
      });
      return createSecureErrorResponse('Unauthorized access', 403, corsHeaders, 'send-follow-up-email');
    }

    console.log('Sending follow-up email to:', patientEmail);

    // Generate a unique session ID for anonymous feedback tracking
    const sessionId = crypto.randomUUID();
    
    // Get the current site URL from environment or use a default
    const siteUrl = Deno.env.get('SITE_URL') || 'https://cb8d86d1-de8e-43f9-a05b-3459f4f1b848.lovableproject.com';
    const feedbackUrl = `${siteUrl}/feedback?session=${sessionId}&summary=${summaryId}`;

    console.log('Generated feedback URL:', feedbackUrl);

    // Send follow-up email using Resend with the correct default sender
    const emailResponse = await resend.emails.send({
      from: "Liaise Health <onboarding@resend.dev>",
      to: [patientEmail],
      subject: "How was your experience with Liaise? We'd love your feedback!",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #2563eb; font-size: 28px; margin: 0;">Thank You, ${patientName}!</h1>
            </div>
            
            <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
              We hope your AI-generated medical summary from Liaise helped you better understand your recent visit. Your health journey matters to us, and we're committed to making medical information more accessible.
            </p>
            
            <div style="background-color: #f0f7ff; border-left: 4px solid #2563eb; padding: 20px; margin: 25px 0; border-radius: 8px;">
              <h3 style="color: #2563eb; margin: 0 0 15px 0; font-size: 18px;">📝 Help Us Improve</h3>
              <p style="color: #555; margin: 0; line-height: 1.5;">
                Your feedback is invaluable! Please take 2 minutes to share your experience with our AI summary service. Your insights help us serve patients like you even better.
              </p>
            </div>
            
            <div style="text-align: center; margin: 35px 0;">
              <a href="${feedbackUrl}" 
                 style="background-color: #2563eb; color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 2px 4px rgba(37, 99, 235, 0.3);">
                📋 Share Your Feedback
              </a>
            </div>
            
            <div style="background-color: #fafafa; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #333; margin: 0 0 10px 0;">What we'll ask you:</h4>
              <ul style="color: #666; margin: 0; padding-left: 20px; line-height: 1.6;">
                <li>Did you use the AI chatbox?</li>
                <li>How easy was your summary to read?</li>
                <li>How useful was the information?</li>
                <li>How accurate did it seem?</li>
                <li>Overall satisfaction with Liaise</li>
              </ul>
            </div>
            
            <p style="color: #333; font-size: 16px; margin-top: 30px; line-height: 1.5;">
              Thank you for trusting Liaise with your healthcare communication needs. Together, we're making medical information more understandable for everyone.
            </p>
            
            <p style="color: #333; font-size: 16px; margin-top: 25px; margin-bottom: 0; line-height: 1.5;">
              Best regards,<br>
              <strong>The Liaise Team</strong>
            </p>
            
            <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 30px 0;">
            
            <div style="text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin-bottom: 5px;">
                This feedback request was sent securely via Liaise.
              </p>
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                © 2025 Liaise Health • All rights reserved
              </p>
            </div>
          </div>
        </div>
      `,
    });

    console.log("Follow-up email response:", emailResponse);

    // Check if email sending failed
    if (emailResponse.error) {
      console.error("Resend API error:", emailResponse.error);
      return createSecureErrorResponse('Email sending failed', 500, corsHeaders, 'send-follow-up-email');
    }

    // Ensure we have a successful response
    if (!emailResponse.data || !emailResponse.data.id) {
      console.error("No email ID in response:", emailResponse);
      return createSecureErrorResponse('Email sending failed', 500, corsHeaders, 'send-follow-up-email');
    }

    console.log("Follow-up email sent successfully with ID:", emailResponse.data.id);

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
      // Don't fail the request if updating the record fails, email was sent successfully
    } else {
      console.log('Summary record updated successfully');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data.id,
      sessionId: sessionId,
      feedbackUrl: feedbackUrl,
      message: 'Follow-up email sent successfully'
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...secureHeaders,
        'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
      },
    });
  } catch (error: any) {
    console.error("Error in send-follow-up-email function:", error);
    return createSecureErrorResponse(error, 500, corsHeaders, 'send-follow-up-email');
  }
};

serve(handler);
