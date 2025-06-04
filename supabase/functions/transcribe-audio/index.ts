
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
    const { audio, transcriptionId } = await req.json()
    
    if (!audio || !transcriptionId) {
      throw new Error('Audio data and transcription ID are required')
    }

    // Get auth header to identify user
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('Authorization header required')
    }

    // Create Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user ID from auth token
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    
    if (authError || !user) {
      throw new Error('Invalid authentication')
    }

    // Process audio in chunks
    const binaryAudio = processBase64Chunks(audio)
    
    // Generate unique filename for storage
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const audioFileName = `${user.id}/${transcriptionId}-${timestamp}.webm`
    
    // Save audio file to storage
    const { error: uploadError } = await supabase.storage
      .from('audio-recordings')
      .upload(audioFileName, binaryAudio, {
        contentType: 'audio/webm',
        upsert: false
      })

    if (uploadError) {
      console.error('Error uploading audio file:', uploadError)
      // Continue with transcription even if upload fails
    }

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
      throw new Error(`OpenAI API error: ${await response.text()}`)
    }

    const result = await response.json()
    const transcriptionText = result.text

    // Update the transcription record with the text and audio file path
    const updateData: any = { 
      transcription_text: transcriptionText,
      updated_at: new Date().toISOString()
    }

    // Only set audio_file_path if upload was successful
    if (!uploadError) {
      updateData.audio_file_path = audioFileName
    }

    const { error: updateError } = await supabase
      .from('transcriptions')
      .update(updateData)
      .eq('id', transcriptionId)

    if (updateError) {
      throw new Error(`Failed to update transcription: ${updateError.message}`)
    }

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
