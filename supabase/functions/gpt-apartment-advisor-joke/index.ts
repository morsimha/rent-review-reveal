
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

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

    const prompt = `
כתוב בדיחה קצרה (עד 25 מילים), שנונה ורלוונטית לדירה הזו. ציין ברמז נתון ייחודי (מחיר/חדרים/קומה/שטח/ארנונה/מיקום).  
הדירה: 
- מחיר: ${apartment.price || 'לא צוין'}
- מיקום: ${apartment.location || 'לא צויין'}
- חדרים: ${apartment.rooms || 'לא צויין'}
- שטח: ${apartment.square_meters || 'לא צויין'}
- קומה: ${apartment.floor || 'לא צויינה'}
- ארנונה: ${apartment.arnona || 'לא צוינה'}
מותר גם להיות קצת פריך 🙂
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
          { role: 'system', content: 'אתה סטנדאפיסט דירות ישראלי. כתוב בדיחה חד פעמית וקצרה על דירה לפי נתוני המשתמש. שפה: עברית.' },
          { role: 'user', content: prompt }
        ],
        max_tokens: 100,
        temperature: 0.85
      }),
    });

    const data = await response.json();
    const joke = data.choices?.[0]?.message?.content ?? "לא התקבלה בדיחה. נסה שוב מאוחר יותר.";

    return new Response(JSON.stringify({ joke }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
