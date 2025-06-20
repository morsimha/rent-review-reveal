import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import type { Apartment } from '@/types/ApartmentTypes';

interface MapProps {
  apartments: Apartment[];
  selectedApartmentId?: string | null;
  setSelectedApartmentId?: (id: string | null) => void;
  isCompact?: boolean; // New prop for functional layout
}

type MapSize = 'half' | 'third';

const Map: React.FC<MapProps> = ({ apartments, selectedApartmentId, setSelectedApartmentId, isCompact = false }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [mapSize, setMapSize] = useState<MapSize>(isCompact ? 'third' : 'half');
  const { toast } = useToast();

  const mapboxToken = 'pk.eyJ1IjoibW9yb3k5IiwiYSI6ImNtYndnN2s5YzBrMm4ycXNkMGw3bDRtMW0ifQ.TfWPfMMUQfcjEy4OzGR9XA';

  const markersRef = useRef<{ id: string, marker: mapboxgl.Marker, popup: mapboxgl.Popup }[]>([]);
  const popupTimeoutRef = useRef<number | null>(null);

  const clearMarkers = () => {
    markersRef.current.forEach(({marker}) => {
      try {
        marker.remove();
      } catch (error) {}
    });
    markersRef.current = [];
  };

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
    } catch { }
    return null;
  };

  const addApartmentMarkers = async () => {
    if (!map.current) return;
    clearMarkers();
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
              markerElement.style.backgroundColor = '#10b981';
              break;
            case 'not_spoke':
              markerElement.style.backgroundColor = '#f59e0b';
              break;
            case 'no_answer':
              markerElement.style.backgroundColor = '#ef4444';
              break;
            default:
              markerElement.style.backgroundColor = '#6b7280';
          }
          markerElement.innerHTML = '🏠';

          const popupContent = `
          <div style="text-align: right; direction: rtl;">
            <h3 style="font-weight: bold; margin-bottom: 4px; font-size:1rem;">${apartment.title}</h3>
            ${apartment.price ? `<div style="color: #10b981; font-weight: bold; font-size:0.9rem;">₪${apartment.price}</div>` : ''}
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

          markerElement.addEventListener('click', (e) => {
            // נפתח את הפופאפ מיידית
            popup.addTo(map.current!);
            if (setSelectedApartmentId) setSelectedApartmentId(apartment.id);

            if (popupTimeoutRef.current) {
              clearTimeout(popupTimeoutRef.current);
            }
            popupTimeoutRef.current = window.setTimeout(() => {
              popup.remove();
            }, 3000);

            // נבטל Bubbling כדי למנוע קונפליקט עם אירועים אחרים
            e.stopPropagation();
          });

          markersRef.current.push({ id: apartment.id, marker, popup });
        }
      }
    }
  };

  useEffect(() => {
    if (!selectedApartmentId || !markersRef.current.length || !map.current) return;
    const match = markersRef.current.find(x => x.id === selectedApartmentId);
    if (match && match.popup && match.marker) {
      match.popup.addTo(map.current!);
      map.current.flyTo({ center: match.marker.getLngLat(), zoom: 15, speed: 1.5 });

      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
      popupTimeoutRef.current = window.setTimeout(() => {
        match.popup.remove();
      }, 3000);
    }
  }, [selectedApartmentId]);

  useEffect(() => {
    return () => {
      if (popupTimeoutRef.current) {
        clearTimeout(popupTimeoutRef.current);
      }
    };
  }, []);

  const initializeMap = async () => {
    if (!mapContainer.current || !mapboxToken) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      mapboxgl.accessToken = mapboxToken;
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
      });

    } catch (error) {
      console.error('Map initialization error:', error);
      setIsLoading(false);
      toast({
        title: "שגיאה בטעינת המפה",
        description: "תקלה בעת טעינת המפה. נסה שנית.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    initializeMap();

    return () => {
      clearMarkers();
      if (map.current) {
        try {
          map.current.remove();
        } catch (error) {}
        map.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (map.current && map.current.isStyleLoaded()) {
      addApartmentMarkers();
    }
  }, [apartments]);

  // Update map size when isCompact changes
  useEffect(() => {
    setMapSize(isCompact ? 'third' : 'half');
  }, [isCompact]);

  // Force map resize when size changes
  useEffect(() => {
    if (map.current && mapSize && isCompact) {
      // Small delay to let CSS animation complete
      const timeoutId = setTimeout(() => {
        map.current?.resize();
        // Re-center the map
        map.current?.setCenter([34.7818, 32.0853]);
      }, 350);
      
      return () => clearTimeout(timeoutId);
    }
  }, [mapSize, isCompact]);

  // Map size configurations - removed full size for compact mode
  const getSizeClasses = () => {
    switch (mapSize) {
      case 'third':
        return { wrapper: 'max-w-md', height: 'h-64' };
      case 'half':
        return { wrapper: 'max-w-2xl', height: 'h-80' };
      default:
        return { wrapper: 'max-w-2xl', height: 'h-80' };
    }
  };

  const sizeClasses = getSizeClasses();

  // Wrapper div for controlling width
  const mapContent = (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
      <CardContent className="p-0">
        <div className="relative">
          {/* Map Size Selector - Only show in compact mode with only 2 options */}
          {isCompact && (
            <div className="absolute top-2 left-2 z-10 flex gap-1">
              <button
                onClick={() => setMapSize('half')}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  mapSize === 'half' 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-white/90 hover:bg-purple-100 text-gray-700'
                }`}
                title="חצי גודל"
              >
                <span className="text-xs">📍</span>
              </button>
              <button
                onClick={() => setMapSize('third')}
                className={`p-1.5 rounded-lg transition-all duration-300 ${
                  mapSize === 'third' 
                    ? 'bg-purple-500 text-white shadow-md' 
                    : 'bg-white/90 hover:bg-purple-100 text-gray-700'
                }`}
                title="שליש גודל"
              >
                <span className="text-xs" style={{ fontSize: '0.6rem' }}>📍</span>
              </button>
            </div>
          )}

          <div ref={mapContainer} className={`w-full ${sizeClasses.height} rounded-lg`} />
          
          {/* Legend */}
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

  // Apply wrapper based on size - only in compact mode
  if (isCompact && sizeClasses.wrapper) {
    return (
      <div className={`w-full ${sizeClasses.wrapper} mx-auto transition-all duration-300`}>
        {mapContent}
      </div>
    );
  }

  return mapContent;
};

export default Map;
