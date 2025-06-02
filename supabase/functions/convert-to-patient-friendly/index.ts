
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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
    const { content, notes } = await req.json();

    if (!content) {
      throw new Error('Document content is required');
    }

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    const systemPrompt = `You are a medical communication specialist tasked with converting complex medical discharge summaries into patient-friendly language. Your goal is to make medical information accessible while preserving all critical details.

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
8. **Emergency signs:** When to seek immediate help

Additional context from medical team: ${notes || 'None provided'}

Please process this discharge summary and provide both the original text and patient-friendly version:`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${content}`
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 4096,
        }
      }),
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
