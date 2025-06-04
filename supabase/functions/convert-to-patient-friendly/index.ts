import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { createSecureErrorResponse, logSecurityEvent, validateRequestSize } from '../_shared/errorHandler.ts';
import { addSecurityHeaders } from '../_shared/securityHeaders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const secureHeaders = addSecurityHeaders(corsHeaders);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: secureHeaders });
  }

  try {
    // Validate request size (100MB limit)
    if (!validateRequestSize(req, 100 * 1024 * 1024)) {
      return createSecureErrorResponse('Request too large', 413, corsHeaders, 'convert-to-patient-friendly');
    }

    // Verify authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Missing authorization header'
      });
      return createSecureErrorResponse('Authentication required', 401, corsHeaders, 'convert-to-patient-friendly');
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase configuration');
      return createSecureErrorResponse('Service configuration error', 500, corsHeaders, 'convert-to-patient-friendly');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Verify user authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Invalid authentication token'
      });
      return createSecureErrorResponse('Invalid authentication', 401, corsHeaders, 'convert-to-patient-friendly');
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
      }, 'convert-to-patient-friendly');
    }

    const { content, notes, fileData } = await req.json();

    // Input validation
    if (!content && !fileData) {
      return createSecureErrorResponse('Content or file data is required', 400, corsHeaders, 'convert-to-patient-friendly');
    }

    // File size validation (enhanced)
    if (fileData && fileData.data) {
      const fileSizeBytes = (fileData.data.length * 3) / 4; // Approximate base64 to bytes conversion
      const maxSizeBytes = 100 * 1024 * 1024; // 100MB
      if (fileSizeBytes > maxSizeBytes) {
        return createSecureErrorResponse('File size exceeds 100MB limit', 400, corsHeaders, 'convert-to-patient-friendly');
      }

      // Validate file type
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'text/plain'
      ];
      
      if (fileData.mimeType && !allowedMimeTypes.includes(fileData.mimeType)) {
        return createSecureErrorResponse('Unsupported file type', 400, corsHeaders, 'convert-to-patient-friendly');
      }
    }

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      console.error('Google AI API key not configured');
      return createSecureErrorResponse('Service configuration error', 500, corsHeaders, 'convert-to-patient-friendly');
    }

    let userTemplate = null;
    
    try {
      // Get user settings and template preferences
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('summary_template, custom_template')
        .single();

      if (userSettings) {
        console.log('User settings found for user:', user.id);
        
        if (userSettings.summary_template === 'custom' && userSettings.custom_template) {
          userTemplate = userSettings.custom_template;
          console.log('Using inline custom template');
        } else if (userSettings.summary_template && userSettings.summary_template.startsWith('custom_')) {
          const customTemplateId = userSettings.summary_template.replace('custom_', '');
          const { data: customTemplateData } = await supabase
            .from('user_custom_templates')
            .select('template_content')
            .eq('id', customTemplateId)
            .single();
          
          if (customTemplateData) {
            userTemplate = customTemplateData.template_content;
            console.log('Using saved custom template:', customTemplateId);
          }
        } else if (userSettings.summary_template) {
          const { data: presetTemplate } = await supabase
            .from('template_presets')
            .select('template_content')
            .eq('name', userSettings.summary_template)
            .eq('is_active', true)
            .single();
          
          if (presetTemplate) {
            userTemplate = presetTemplate.template_content;
            console.log('Using preset template:', userSettings.summary_template);
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch user template preferences, using default:', error);
    }

    let fileUri = null;
    let mimeType = null;
    let shouldUseFileUpload = false;

    // Check if we have file data and if it's a supported type for direct upload
    if (fileData && fileData.data && fileData.mimeType) {
      const supportedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
      ];

      if (supportedMimeTypes.includes(fileData.mimeType)) {
        shouldUseFileUpload = true;
        console.log('Using direct file upload for supported format:', fileData.mimeType);
        
        try {
          const fileBytes = Uint8Array.from(atob(fileData.data), c => c.charCodeAt(0));
          
          const uploadResponse = await fetch(`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'X-Goog-Upload-Protocol': 'multipart',
            },
            body: createMultipartBody(fileBytes, fileData.mimeType, fileData.name || 'document')
          });

          if (!uploadResponse.ok) {
            const errorData = await uploadResponse.text();
            console.error('File upload failed:', errorData);
            throw new Error('Failed to upload file to Gemini');
          }

          const uploadResult = await uploadResponse.json();
          fileUri = uploadResult.file.uri;
          mimeType = uploadResult.file.mimeType;
          
          console.log('File uploaded successfully:', fileUri);

          let processed = false;
          let attempts = 0;
          while (!processed && attempts < 30) {
            const statusResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${uploadResult.file.name.split('/').pop()}?key=${apiKey}`);
            const statusData = await statusResponse.json();
            
            if (statusData.state === 'ACTIVE') {
              processed = true;
            } else if (statusData.state === 'FAILED') {
              throw new Error('File processing failed');
            } else {
              await new Promise(resolve => setTimeout(resolve, 1000));
              attempts++;
            }
          }

          if (!processed) {
            throw new Error('File processing timeout');
          }
        } catch (uploadError) {
          console.error('File upload error, falling back to text content:', uploadError);
          shouldUseFileUpload = false;
          fileUri = null;
        }
      } else {
        console.log('Unsupported file type for direct upload, using text content:', fileData.mimeType);
        shouldUseFileUpload = false;
      }
    }

    const defaultSystemPrompt = `You are a medical communication specialist tasked with converting complex medical discharge summaries into patient-friendly language. Your goal is to make medical information accessible while preserving all critical details.

IMPORTANT: Your response must have TWO distinct sections:

1. FIRST SECTION - "ORIGINAL DISCHARGE REPORT":
   - Start with the heading "## ORIGINAL DISCHARGE REPORT"
   - Reproduce the complete uploaded discharge document exactly as provided
   - Do not modify, summarize, or change any text from the original

2. SECOND SECTION - "PATIENT-FRIENDLY SUMMARY":
   - Start with the heading "## PATIENT-FRIENDLY SUMMARY"
   - Convert the medical content to patient-friendly language following these guidelines:

GUIDELINES FOR PATIENT-FRIENDLY SUMMARY:
- Write at a 9th-grade reading level
- Use plain, empathetic language
- Explain medical terms in simple words
- Detail the purpose of procedures and medications
- Organize information into clear sections
- Preserve all critical medical information
- Use a warm, supportive tone

STRUCTURE YOUR PATIENT-FRIENDLY SUMMARY WITH THESE SECTIONS:
1. **Why you came to the hospital:** Brief, clear explanation
2. **What we found:** Diagnosis in simple terms
3. **What we did to help:** Treatments and procedures explained
4. **How you're doing now:** Current condition
5. **What you need to do at home:** Clear care instructions
6. **Important medicines to take:** List with purposes
7. **When to come back:** Follow-up instructions
8. **Emergency signs:** When to seek immediate help`;

    const systemPrompt = userTemplate || defaultSystemPrompt;
    console.log('Using template type:', userTemplate ? 'custom' : 'default');

    const finalPrompt = notes ? `${systemPrompt}\n\nAdditional context from medical team: ${notes}` : systemPrompt;

    const requestBody: any = {
      contents: [{
        parts: []
      }],
      generationConfig: {
        temperature: 0.3,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 4096,
      }
    };

    requestBody.contents[0].parts.push({
      text: finalPrompt
    });

    if (shouldUseFileUpload && fileUri) {
      requestBody.contents[0].parts.push({
        fileData: {
          mimeType: mimeType,
          fileUri: fileUri
        }
      });
    } else {
      const textContent = content || 'No text content provided';
      requestBody.contents[0].parts.push({
        text: `Please process this discharge summary:\n\n${textContent}`
      });
    }

    console.log('Sending request to Gemini with file reference:', shouldUseFileUpload && fileUri ? 'Yes' : 'No');

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Gemini API error:', errorData);
      return createSecureErrorResponse('Failed to generate summary', 500, corsHeaders, 'convert-to-patient-friendly');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      return createSecureErrorResponse('Invalid response from AI service', 500, corsHeaders, 'convert-to-patient-friendly');
    }

    const generatedSummary = data.candidates[0].content.parts[0].text;

    // Clean up uploaded file if we used file upload
    if (shouldUseFileUpload && fileUri) {
      try {
        await fetch(`https://generativelanguage.googleapis.com/v1beta/files/${fileUri.split('/').pop()}?key=${apiKey}`, {
          method: 'DELETE'
        });
      } catch (error) {
        console.error('Failed to delete uploaded file:', error);
      }
    }

    // Log successful operation
    console.log(`Summary generated successfully for user ${user.id}`);

    return new Response(
      JSON.stringify({ summary: generatedSummary }),
      {
        headers: { 
          ...secureHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        },
      }
    );

  } catch (error) {
    console.error('Error in convert-to-patient-friendly function:', error);
    return createSecureErrorResponse(error, 500, corsHeaders, 'convert-to-patient-friendly');
  }
});

function createMultipartBody(fileBytes: Uint8Array, mimeType: string, fileName: string): FormData {
  const formData = new FormData();
  
  const metadata = {
    file: {
      displayName: fileName,
      mimeType: mimeType
    }
  };
  
  formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
  formData.append('data', new Blob([fileBytes], { type: mimeType }));
  
  return formData;
}
