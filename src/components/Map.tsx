
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/hooks/useApartments';

interface MapProps {
  apartments: Apartment[];
}

const Map: React.FC<MapProps> = ({ apartments }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState('');
  const [tokenEntered, setTokenEntered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (location: string, token: string): Promise<[number, number] | null> => {
    if (!location || !token) return null;
    
    try {
      console.log('Geocoding address:', location);
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${token}&country=IL&limit=1`
      );
      
      if (!response.ok) {
        console.error('Geocoding API error:', response.status, response.statusText);
        return null;
      }
      
      const data = await response.json();
      console.log('Geocoding response:', data);
      
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
    
    return null;
  };

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) return;

    console.log('Initializing map with token:', mapboxToken.substring(0, 10) + '...');
    setIsLoading(true);

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;
      
      // Test the token by making a simple API call
      const testResponse = await fetch(`https://api.mapbox.com/geocoding/v5/mapbox.places/test.json?access_token=${mapboxToken}&limit=1`);
      if (!testResponse.ok) {
        throw new Error('Invalid Mapbox token');
      }

      // Initialize the map
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [34.7818, 32.0853], // Tel Aviv center
        zoom: 11,
      });

      console.log('Map created successfully');

      // Add navigation controls
      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

      // Wait for map to load before adding markers
      map.current.on('load', async () => {
        console.log('Map loaded, adding apartment markers');
        
        // Add apartment markers
        for (const apartment of apartments) {
          if (apartment.location) {
            console.log('Processing apartment:', apartment.title, 'at', apartment.location);
            const coordinates = await geocodeAddress(apartment.location, mapboxToken);
            
            if (coordinates) {
              console.log('Adding marker at coordinates:', coordinates);
              
              // Create a custom marker element
              const markerElement = document.createElement('div');
              markerElement.className = 'custom-marker';
              markerElement.style.width = '30px';
              markerElement.style.height = '30px';
              markerElement.style.borderRadius = '50%';
              markerElement.style.cursor = 'pointer';
              markerElement.style.display = 'flex';
              markerElement.style.alignItems = 'center';
              markerElement.style.justifyContent = 'center';
              markerElement.style.fontSize = '16px';
              markerElement.style.fontWeight = 'bold';
              markerElement.style.color = 'white';
              markerElement.style.border = '2px solid white';
              markerElement.style.boxShadow = '0 2px 4px rgba(0,0,0,0.3)';
              
              // Set color based on status
              switch (apartment.status) {
                case 'spoke':
                  markerElement.style.backgroundColor = '#10b981'; // green
                  break;
                case 'not_spoke':
                  markerElement.style.backgroundColor = '#f59e0b'; // yellow
                  break;
                case 'no_answer':
                  markerElement.style.backgroundColor = '#ef4444'; // red
                  break;
                default:
                  markerElement.style.backgroundColor = '#6b7280'; // gray
              }
              
              markerElement.innerHTML = '🏠';

              // Create popup content
              const popupContent = `
                <div style="text-align: right; direction: rtl;">
                  <h3 style="font-weight: bold; margin-bottom: 8px;">${apartment.title}</h3>
                  ${apartment.price ? `<p style="color: #10b981; font-weight: bold;">₪${apartment.price}</p>` : ''}
                  ${apartment.description ? `<p style="margin: 4px 0;">${apartment.description}</p>` : ''}
                  ${apartment.contact_name ? `<p style="margin: 4px 0;"><strong>איש קשר:</strong> ${apartment.contact_name}</p>` : ''}
                  ${apartment.contact_phone ? `<p style="margin: 4px 0;"><strong>טלפון:</strong> ${apartment.contact_phone}</p>` : ''}
                  <div style="margin-top: 8px;">
                    ${'★'.repeat(apartment.rating)}${'☆'.repeat(5 - apartment.rating)}
                  </div>
                </div>
              `;

              const popup = new mapboxgl.Popup({
                offset: 25,
                closeButton: true,
                closeOnClick: false
              }).setHTML(popupContent);

              new mapboxgl.Marker(markerElement)
                .setLngLat(coordinates)
                .setPopup(popup)
                .addTo(map.current!);
            } else {
              console.log('Could not geocode location:', apartment.location);
            }
          }
        }
        
        setTokenEntered(true);
        setIsLoading(false);
        
        toast({
          title: "המפה נטענה בהצלחה",
          description: `נוספו ${apartments.length} דירות למפה`,
        });
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
      toast({
        title: "שגיאה בטעינת המפה",
        description: "אנא בדוק את המפתח של Mapbox ונסה שוב",
        variant: "destructive"
      });
    }
  };

  const handleTokenSubmit = () => {
    if (!mapboxToken.trim()) {
      toast({
        title: "שגיאה",
        description: "אנא הכנס מפתח Mapbox",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Token submitted, initializing map...');
    initializeMap();
  };

  useEffect(() => {
    return () => {
      if (map.current) {
        map.current.remove();
      }
    };
  }, []);

  if (!tokenEntered) {
    return (
      <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
        <CardContent className="p-6">
          <div className="text-center space-y-4" dir="rtl">
            <h3 className="text-lg font-bold text-purple-800">הגדרת מפה</h3>
            <p className="text-sm text-gray-600">
              כדי להציג את המפה, אנא הכנס את המפתח הציבורי של Mapbox
            </p>
            <p className="text-xs text-blue-600">
              ניתן לקבל מפתח חינם ב-{' '}
              <a href="https://mapbox.com" target="_blank" rel="noopener noreferrer" className="underline">
                mapbox.com
              </a>
            </p>
            <div className="flex gap-2">
              <Input
                placeholder="הכנס מפתח Mapbox"
                value={mapboxToken}
                onChange={(e) => setMapboxToken(e.target.value)}
                type="password"
                disabled={isLoading}
              />
              <Button 
                onClick={handleTokenSubmit} 
                className="bg-purple-600 hover:bg-purple-700"
                disabled={isLoading}
              >
                {isLoading ? 'טוען...' : 'הצג מפה'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="w-full h-96 rounded-lg" />
          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-lg p-2 text-xs" dir="rtl">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span>דיברנו</span>
            </div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>לא דיברנו</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>לא ענו</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
