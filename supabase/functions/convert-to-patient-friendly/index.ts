
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ConvertRequest {
  text: string;
  template?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, template }: ConvertRequest = await req.json();
    
    console.log('Converting text to patient-friendly format with template');

    // Get Google AI API key from environment
    const googleApiKey = Deno.env.get("GOOGLE_AI_API_KEY");
    if (!googleApiKey) {
      throw new Error("Google AI API key not configured");
    }

    // Construct the prompt with template if provided
    let prompt = `You are a medical professional tasked with converting complex medical documents into patient-friendly summaries. Your goal is to make medical information accessible and understandable to patients and their families.

Please convert the following medical text into a clear, compassionate, and easy-to-understand summary:

---
${text}
---

`;

    if (template) {
      prompt += `Please format your response using this template structure:

${template}

Replace the bracketed placeholders with appropriate content from the medical text. Make sure to:
- Use simple, non-medical language
- Explain medical terms in plain English
- Be encouraging and supportive in tone
- Include all important information from the original document
- Make it easy for patients and families to understand

`;
    } else {
      prompt += `Please format your response as a clear, well-structured summary that includes:
- Patient name (if available)
- Reason for the visit/procedure
- What was found or diagnosed
- Treatment provided
- Medications (if any)
- Follow-up instructions
- Important things to watch for

Use simple, non-medical language and be encouraging and supportive in tone.`;
    }

    // Call Google AI API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${googleApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Google AI API error:", errorText);
      throw new Error(`Google AI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Google AI API response received");

    const summary = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!summary) {
      throw new Error("No summary generated from Google AI API");
    }

    return new Response(JSON.stringify({ summary }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in convert-to-patient-friendly function:", error);
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
