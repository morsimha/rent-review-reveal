import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { load } from "https://esm.sh/cheerio@1.0.0-rc.12";

const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type'
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: corsHeaders
    });
  }

  try {
    console.log('Starting Yad2 scan request processing...');
    
    let requestBody;
    let scanParams;
    let coupleId;
    
    try {
      const text = await req.text();
      console.log('Request text:', text);
      
      if (!text || text.trim() === '') {
        console.log('Empty request body, using default parameters');
        scanParams = {
          propertyType: 'rent',
          maxPrice: '5500',
          areas: ['גבעתיים', 'רמת גן'],
          minRooms: '2',
          maxRooms: 'none'
        };
      } else {
        requestBody = JSON.parse(text);
        scanParams = requestBody.scanParams;
        coupleId = requestBody.coupleId;
        
        if (!scanParams) {
          throw new Error('scanParams missing from request body');
        }
        
        if (!coupleId) {
          throw new Error('coupleId missing from request body');
        }
      }
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return new Response(JSON.stringify({ 
        error: 'Invalid request format',
        success: false 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Scan parameters:', scanParams);
    console.log('Couple ID:', coupleId);

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

    // Add couple_id to each apartment
    const apartmentsWithCouple = scrapedApartments.map(apartment => ({
      ...apartment,
      couple_id: coupleId
    }));

    // Store in scanned_apartments table
    const { data, error } = await supabase.from('scanned_apartments').insert(apartmentsWithCouple).select();
    
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

function buildYad2SearchUrl(scanParams) {
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
  const cityMapping = {
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
      .map((area) => cityMapping[area])
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

async function scrapeYad2(url, scanParams) {
  try {
    console.log('Fetching Yad2 page:', url);
    
    // Try using a headless browser service to avoid blocking
    const scrapingBeeKey = Deno.env.get('SCRAPINGBEE_API_KEY');
    console.log('ScrapingBee API key available:', !!scrapingBeeKey);
    
    if (scrapingBeeKey) {
      const browserApiUrl = `https://api.scrapingbee.com/api/v1/?api_key=${scrapingBeeKey}&url=${encodeURIComponent(url)}&render_js=false&premium_proxy=true&country_code=il`;
      
      try {
        console.log('Trying ScrapingBee API...');
        const response = await fetch(browserApiUrl);
        
        if (response.ok) {
          const html = await response.text();
          console.log('ScrapingBee HTML fetched, length:', html.length);
          
          if (html.length > 1000) {
            const apartments = parseYad2HtmlWithCheerio(html, scanParams);
            if (apartments.length > 0) {
              console.log(`Successfully scraped ${apartments.length} apartments via ScrapingBee`);
              return apartments;
            }
          }
        }
      } catch (apiError) {
        console.log('ScrapingBee API failed:', apiError.message);
      }
    }
    
    // Fallback to direct scraping with better headers
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'he-IL,he;q=0.9,en-US;q=0.8,en;q=0.7',
          'Accept-Encoding': 'gzip, deflate, br',
          'DNT': '1',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
          'Referer': 'https://www.yad2.co.il/',
          'Origin': 'https://www.yad2.co.il'
        }
      });

      console.log(`Response status: ${response.status}`);

      if (response.ok) {
        const html = await response.text();
        console.log('HTML fetched, length:', html.length);
        
        // Check if we got a CAPTCHA or blocked page
        if (!html.includes('captcha') && !html.includes('blocked') && html.length > 1000) {
          const apartments = parseYad2HtmlWithCheerio(html, scanParams);
          if (apartments.length > 0) {
            console.log(`Successfully scraped ${apartments.length} apartments directly`);
            return apartments;
          }
        }
      }
    } catch (directError) {
      console.log('Direct scraping failed:', directError.message);
    }
    
    // Last resort: try free proxy
    console.log('Trying free proxy service...');
    return await tryProxyScraping(url, scanParams);
    
  } catch (error) {
    console.error('Error scraping Yad2:', error);
    throw error;
  }
}

async function tryProxyScraping(url, scanParams) {
  try {
    console.log('Trying proxy scraping as fallback...');
    
    // Try using a free proxy service
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    
    const response = await fetch(proxyUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('Proxy service failed');
    }
    
    const data = await response.json();
    const html = data.contents;
    
    if (!html || html.length < 1000) {
      throw new Error('Proxy returned invalid HTML');
    }
    
    console.log('Proxy scraping successful, parsing HTML...');
    return parseYad2HtmlWithCheerio(html, scanParams);
    
  } catch (proxyError) {
    console.error('Proxy scraping failed:', proxyError);
    throw new Error('יד2 חוסם גישה - נדרש פתרון קפצ\'ה או שימוש בשירות צד שלישי');
  }
}

function parseYad2HtmlWithCheerio(html, scanParams) {
  const apartments = [];

  try {
    console.log('Starting HTML parsing with Cheerio...');
    
    const $ = load(html);
    
    // Look for apartment items using various selectors
    const apartmentItems = $('.feeditem, .item, [data-item-id], .realestate-item, .listing-item');
    console.log(`Found ${apartmentItems.length} potential apartment items`);
    
    if (apartmentItems.length === 0) {
      // Try alternative selectors
      const altItems = $('a[href*="/realestate/item/"]').parent().parent();
      console.log(`Found ${altItems.length} items with alternative selector`);
      
      if (altItems.length === 0) {
        console.log('No apartment items found with any selector');
        console.log('HTML snippet (first 1000 chars):', html.substring(0, 1000));
        return [];
      }
    }
    
    // Process each apartment item
    apartmentItems.each((index, element) => {
      if (apartments.length >= 8) return; // Limit to 8 apartments
      
      const $item = $(element);
      
      // Extract link
      const linkElement = $item.find('a[href*="/realestate/item/"]').first();
      const relativeLink = linkElement.attr('href');
      if (!relativeLink) return;
      
      const fullLink = relativeLink.startsWith('http') 
        ? relativeLink 
        : `https://www.yad2.co.il${relativeLink}`;
      
      // Extract price
      const priceText = $item.find('.price, .item-price, [class*="price"]').text();
      const priceMatch = priceText.match(/₪([\d,]+)/);
      const price = priceMatch ? parseInt(priceMatch[1].replace(/,/g, '')) : null;
      
      // Extract title/description
      const title = $item.find('.title, .item-title, h3, h4').text().trim() || 
                   $item.find('a[href*="/realestate/item/"]').text().trim();
      
      // Extract location
      const location = $item.find('.location, .area, [class*="location"]').text().trim() ||
                      scanParams.areas[0] || 'לא צוין';
      
      // Extract rooms
      const roomsText = $item.find('.rooms, [class*="room"]').text();
      const roomsMatch = roomsText.match(/(\d+)/);
      const rooms = roomsMatch ? parseInt(roomsMatch[1]) : null;
      
      // Extract square meters
      const sqmText = $item.find('.sqm, [class*="sqm"], [class*="meter"]').text();
      const sqmMatch = sqmText.match(/(\d+)/);
      const squareMeters = sqmMatch ? parseInt(sqmMatch[1]) : null;
      
      // Create apartment object
      const apartment = {
        title: title || `דירה ב${location}`,
        price: price,
        location: location,
        description: `דירה ל${scanParams.propertyType === 'rent' ? 'השכרה' : 'מכירה'} ב${location}`,
        image_url: null,
        apartment_link: fullLink,
        contact_phone: null,
        contact_name: null,
        square_meters: squareMeters,
        floor: null,
        pets_allowed: 'unknown'
      };
      
      apartments.push(apartment);
    });
    
    console.log(`Created ${apartments.length} apartments using Cheerio`);
    return apartments;
    
  } catch (error) {
    console.error('Error parsing HTML with Cheerio:', error);
    return [];
  }
}
