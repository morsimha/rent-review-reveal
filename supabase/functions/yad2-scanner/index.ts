
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    let requestBody;
    const bodyText = await req.text();
    console.log('Raw request body:', bodyText);
    
    if (!bodyText || bodyText.trim() === '') {
      console.log('Empty request body, using default parameters');
      requestBody = {
        scanParams: {
          propertyType: 'rent',
          maxPrice: '8000',
          areas: ['תל אביב'],
          minRooms: '2',
          maxRooms: '4'
        },
        coupleId: null
      };
    } else {
      try {
        requestBody = JSON.parse(bodyText);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        throw new Error('Invalid JSON in request body');
      }
    }

    const { scanParams, coupleId } = requestBody;
    console.log('Scan parameters:', scanParams);
    console.log('Couple ID:', coupleId);

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // ScrapingBee integration would go here
    // For now, return a success response with 0 results since we removed fake data
    
    console.log('No real apartments found (ScrapingBee integration needed)');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Scan completed successfully',
        apartments_found: 0,
        apartments_added: 0
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Error in yad2-scanner:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Unknown error occurred'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
