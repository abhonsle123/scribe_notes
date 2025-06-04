
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { transcriptionText, transcriptionId } = await req.json();

    if (!transcriptionText || !transcriptionId) {
      throw new Error('Missing required parameters');
    }

    const apiKey = Deno.env.get('GOOGLE_AI_API_KEY');
    if (!apiKey) {
      throw new Error('Google AI API key not configured');
    }

    // Initialize Supabase client with user context
    const authHeader = req.headers.get('authorization');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');
    
    if (!authHeader || !supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } }
    });

    // Get user settings for templates
    let userSummaryTemplate = null;
    let userClinicalTemplate = null;
    
    try {
      const { data: userSettings } = await supabase
        .from('user_settings')
        .select('summary_template, custom_template, clinical_notes_template, custom_clinical_template')
        .single();

      if (userSettings) {
        console.log('User settings found:', userSettings);
        
        // Get patient summary template
        if (userSettings.summary_template === 'custom' && userSettings.custom_template) {
          userSummaryTemplate = userSettings.custom_template;
          console.log('Using inline custom summary template');
        } else if (userSettings.summary_template && userSettings.summary_template.startsWith('custom_')) {
          const customTemplateId = userSettings.summary_template.replace('custom_', '');
          const { data: customTemplateData } = await supabase
            .from('user_custom_templates')
            .select('template_content')
            .eq('id', customTemplateId)
            .single();
          
          if (customTemplateData) {
            userSummaryTemplate = customTemplateData.template_content;
            console.log('Using saved custom summary template:', customTemplateId);
          }
        } else if (userSettings.summary_template) {
          const { data: presetTemplate } = await supabase
            .from('template_presets')
            .select('template_content')
            .eq('name', userSettings.summary_template)
            .eq('is_active', true)
            .single();
          
          if (presetTemplate) {
            userSummaryTemplate = presetTemplate.template_content;
            console.log('Using preset summary template:', userSettings.summary_template);
          }
        }

        // Get clinical notes template
        if (userSettings.clinical_notes_template === 'custom' && userSettings.custom_clinical_template) {
          userClinicalTemplate = userSettings.custom_clinical_template;
          console.log('Using inline custom clinical template');
        } else if (userSettings.clinical_notes_template && userSettings.clinical_notes_template.startsWith('custom_')) {
          const customTemplateId = userSettings.clinical_notes_template.replace('custom_', '');
          const { data: customTemplateData } = await supabase
            .from('user_custom_templates')
            .select('template_content')
            .eq('id', customTemplateId)
            .single();
          
          if (customTemplateData) {
            userClinicalTemplate = customTemplateData.template_content;
            console.log('Using saved custom clinical template:', customTemplateId);
          }
        } else if (userSettings.clinical_notes_template) {
          const { data: presetTemplate } = await supabase
            .from('template_presets')
            .select('template_content')
            .eq('name', userSettings.clinical_notes_template)
            .eq('is_active', true)
            .single();
          
          if (presetTemplate) {
            userClinicalTemplate = presetTemplate.template_content;
            console.log('Using preset clinical template:', userSettings.clinical_notes_template);
          }
        }
      }
    } catch (error) {
      console.log('Could not fetch user template preferences, using defaults:', error);
    }

    // Default clinical notes template
    const defaultClinicalTemplate = `Create comprehensive clinical notes using the SOAP format:

SUBJECTIVE:
- Chief complaint and history of present illness
- Review of systems
- Past medical history, medications, allergies
- Social and family history

OBJECTIVE:
- Vital signs and physical examination findings
- Laboratory and diagnostic test results
- Mental status examination if applicable

ASSESSMENT:
- Primary and secondary diagnoses
- Clinical impression and differential diagnosis
- Risk factors and prognostic factors

PLAN:
- Treatment recommendations and interventions
- Medication management
- Follow-up instructions and monitoring
- Patient education and counseling points
- Referrals if needed

Use clear, professional medical terminology appropriate for healthcare providers.`;

    // Default patient summary template
    const defaultSummaryTemplate = `You are a medical communication specialist tasked with converting complex medical information into patient-friendly language. Your goal is to make medical information accessible while preserving all critical details.

GUIDELINES:
- Write at a 9th-grade reading level
- Use plain, empathetic language
- Explain medical terms in simple words
- Detail the purpose of procedures and medications
- Organize information into clear sections
- Preserve all critical medical information
- Use a warm, supportive tone

STRUCTURE YOUR SUMMARY WITH THESE SECTIONS:
1. **Why you came to see us:** Brief, clear explanation
2. **What we found:** Diagnosis in simple terms
3. **What we did to help:** Treatments and procedures explained
4. **How you're doing now:** Current condition
5. **What you need to do at home:** Clear care instructions
6. **Important medicines to take:** List with purposes
7. **When to come back:** Follow-up instructions
8. **Emergency signs:** When to seek immediate help`;

    const clinicalPrompt = userClinicalTemplate || defaultClinicalTemplate;
    const summaryPrompt = userSummaryTemplate || defaultSummaryTemplate;

    console.log('Using clinical template type:', userClinicalTemplate ? 'custom' : 'default');
    console.log('Using summary template type:', userSummaryTemplate ? 'custom' : 'default');

    // Generate clinical notes
    console.log('Generating clinical notes...');
    const clinicalNotesResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${clinicalPrompt}\n\nTranscription text:\n\n${transcriptionText}`
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

    if (!clinicalNotesResponse.ok) {
      const errorData = await clinicalNotesResponse.json();
      console.error('Clinical notes generation error:', errorData);
      throw new Error('Failed to generate clinical notes');
    }

    const clinicalData = await clinicalNotesResponse.json();
    const clinicalNotes = clinicalData.candidates[0].content.parts[0].text;

    // Generate patient summary
    console.log('Generating patient summary...');
    const patientSummaryResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${summaryPrompt}\n\nMedical consultation transcript:\n\n${transcriptionText}`
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

    if (!patientSummaryResponse.ok) {
      const errorData = await patientSummaryResponse.json();
      console.error('Patient summary generation error:', errorData);
      throw new Error('Failed to generate patient summary');
    }

    const summaryData = await patientSummaryResponse.json();
    const patientSummary = summaryData.candidates[0].content.parts[0].text;

    // Update the transcription record
    const { error: updateError } = await supabase
      .from('transcriptions')
      .update({
        clinical_notes: clinicalNotes,
        patient_summary: patientSummary,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptionId);

    if (updateError) {
      console.error('Error updating transcription:', updateError);
      throw new Error('Failed to save generated content');
    }

    console.log('Clinical notes and patient summary generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        clinicalNotes,
        patientSummary,
        message: 'Clinical notes and patient summary generated successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
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
