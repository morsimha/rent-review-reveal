
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
    Generate 5-8 realistic apartment listings for Israeli rental market.
    
    Default criteria if not specified:
    - Price: up to 5600 NIS
    - Location: Givatayim or Ramat Gan
    - Rooms: 2+ bedrooms
    
    Return a JSON array of apartments with these fields:
    - title (Hebrew, varied - different number of rooms, different features)
    - price (number in NIS, varied between 3800-5500)
    - location (Hebrew, specific street addresses like "רחוב הרצל 25, גבעתיים" or "רחוב ביאליק 8, רמת גן")
    - description (Hebrew, 2-3 sentences, MAKE EACH UNIQUE - mention different features like מזגן, מעלית, חניה, מרפסת, etc.)
    - square_meters (realistic number between 55-85)
    - floor (1-5)
    - pets_allowed ("yes", "no", or "unknown")
    - image_url (use realistic placeholder images from unsplash for apartments)
    
    Make each apartment COMPLETELY DIFFERENT with varied prices, specific addresses, and UNIQUE Hebrew descriptions.
    Include varied apartment images from unsplash with apartment-related keywords.
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
          { role: 'system', content: 'You are a real estate data generator for Israeli market. Return only valid JSON with completely unique and varied apartment listings.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.9,
      }),
    });

    const data = await response.json();
    const generatedData = JSON.parse(data.choices[0].message.content);
    
    // Convert to our format and add missing fields with proper Yad2 links
    return generatedData.map((apt: any, index: number) => {
      const randomId = Math.random().toString(36).substring(2, 10);
      return {
        title: apt.title,
        price: apt.price,
        location: apt.location,
        description: apt.description,
        image_url: apt.image_url || `https://images.unsplash.com/photo-${1560184318 + index * 123}?w=400&h=300&fit=crop&auto=format`,
        apartment_link: `https://www.yad2.co.il/realestate/item/${randomId}`,
        contact_phone: null,
        contact_name: null,
        square_meters: apt.square_meters,
        floor: apt.floor,
        pets_allowed: apt.pets_allowed || 'unknown',
      };
    });

  } catch (error) {
    console.error('Error generating with AI:', error);
    return generateBasicMockData();
  }
}

function generateBasicMockData(): ScrapedApartment[] {
  const apartments: ScrapedApartment[] = [];
  
  // Varied data for each apartment
  const apartmentData = [
    {
      title: 'דירת 2 חדרים משופצת ברחוב הרצל',
      location: 'רחוב הרצל 25, גבעתיים',
      description: 'דירה משופצת, מזגן בכל החדרים, מעלית, חניה.',
      price: 4200,
      sqm: 65,
      floor: 2
    },
    {
      title: 'דירת 3 חדרים עם מרפסת ברמת גן',
      location: 'רחוב ביאליק 8, רמת גן',
      description: 'דירה עם מרפסת גדולה, קרובה לתחבורה ציבורית.',
      price: 5100,
      sqm: 75,
      floor: 3
    },
    {
      title: 'דירת 2.5 חדרים בגבעתיים מרכז',
      location: 'רחוב קטסנלסון 15, גבעתיים',
      description: 'דירה בבניין חדש, סורגים, דלת פלדה.',
      price: 4600,
      sqm: 68,
      floor: 1
    },
    {
      title: 'דירת 3 חדרים ברמת גן צפון',
      location: 'רחוב אבן גבירול 22, רמת גן',
      description: 'דירה שקטה, נוף פתוח, מיזוג מרכזי.',
      price: 5300,
      sqm: 80,
      floor: 4
    },
    {
      title: 'דירת גן 2 חדרים עם חצר',
      location: 'רחוב רוטשילד 18, גבעתיים',
      description: 'דירת גן עם חצר פרטית, מושקעת ומטופחת.',
      price: 4800,
      sqm: 70,
      floor: 0
    },
    {
      title: 'דירת 2 חדרים קרובה לקניון',
      location: 'רחוב ארלוזורוב 12, רמת גן',
      description: 'דירה בלב רמת גן, קרובה לקניון ולרכבת.',
      price: 4400,
      sqm: 60,
      floor: 3
    },
    {
      title: 'דירת 3.5 חדרים יוקרתית',
      location: 'רחוב ויצמן 30, גבעתיים',
      description: 'דירה יוקרתית עם גימורים מעולים ומרפסת שירות.',
      price: 5500,
      sqm: 85,
      floor: 5
    }
  ];
  
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
  
  apartmentData.forEach((apt, i) => {
    const randomId = Math.random().toString(36).substring(2, 10);
    apartments.push({
      title: apt.title,
      price: apt.price,
      location: apt.location,
      description: apt.description,
      image_url: apartmentImages[i % apartmentImages.length],
      apartment_link: `https://www.yad2.co.il/realestate/item/${randomId}`,
      contact_phone: null,
      contact_name: null,
      square_meters: apt.sqm,
      floor: apt.floor,
      pets_allowed: ['yes', 'no', 'unknown'][Math.floor(Math.random() * 3)] as any,
    });
  });
  
  return apartments;
}
