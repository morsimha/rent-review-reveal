
import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/hooks/useApartments';

interface MapProps {
  apartments: Apartment[];
}

const Map: React.FC<MapProps> = ({ apartments }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Mapbox token embedded directly
  const mapboxToken = 'pk.eyJ1IjoibW9yb3k5IiwiYSI6ImNtYndnN2s5YzBrMm4ycXNkMGw3bDRtMW0ifQ.TfWPfMMUQfcjEy4OzGR9XA';

  // Store markers to clean them up when needed
  const markersRef = useRef<mapboxgl.Marker[]>([]);

  // Clear all existing markers
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (error) {
        // Ignore cleanup errors
      }
    });
    markersRef.current = [];
  };

  // Geocoding function to convert address to coordinates
  const geocodeAddress = async (location: string, token: string): Promise<[number, number] | null> => {
    if (!location || !token) return null;
    
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(location)}.json?access_token=${token}&country=IL&limit=1`
      );
      
      if (!response.ok) {
        return null;
      }
      
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        return data.features[0].center;
      }
    } catch {
      // Ignore
    }
    
    return null;
  };

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      // Set the access token
      mapboxgl.accessToken = mapboxToken;

      // Clean up map if exists
      if (map.current) {
        clearMarkers();
        map.current.remove();
        map.current = null;
      }

      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [34.7818, 32.0853],
        zoom: 11,
      });

      map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');
      
      map.current.on('load', async () => {
        await addApartmentMarkers();
        setIsLoading(false);
        toast({
          title: "המפה נטענה בהצלחה",
          description: `נוספו ${apartments.length} דירות למפה`,
        });
      });

    } catch (error) {
      setIsLoading(false);
      toast({
        title: "שגיאה בטעינת המפה",
        description: "תקלה בעת טעינת המפה. נסה שנית.",
        variant: "destructive"
      });
    }
  };

  const addApartmentMarkers = async () => {
    if (!map.current) return;
    
    // Clear existing markers first
    clearMarkers();

    // Add apartment markers
    for (const apartment of apartments) {
      if (apartment.location) {
        const coordinates = await geocodeAddress(apartment.location, mapboxToken);
        if (coordinates) {
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
              markerElement.style.backgroundColor = '#6b7280';
          }
          markerElement.innerHTML = '🏠';

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

          const marker = new mapboxgl.Marker(markerElement)
            .setLngLat(coordinates)
            .setPopup(popup)
            .addTo(map.current!);

          // Store marker reference for cleanup
          markersRef.current.push(marker);
        }
      }
    }
  };

  useEffect(() => {
    initializeMap();
    
    return () => {
      clearMarkers();
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {
          // Ignore cleanup errors
        }
        map.current = null;
      }
    };
  }, []);

  // Update markers when apartments change
  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addApartmentMarkers();
    }
  }, [apartments]);

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
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/80 rounded-lg z-30">
              <div className="text-purple-600">טוען מפה...</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default Map;
