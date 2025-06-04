
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Process base64 in chunks to prevent memory issues
function processBase64Chunks(base64String: string, chunkSize = 32768) {
  const chunks: Uint8Array[] = [];
  let position = 0;
  
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    
    chunks.push(bytes);
    position += chunkSize;
  }

  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;

  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }

  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header to verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      throw new Error('Authorization header is required');
    }

    // Initialize Supabase client with the user's auth token
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: {
            authorization: authHeader,
          },
        },
      }
    );

    // Verify the user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('Authentication error:', authError);
      throw new Error('User authentication failed');
    }

    const { audio, transcriptionId } = await req.json()
    
    if (!audio || !transcriptionId) {
      throw new Error('Audio data and transcription ID are required')
    }

    console.log(`Processing transcription ${transcriptionId} for user ${user.id}`);

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    // Prepare form data for Whisper
    const formData = new FormData()
    const blob = new Blob([binaryAudio], { type: 'audio/webm' })
    formData.append('file', blob, 'audio.webm')
    formData.append('model', 'whisper-1')

    // Send to OpenAI Whisper
    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${errorText}`);
    }

    const result = await response.json()
    const transcriptionText = result.text

    console.log(`Transcription completed for ${transcriptionId}, updating database...`);

    // Update the transcription record with the text using service role key for RLS bypass
    const supabaseServiceRole = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // First verify the transcription belongs to the authenticated user
    const { data: transcriptionData, error: fetchError } = await supabase
      .from('transcriptions')
      .select('user_id')
      .eq('id', transcriptionId)
      .single()

    if (fetchError) {
      console.error('Error fetching transcription:', fetchError);
      throw new Error(`Failed to verify transcription ownership: ${fetchError.message}`);
    }

    if (transcriptionData.user_id !== user.id) {
      throw new Error('Unauthorized: Transcription does not belong to authenticated user');
    }

    // Update the transcription with service role to bypass RLS
    const { error: updateError } = await supabaseServiceRole
      .from('transcriptions')
      .update({ 
        transcription_text: transcriptionText,
        updated_at: new Date().toISOString()
      })
      .eq('id', transcriptionId)
      .eq('user_id', user.id) // Extra security check

    if (updateError) {
      console.error('Database update error:', updateError);
      throw new Error(`Failed to update transcription: ${updateError.message}`);
    }

    console.log(`Successfully updated transcription ${transcriptionId}`);

    return new Response(
      JSON.stringify({ text: transcriptionText, transcriptionId }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in transcribe-audio function:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
