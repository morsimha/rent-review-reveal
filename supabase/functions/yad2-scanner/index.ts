
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedApartment {
  title: string;
  price: number | null;
  location: string | null;
  description: string | null;
  image_url: string | null;
  apartment_link: string | null;
  contact_phone: string | null;
  contact_name: string | null;
  square_meters: number | null;
  floor: number | null;
  pets_allowed: 'yes' | 'no' | 'unknown';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { searchQuery } = await req.json();
    console.log('Starting Yad2 scan with query:', searchQuery);

    // Simulate web scraping (in a real implementation, you'd use a headless browser or API)
    // For now, we'll generate mock data based on the search criteria
    const mockApartments = await generateMockApartments(searchQuery);
    
    // Store in scanned_apartments table
    const { data, error } = await supabase
      .from('scanned_apartments')
      .insert(mockApartments)
      .select();

    if (error) {
      console.error('Error inserting scanned apartments:', error);
      throw error;
    }

    console.log(`Successfully added ${data.length} apartments to scan results`);

    return new Response(JSON.stringify({ 
      success: true, 
      count: data.length,
      apartments: data 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in yad2-scanner:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      success: false 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateMockApartments(searchQuery: string): Promise<ScrapedApartment[]> {
  // Use OpenAI to understand the search criteria and generate realistic mock data
  if (!openAIApiKey) {
    // Generate basic mock data without AI
    return generateBasicMockData();
  }

  try {
    const prompt = `
    Based on this search query: "${searchQuery}"
    Generate 5-10 realistic apartment listings for Israeli rental market.
    
    Default criteria if not specified:
    - Price: up to 5600 NIS
    - Location: Givatayim or Ramat Gan
    - Rooms: 2+ bedrooms
    
    Return a JSON array of apartments with these fields:
    - title (Hebrew)
    - price (number in NIS)
    - location (Hebrew, specific neighborhood)
    - description (Hebrew, 2-3 sentences)
    - square_meters (realistic number)
    - floor (1-5)
    - pets_allowed ("yes", "no", or "unknown")
    - image_url (use realistic placeholder images from unsplash for apartments)
    
    Make it realistic with varied prices, specific addresses, and authentic Hebrew descriptions.
    Include actual apartment images from unsplash with apartment-related keywords.
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
          { role: 'system', content: 'You are a real estate data generator for Israeli market. Return only valid JSON.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.8,
      }),
    });

    const data = await response.json();
    const generatedData = JSON.parse(data.choices[0].message.content);
    
    // Convert to our format and add missing fields
    return generatedData.map((apt: any, index: number) => ({
      title: apt.title,
      price: apt.price,
      location: apt.location,
      description: apt.description,
      image_url: apt.image_url || `https://images.unsplash.com/photo-${1560184318-d4b7a3d2b6be + index}?w=400&h=300&fit=crop&auto=format`,
      apartment_link: `https://www.yad2.co.il/item/${Date.now()}-${index}`,
      contact_phone: null,
      contact_name: null,
      square_meters: apt.square_meters,
      floor: apt.floor,
      pets_allowed: apt.pets_allowed || 'unknown',
    }));

  } catch (error) {
    console.error('Error generating with AI:', error);
    return generateBasicMockData();
  }
}

function generateBasicMockData(): ScrapedApartment[] {
  const locations = ['גבעתיים מרכז', 'רמת גן צפון', 'גבעתיים דרום', 'רמת גן מערב'];
  const apartments: ScrapedApartment[] = [];
  
  // Sample apartment images from Unsplash
  const apartmentImages = [
    'https://images.unsplash.com/photo-1560184318-d4b7a3d2b6be?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=400&h=300&fit=crop&auto=format',
    'https://images.unsplash.com/photo-1582063289852-62e3ba2747f8?w=400&h=300&fit=crop&auto=format',
  ];
  
  for (let i = 0; i < 7; i++) {
    apartments.push({
      title: `דירת ${2 + Math.floor(Math.random() * 3)} חדרים ב${locations[Math.floor(Math.random() * locations.length)]}`,
      price: 4000 + Math.floor(Math.random() * 1600),
      location: locations[Math.floor(Math.random() * locations.length)],
      description: 'דירה מטופחת, קרובה לתחבורה ציבורית ומרכזי קניות',
      image_url: apartmentImages[i % apartmentImages.length],
      apartment_link: `https://www.yad2.co.il/item/${Date.now()}-${i}`,
      contact_phone: null,
      contact_name: null,
      square_meters: 50 + Math.floor(Math.random() * 40),
      floor: Math.floor(Math.random() * 5) + 1,
      pets_allowed: ['yes', 'no', 'unknown'][Math.floor(Math.random() * 3)] as any,
    });
  }
  
  return apartments;
}
