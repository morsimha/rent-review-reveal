import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

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
    console.log('Request method:', req.method);
    
    let searchQuery = 'דירות להשכרה עד 5600 שקלים, בגבעתיים או רמת גן, 2 חדרים ומעלה';

    // Try to read JSON body
    try {
      const requestText = await req.text();
      console.log('Request body text:', requestText);

      if (requestText && requestText.trim()) {
        const body = JSON.parse(requestText);
        if (body.searchQuery) {
          searchQuery = body.searchQuery;
        }
      }
    } catch (parseError) {
      console.log('Could not parse request body, using default search query');
    }

    console.log('Starting real Yad2 scan with query:', searchQuery);

    // Parse search criteria
    const criteria = parseSearchQuery(searchQuery);
    console.log('Parsed criteria:', criteria);

    // Try multiple scraping methods
    let apartments: ScrapedApartment[] = [];
    
    // Method 1: Try API approach
    try {
      apartments = await scrapeYad2API(criteria);
      console.log(`API scraping got ${apartments.length} apartments`);
    } catch (apiError) {
      console.error('API scraping failed:', apiError);
    }

    // Method 2: Try HTML scraping with better parsing
    if (apartments.length === 0) {
      try {
        apartments = await scrapeYad2HTML(criteria);
        console.log(`HTML scraping got ${apartments.length} apartments`);
      } catch (htmlError) {
        console.error('HTML scraping failed:', htmlError);
      }
    }

    if (apartments.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        count: 0,
        message: 'לא נמצאו דירות. ייתכן ש-Yad2 חוסמים גישה אוטומטית.',
        apartments: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store only real scraped apartments
    const { data, error } = await supabase
      .from('scanned_apartments')
      .insert(apartments)
      .select();

    if (error) {
      console.error('Error inserting scanned apartments:', error);
      throw error;
    }

    console.log(`Successfully added ${data.length} real apartments`);

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

function parseSearchQuery(query: string) {
  const criteria: any = {
    maxPrice: 5600,
    locations: ['גבעתיים', 'רמת גן'],
    minRooms: 2,
    propertyType: 'rent'
  };

  const priceMatch = query.match(/עד\s*(\d+)\s*שקל/);
  if (priceMatch) {
    criteria.maxPrice = parseInt(priceMatch[1]);
  }

  const locationMatches = query.match(/(גבעתיים|רמת גן|תל אביב|פתח תקווה|בני ברק|גבעת שמואל|קריית אונו)/g);
  if (locationMatches) {
    criteria.locations = [...new Set(locationMatches)];
  }

  const roomsMatch = query.match(/(\d+)\s*חדר/);
  if (roomsMatch) {
    criteria.minRooms = parseInt(roomsMatch[1]);
  }

  return criteria;
}

async function scrapeYad2API(criteria: any): Promise<ScrapedApartment[]> {
  const cityMapping: Record<string, number> = {
    'גבעתיים': 6300,
    'רמת גן': 8600,
    'תל אביב': 5000,
    'פתח תקווה': 7900,
    'בני ברק': 6200
  };

  const apartments: ScrapedApartment[] = [];
  const cityIds = criteria.locations
    .map((loc: string) => cityMapping[loc])
    .filter(Boolean);

  // Try Yad2 API endpoint
  const apiUrl = 'https://gw.yad2.co.il/feed-search-legacy/realestate/rent';
  
  const params = new URLSearchParams({
    'price': `0-${criteria.maxPrice}`,
    'rooms': `${criteria.minRooms}-12`,
    'page': '1'
  });

  cityIds.forEach((cityId: number) => {
    params.append('city', cityId.toString());
  });

  try {
    const response = await fetch(`${apiUrl}?${params}`, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://www.yad2.co.il/'
      }
    });

    if (response.ok) {
      const data = await response.json();
      
      if (data?.data?.feed?.feed_items) {
        for (const item of data.data.feed.feed_items.slice(0, 10)) {
          if (item.type === 'ad' && item.data) {
            const ad = item.data;
            
            apartments.push({
              title: ad.title_1 || ad.title || 'דירה להשכרה',
              price: ad.price ? parseInt(ad.price.toString().replace(/[^\d]/g, '')) : null,
              location: [ad.street, ad.neighborhood, ad.city_text].filter(Boolean).join(', '),
              description: [ad.row_3, ad.row_4, ad.HomeTypeID_text].filter(Boolean).join('. '),
              image_url: ad.images?.[0]?.src ? `https://img.yad2.co.il/Pic/${ad.images[0].src}` : null,
              apartment_link: `https://www.yad2.co.il/item/${ad.id}`,
              contact_phone: ad.mobile || ad.phone || null,
              contact_name: ad.contact_name || null,
              square_meters: ad.square_meters ? parseInt(ad.square_meters) : null,
              floor: ad.floor?.on_the_floor ? parseInt(ad.floor.on_the_floor) : null,
              pets_allowed: 'unknown'
            });
          }
        }
      }
    }
  } catch (error) {
    console.error('API fetch error:', error);
  }

  return apartments;
}

