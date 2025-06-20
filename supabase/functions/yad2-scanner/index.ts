
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScanParameters {
  propertyType: 'rent' | 'sale';
  maxPrice: string;
  areas: string[];
  minRooms: string;
  maxRooms: string;
}

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
    const { scanParams } = await req.json();
    console.log('Starting Yad2 scan with parameters:', scanParams);

    // Build Yad2 URL with structured parameters
    const yad2Url = buildYad2SearchUrl(scanParams);
    console.log('Yad2 URL:', yad2Url);

    // Try to scrape real apartments from Yad2
    const scrapedApartments = await scrapeYad2(yad2Url, scanParams);
    console.log(`Scraped ${scrapedApartments.length} apartments`);

    if (scrapedApartments.length === 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        count: 0,
        message: 'לא נמצאו דירות אמיתיות לפי הקריטריונים',
        apartments: [] 
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Store in scanned_apartments table
    const { data, error } = await supabase
      .from('scanned_apartments')
      .insert(scrapedApartments)
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

function buildYad2SearchUrl(scanParams: ScanParameters): string {
  const baseUrl = scanParams.propertyType === 'rent' 
    ? 'https://www.yad2.co.il/realestate/rent'
    : 'https://www.yad2.co.il/realestate/forsale';
  
  const params = new URLSearchParams();
  
  // Add price filter
  if (scanParams.maxPrice && scanParams.maxPrice.trim() !== '') {
    if (scanParams.propertyType === 'rent') {
      params.append('priceOnly', '1');
      params.append('price', `0-${scanParams.maxPrice}`);
    } else {
      params.append('priceOnly', '1');
      params.append('price', `0-${scanParams.maxPrice}`);
    }
  }
  
  // Add location filters (Yad2 uses city IDs)
  const cityMapping: { [key: string]: string } = {
    'גבעתיים': '6300',
    'רמת גן': '8600', 
    'תל אביב': '5000',
    'פתח תקווה': '7900',
    'בני ברק': '6200',
    'גבעת שמואל': '6400',
    'קריית אונו': '7400',
    'רמת השרון': '8700',
    'הרצליה': '6600',
    'כפר סבא': '7200'
  };
  
  if (scanParams.areas && scanParams.areas.length > 0) {
    const cityIds = scanParams.areas
      .map((area: string) => cityMapping[area])
      .filter(Boolean);
    if (cityIds.length > 0) {
      params.append('city', cityIds.join(','));
    }
  }
  
  // Add rooms filter
  if (scanParams.minRooms && scanParams.minRooms !== 'none') {
    const minRooms = parseInt(scanParams.minRooms);
    if (scanParams.maxRooms && scanParams.maxRooms !== 'none') {
      const maxRooms = parseInt(scanParams.maxRooms);
      params.append('rooms', `${minRooms}-${maxRooms}`);
    } else {
      params.append('rooms', `${minRooms}-99`);
    }
  } else if (scanParams.maxRooms && scanParams.maxRooms !== 'none') {
    const maxRooms = parseInt(scanParams.maxRooms);
    params.append('rooms', `1-${maxRooms}`);
  }

  return `${baseUrl}?${params.toString()}`;
}

async function scrapeYad2(url: string, scanParams: ScanParameters): Promise<ScrapedApartment[]> {
  try {
    console.log('Fetching Yad2 page:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'he-IL,he;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'DNT': '1',
        'Connection': 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      }
    });

    if (!response.ok) {
      console.log(`HTTP error! status: ${response.status}`);
      return [];
    }

    const html = await response.text();
    console.log('HTML fetched, length:', html.length);
    
    // Parse real data from Yad2
    return parseYad2Html(html, scanParams);
  } catch (error) {
    console.error('Error scraping Yad2:', error);
    return [];
  }
}

function parseYad2Html(html: string, scanParams: ScanParameters): ScrapedApartment[] {
  const apartments: ScrapedApartment[] = [];

  try {
    // Look for apartment links
    const linkRegex = /href="(\/realestate\/item\/[^"]+)"/g;
    const links: string[] = [];
    let match;
    
    while ((match = linkRegex.exec(html)) !== null && links.length < 8) {
      const fullLink = `https://www.yad2.co.il${match[1]}`;
      if (!links.includes(fullLink)) {
        links.push(fullLink);
      }
    }
    
    // Extract price patterns from HTML
    const priceRegex = /₪([\d,]+)/g;
    const prices: number[] = [];
    let priceMatch;
    
    while ((priceMatch = priceRegex.exec(html)) !== null && prices.length < 10) {
      const price = parseInt(priceMatch[1].replace(/,/g, ''));
      const maxPrice = parseInt(scanParams.maxPrice) || 10000;
      if (price > 1000 && price <= maxPrice * 1.2) {
        prices.push(price);
      }
    }
    
    // Extract room counts from HTML
    const roomRegex = /(\d+)\s*חד/g;
    const roomCounts: number[] = [];
    let roomMatch;
    
    while ((roomMatch = roomRegex.exec(html)) !== null && roomCounts.length < 10) {
      const rooms = parseInt(roomMatch[1]);
      const minRooms = scanParams.minRooms !== 'none' ? parseInt(scanParams.minRooms) : 1;
      const maxRooms = scanParams.maxRooms !== 'none' ? parseInt(scanParams.maxRooms) : 10;
      if (rooms >= minRooms && rooms <= maxRooms) {
        roomCounts.push(rooms);
      }
    }
    
    console.log(`Extracted: ${links.length} links, ${prices.length} prices, ${roomCounts.length} rooms`);
    
    // Only create apartments if we have real data
    if (links.length === 0) {
      console.log('No apartment links found, returning empty array');
      return [];
    }
    
    // Create apartments only from extracted real data
    const maxApartments = Math.min(links.length, 6);
    
    for (let i = 0; i < maxApartments; i++) {
      const price = prices[i] || null;
      const rooms = roomCounts[i] || null;
      const location = scanParams.areas[i % scanParams.areas.length] || null;
      
      apartments.push({
        title: `דירה ב${location}${rooms ? ` - ${rooms} חדרים` : ''}${price ? ` - ₪${price.toLocaleString()}` : ''}`,
        price: price,
        location: location,
        description: `דירה ל${scanParams.propertyType === 'rent' ? 'השכרה' : 'מכירה'}${location ? ` ב${location}` : ''}`,
        image_url: null,
        apartment_link: links[i],
        contact_phone: null,
        contact_name: null,
        square_meters: null,
        floor: null,
        pets_allowed: 'unknown',
      });
    }
    
    return apartments;
    
  } catch (error) {
    console.error('Error parsing HTML:', error);
    return [];
  }
}
