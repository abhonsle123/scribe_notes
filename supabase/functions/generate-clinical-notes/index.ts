
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { transcriptionText, transcriptionId } = await req.json();

    if (!transcriptionText || !transcriptionId) {
      throw new Error('Transcription text and ID are required');
    }

    // Generate clinical notes
    const clinicalNotesResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant that creates professional clinical notes from consultation transcriptions. 

Create comprehensive, well-structured clinical notes using proper medical terminology and SOAP format where appropriate. Include:
- Chief Complaint
- History of Present Illness
- Physical Examination findings
- Assessment and Plan
- Medications and dosages
- Follow-up instructions

Use professional medical language appropriate for healthcare providers. Be thorough but concise.`
          },
          {
            role: 'user',
            content: `Please create professional clinical notes from this patient consultation transcription:\n\n${transcriptionText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    // Generate patient-friendly summary
    const patientSummaryResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a medical AI assistant that creates patient-friendly summaries from consultation transcriptions.

Create a clear, easy-to-understand summary for the patient that includes:
- What was discussed during the visit
- Key findings in simple terms
- Treatment plan in everyday language
- Next steps and follow-up instructions
- Any medications with simple explanations

Use warm, reassuring language that patients can easily understand. Avoid medical jargon and explain any necessary medical terms in simple language.`
          },
          {
            role: 'user',
            content: `Please create a patient-friendly summary from this consultation transcription:\n\n${transcriptionText}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!clinicalNotesResponse.ok || !patientSummaryResponse.ok) {
      throw new Error('Failed to generate notes and summary');
    }

    const clinicalNotesData = await clinicalNotesResponse.json();
    const patientSummaryData = await patientSummaryResponse.json();

    const clinicalNotes = clinicalNotesData.choices[0].message.content;
    const patientSummary = patientSummaryData.choices[0].message.content;

    // Update the transcription record with the generated content
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { error: updateError } = await supabase
      .from('transcriptions')
      .update({ 
        clinical_notes: clinicalNotes,
        patient_summary: patientSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptionId)

    if (updateError) {
      throw new Error(`Failed to update transcription: ${updateError.message}`)
    }

    return new Response(
      JSON.stringify({ 
        clinicalNotes, 
        patientSummary,
        transcriptionId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-clinical-notes function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