async function scrapeYad2HTML(criteria: any): Promise<ScrapedApartment[]> {
  const cityMapping: Record<string, string> = {
    'גבעתיים': '6300',
    'רמת גן': '8600',
    'תל אביב': '5000',
    'פתח תקווה': '7900',
    'בני ברק': '6200'
  };

  const apartments: ScrapedApartment[] = [];
  const cityIds = criteria.locations
    .map((loc: string) => cityMapping[loc])
    .filter(Boolean)
    .join(',');

  const url = `https://www.yad2.co.il/realestate/rent?city=${cityIds}&price=0-${criteria.maxPrice}&rooms=${criteria.minRooms}-12`;
  
  try {
    console.log('Fetching:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9',
        'Cache-Control': 'no-cache'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Use DOM parser for better extraction
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    if (!doc) {
      throw new Error('Failed to parse HTML');
    }

    // Try to find apartments using JSON-LD data
    const scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (const script of scripts) {
      try {
        const jsonData = JSON.parse(script.textContent || '{}');
        if (jsonData['@type'] === 'ItemList' && jsonData.itemListElement) {
          for (const item of jsonData.itemListElement.slice(0, 10)) {
            if (item.url && item.name) {
              apartments.push({
                title: item.name,
                price: null,
                location: criteria.locations[0],
                description: '',
                image_url: null,
                apartment_link: item.url,
                contact_phone: null,
                contact_name: null,
                square_meters: null,
                floor: null,
                pets_allowed: 'unknown'
              });
            }
          }
        }
      } catch (e) {
        console.log('Could not parse JSON-LD');
      }
    }

    // If no JSON-LD, try regex extraction
    if (apartments.length === 0) {
      // Extract links more carefully
      const linkMatches = html.matchAll(/href="(\/realestate\/item\/[a-zA-Z0-9]+)"/g);
      const uniqueLinks = new Set<string>();
      
      for (const match of linkMatches) {
        uniqueLinks.add(`https://www.yad2.co.il${match[1]}`);
        if (uniqueLinks.size >= 10) break;
      }

      // Extract apartment data near each link
      for (const link of uniqueLinks) {
        const itemId = link.split('/').pop();
        
        // Try to find price near this item
        const pricePattern = new RegExp(`id="${itemId}"[^>]*>[\\s\\S]*?₪\\s*([\\d,]+)`, 'i');
        const priceMatch = html.match(pricePattern);
        
        apartments.push({
          title: 'דירה להשכרה',
          price: priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null,
          location: criteria.locations[0],
          description: '',
          image_url: null,
          apartment_link: link,
          contact_phone: null,
          contact_name: null,
          square_meters: null,
          floor: null,
          pets_allowed: 'unknown'
        });
      }
    }

  } catch (error) {
    console.error('HTML scraping error:', error);
  }

  return apartments;
}
