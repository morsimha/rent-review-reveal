
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY'); // יש לוודא secret

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
    const { apartment } = await req.json();

    // בניית prompt
    const prompt = `
בחר "האם הדירה שווה?" ותן המלצה קצרה (6-40 מילים) לפי הנתונים:
- מחיר: ${apartment.price || 'לא צוין'}
- מיקום: ${apartment.location || 'לא צויין'}
- מספר חדרים: ${apartment.square_meters ? '' : 'לא צויין'}
- שטח: ${apartment.square_meters || 'לא צויין'}
- קומה: ${apartment.floor || 'לא צויינה'}
- מקלט: ${apartment.has_shelter ? 'יש' : apartment.has_shelter === false ? 'אין' : 'לא צוין'}
- ארנונה: ${apartment.arnona || 'לא צוינה'}
- הערות: ${apartment.note || 'אין הערות'}

כתוב בעברית תשובה ברורה, קצרה ומועילה:
`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'אתה עוזר להשוות דירות בישראל ומסביר בעברית אם דירה משתלמת או אי אפשר לדעת.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.3
      }),
    });

    const data = await response.json();
    const advice = data.choices?.[0]?.message?.content ?? "לא הייתה תשובה מהבוט. נסה שוב.";

    return new Response(JSON.stringify({ advice }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
