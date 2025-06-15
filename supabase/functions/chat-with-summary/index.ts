
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY')

serve(async (req) => {
  // This is needed if you're planning to invoke your function from a browser.
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { summaryContent, userMessage, chatHistory, isPublic } = await req.json()

    if (!summaryContent || !userMessage) {
      return new Response(JSON.stringify({ error: 'Missing summaryContent or userMessage' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }
    
    // Only check for auth if it's not a public request
    if (!isPublic) {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_ANON_KEY') ?? '',
        { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
      )

      const { data: { user } } = await supabaseClient.auth.getUser()
      if (!user) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 401,
          })
      }
    }

    const systemPrompt = `You are a helpful medical assistant. Your role is to answer questions about the provided medical summary in simple, easy-to-understand language.
    The medical summary is:
    ---
    ${summaryContent}
    ---
    Please adhere to the following rules:
    1.  Base your answers STRICTLY on the information given in the summary.
    2.  If the question asks for information not present in the summary (e.g., medical advice, diagnosis, prognosis, or details about conditions not mentioned), you MUST respond with: "I'm sorry, but that question is outside the scope of this summary. For any medical advice or further questions, please consult with your doctor."
    3.  Do not invent or infer any information.
    4.  Keep your answers concise and clear.`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(chatHistory || []),
      { role: 'user', content: userMessage },
    ]

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: messages,
        temperature: 0.2,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('OpenAI API error:', errorBody)
      return new Response(JSON.stringify({ error: 'Failed to get response from AI' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      })
    }

    const data = await response.json()
    const aiResponse = data.choices[0].message.content

    return new Response(JSON.stringify({ reply: aiResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error(error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
