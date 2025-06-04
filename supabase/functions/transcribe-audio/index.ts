
import "https://deno.land/x/xhr@0.1.0/mod.ts"
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { checkRateLimit } from '../_shared/rateLimiter.ts';
import { createSecureErrorResponse, logSecurityEvent, validateRequestSize } from '../_shared/errorHandler.ts';
import { addSecurityHeaders } from '../_shared/securityHeaders.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const secureHeaders = addSecurityHeaders(corsHeaders);

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
    return new Response('ok', { headers: secureHeaders })
  }

  try {
    // Validate request size (200MB limit for audio files)
    if (!validateRequestSize(req, 200 * 1024 * 1024)) {
      return createSecureErrorResponse('Audio file too large', 413, corsHeaders, 'transcribe-audio');
    }

    // Get the authorization header to verify user authentication
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      logSecurityEvent({
        type: 'auth_failure',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Missing authorization header'
      });
      return createSecureErrorResponse('Authentication required', 401, corsHeaders, 'transcribe-audio');
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
      logSecurityEvent({
        type: 'auth_failure',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        timestamp: new Date().toISOString(),
        details: 'Invalid authentication token'
      });
      return createSecureErrorResponse('User authentication failed', 401, corsHeaders, 'transcribe-audio');
    }

    // Check rate limiting (higher limit for transcription due to processing time)
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
      }, 'transcribe-audio');
    }

    const { audio, transcriptionId } = await req.json()
    
    if (!audio || !transcriptionId) {
      return createSecureErrorResponse('Audio data and transcription ID are required', 400, corsHeaders, 'transcribe-audio');
    }

    console.log(`Processing transcription ${transcriptionId} for user ${user.id}`);

    // Validate audio data size
    const audioSizeBytes = (audio.length * 3) / 4; // Approximate base64 to bytes
    if (audioSizeBytes > 200 * 1024 * 1024) { // 200MB limit
      return createSecureErrorResponse('Audio file too large', 400, corsHeaders, 'transcribe-audio');
    }

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
      return createSecureErrorResponse('Transcription service error', 500, corsHeaders, 'transcribe-audio');
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
      return createSecureErrorResponse('Transcription not found', 404, corsHeaders, 'transcribe-audio');
    }

    if (transcriptionData.user_id !== user.id) {
      logSecurityEvent({
        type: 'unauthorized_access',
        userId: user.id,
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        timestamp: new Date().toISOString(),
        details: `Attempted access to transcription ${transcriptionId}`
      });
      return createSecureErrorResponse('Unauthorized access', 403, corsHeaders, 'transcribe-audio');
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
      return createSecureErrorResponse('Failed to save transcription', 500, corsHeaders, 'transcribe-audio');
    }

    console.log(`Successfully updated transcription ${transcriptionId}`);

    return new Response(
      JSON.stringify({ text: transcriptionText, transcriptionId }),
      { 
        headers: { 
          ...secureHeaders, 
          'Content-Type': 'application/json',
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString()
        } 
      }
    )

  } catch (error) {
    console.error('Error in transcribe-audio function:', error)
    return createSecureErrorResponse(error, 500, corsHeaders, 'transcribe-audio');
  }
})
