
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// חשוב: יש להגדיר את secret בשם OPENAI_API_KEY ב-Supabase Dashboard > Settings > Edge Functions > Secrets

serve(async (req) => {
  console.log('--- analyze-apartment-image function START ---');

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // parse body
    let body;
    try {
      body = await req.json();
      console.log('Body parsed:', JSON.stringify(body));
    } catch (parseErr) {
      return new Response(
        JSON.stringify({ error: 'Request body must be valid JSON', details: parseErr.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const { imageUrl } = body || {};
    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured. Go to Supabase Dashboard → Settings → Edge Functions → Secrets and set OPENAI_API_KEY.' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    // Prepare the OpenAI request
    const openaiReqBody = {
      model: 'gpt-4o',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: `נתח את התמונה הזו של דירה והחזר JSON עם הנתונים הבאים (רק אם הם מופיעים בתמונה):
                {
                  "title": "כותרת הדירה",
                  "price": מחיר בשקלים (מספר),
                  "location": "מיקום",
                  "square_meters": מטר רבוע (מספר),
                  "floor": קומה (מספר),
                  "description": "תיאור הדירה",
                  "contact_phone": "מספר טלפון",
                  "contact_name": "שם איש קשר",
                  "entry_date": "תאריך כניסה בפורמט YYYY-MM-DD",
                  "arnona": מחיר ארנונה (מספר),
                  "pets_allowed": "yes" או "no" או "unknown"
                }
                
                החזר רק JSON תקין ללא הסברים נוספים. אם נתון לא מופיע בתמונה, אל תכלול אותו ב-JSON.`
            },
            {
              type: 'image_url',
              image_url: { url: imageUrl }
            }
          ]
        }
      ],
      max_tokens: 500
    };

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(openaiReqBody)
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${text}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;

    if (!content) {
      throw new Error('No content received from OpenAI');
    }

    // Try to parse the JSON response
    let parsedData;
    try {
      parsedData = JSON.parse(content);
    } catch (parseError) {
      // Fallback to extracting JSON from content string
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedData = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Could not parse JSON from OpenAI response');
      }
    }

    return new Response(
      JSON.stringify({ data: parsedData }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze image', 
        details: error?.stack || error?.message || JSON.stringify(error) 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
