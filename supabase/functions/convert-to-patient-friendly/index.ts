
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content, notes, fileData } = await req.json();

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Get user ID from the authorization header
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    let userTemplate = null;
    
    if (authHeader && supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: authHeader } }
      });
      
      try {
        // Get user settings and template preferences
        const { data: userSettings } = await supabase
          .from('user_settings')
          .select('summary_template, custom_template')
          .single();

        if (userSettings) {
          if (userSettings.summary_template === 'custom' && userSettings.custom_template) {
            userTemplate = userSettings.custom_template;
          } else if (userSettings.summary_template) {
            // Get the preset template
            const { data: presetTemplate } = await supabase
              .from('template_presets')
              .select('template_content')
              .eq('name', userSettings.summary_template)
              .eq('is_active', true)
              .single();
            
            if (presetTemplate) {
              userTemplate = presetTemplate.template_content;
            }
          }
        }
      } catch (error) {
        console.log('Could not fetch user template preferences, using default:', error);
      }
    }

    let fileUri = null;
    let mimeType = null;
    let shouldUseFileUpload = false;

    // Check if we have file data and if it's a supported type for direct upload
    if (fileData && fileData.data && fileData.mimeType) {
      // Only these MIME types are supported by Gemini for direct file upload
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
          // Convert base64 to bytes
          const fileBytes = Uint8Array.from(atob(fileData.data), c => c.charCodeAt(0));
          
          // Upload file to Gemini
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

          // Wait for file to be processed
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

    // Use user's custom template or fall back to default
    const systemPrompt = userTemplate || `You are a medical communication specialist tasked with converting complex medical discharge summaries into patient-friendly language. Your goal is to make medical information accessible while preserving all critical details.

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

    const finalPrompt = notes ? `${systemPrompt}\n\nAdditional context from medical team: ${notes}` : systemPrompt;

    // Prepare the request body
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

    // Add the system prompt
    requestBody.contents[0].parts.push({
      text: finalPrompt
    });

    // Add file reference if we have one, otherwise use text content
    if (shouldUseFileUpload && fileUri) {
      requestBody.contents[0].parts.push({
        fileData: {
          mimeType: mimeType,
          fileUri: fileUri
        }
      });
    } else {
      // Fallback to text content
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
      throw new Error('Failed to generate patient-friendly summary');
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Invalid response from Gemini API');
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

    return new Response(
      JSON.stringify({ summary: generatedSummary }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in convert-to-patient-friendly function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
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
