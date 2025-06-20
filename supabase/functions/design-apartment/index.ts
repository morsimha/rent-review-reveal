
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, customPrompt } = await req.json();

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: 'Image URL is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openaiApiKey) {
      return new Response(
        JSON.stringify({ error: 'OpenAI API key not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Default prompt for modern apartment design
    const defaultPrompt = "Transform this apartment into a modern, stylish space with plants, young and vibrant atmosphere, contemporary furniture, natural lighting, and fresh color scheme. Make it look like a trendy millennial apartment with Instagram-worthy aesthetics.";
    
    const finalPrompt = customPrompt && customPrompt.trim() ? customPrompt : defaultPrompt;

    console.log('Starting apartment design generation...');
    console.log('Image URL:', imageUrl);
    console.log('Prompt:', finalPrompt);

    const response = await fetch('https://api.openai.com/v1/images/generations', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-image-1',
        prompt: `Based on this apartment image: ${imageUrl}. ${finalPrompt}`,
        n: 1,
        size: '1024x1024',
        quality: 'high',
        output_format: 'png'
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenAI API error:', response.status, errorText);
      throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('OpenAI response received:', data);

    if (!data.data || !data.data[0]) {
      throw new Error('No image generated by OpenAI');
    }

    // gpt-image-1 returns base64 data directly
    const generatedImageData = data.data[0].b64_json;

    return new Response(
      JSON.stringify({ 
        success: true,
        designedImageData: generatedImageData,
        originalImageUrl: imageUrl,
        promptUsed: finalPrompt
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in design-apartment function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Failed to design apartment', 
        details: error?.message || 'Unknown error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
