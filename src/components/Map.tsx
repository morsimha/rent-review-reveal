import React, { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Route, X } from 'lucide-react';
import type { Apartment } from '@/types/ApartmentTypes';

interface MapProps {
  apartments: Apartment[];
  selectedApartmentId?: string | null;
  setSelectedApartmentId?: (id: string | null) => void;
}

const Map: React.FC<MapProps> = ({ apartments, selectedApartmentId, setSelectedApartmentId }) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRoutingMode, setIsRoutingMode] = useState(false);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const { toast } = useToast();

  const mapboxToken = 'pk.eyJ1IjoibW9yb3k5IiwiYSI6ImNtYndnN2s5YzBrMm4ycXNkMGw3bDRtMW0ifQ.TfWPfMMUQfcjEy4OzGR9XA';

  const markersRef = useRef<{ id: string, marker: mapboxgl.Marker, popup: mapboxgl.Popup }[]>([]);
  const routeMarkersRef = useRef<mapboxgl.Marker[]>([]);
  const popupTimeoutRef = useRef<number | null>(null);

  const clearMarkers = () => {
    markersRef.current.forEach(({marker}) => {
      try {
        marker.remove();
      } catch (error) {}
    });
    markersRef.current = [];
  };

  const clearRouteMarkers = () => {
    routeMarkersRef.current.forEach(marker => {
      try {
        marker.remove();
      } catch (error) {}
    });
    routeMarkersRef.current = [];
  };

  const clearRoute = () => {
    if (map.current && map.current.getSource('route')) {
      map.current.removeLayer('route');
      map.current.removeSource('route');
    }
    clearRouteMarkers();
    setRoutePoints([]);
  };

  const addRouteMarker = (lngLat: [number, number], label: string) => {
    if (!map.current) return;

    const el = document.createElement('div');
    el.className = 'route-marker';
    el.style.width = '20px';
    el.style.height = '20px';
    el.style.borderRadius = '50%';
    el.style.backgroundColor = '#3b82f6';
    el.style.border = '2px solid white';
    el.style.display = 'flex';
    el.style.alignItems = 'center';
    el.style.justifyContent = 'center';
    el.style.fontSize = '12px';
    el.style.fontWeight = 'bold';
    el.style.color = 'white';
    el.textContent = label;

    const marker = new mapboxgl.Marker(el)
      .setLngLat(lngLat)
      .addTo(map.current);

    routeMarkersRef.current.push(marker);
  };

  const getRoute = async (start: [number, number], end: [number, number]) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${start[0]},${start[1]};${end[0]},${end[1]}?geometries=geojson&access_token=${mapboxToken}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to get route');
      }

      const data = await response.json();
      
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        
        // Add route layer to map
        if (map.current) {
          if (map.current.getSource('route')) {
            map.current.removeLayer('route');
            map.current.removeSource('route');
          }

          map.current.addSource('route', {
            type: 'geojson',
            data: {
              type: 'Feature',
              properties: {},
              geometry: route.geometry
            }
          });

          map.current.addLayer({
            id: 'route',
            type: 'line',
            source: 'route',
            layout: {
              'line-join': 'round',
              'line-cap': 'round'
            },
            paint: {
              'line-color': '#3b82f6',
              'line-width': 5,
              'line-opacity': 0.75
            }
          });

          // Fit map to route bounds
          const coordinates = route.geometry.coordinates;
          const bounds = new mapboxgl.LngLatBounds();
          coordinates.forEach((coord: [number, number]) => bounds.extend(coord));
          map.current.fitBounds(bounds, { padding: 50 });
        }

        const duration = Math.round(route.duration / 60);
        const distance = (route.distance / 1000).toFixed(1);
        
        toast({
          title: "מסלול נמצא!",
          description: `מרחק: ${distance} ק"מ, זמן נסיעה: ${duration} דקות`,
        });
      }
    } catch (error) {
      console.error('Error getting route:', error);
      toast({
        title: "שגיאה",
        description: "לא ניתן לחשב מסלול",
        variant: "destructive"
      });
    }
  };

  const toggleMapInteractions = (enabled: boolean) => {
    if (!map.current) return;

    if (enabled) {
      // Enable all interactions
      map.current.scrollZoom.enable();
      map.current.boxZoom.enable();
      map.current.dragRotate.enable();
      map.current.dragPan.enable();
      map.current.keyboard.enable();
      map.current.doubleClickZoom.enable();
      map.current.touchZoomRotate.enable();
    } else {
      // Disable all interactions except for double-click (which we handle manually)
      map.current.scrollZoom.disable();
      map.current.boxZoom.disable();
      map.current.dragRotate.disable();
      map.current.dragPan.disable();
      map.current.keyboard.disable();
      map.current.doubleClickZoom.disable();
      map.current.touchZoomRotate.disable();
    }
  };

  const handleMapDoubleClick = (e: mapboxgl.MapMouseEvent) => {
    console.log('Map double-clicked, routing mode:', isRoutingMode, 'route points length:', routePoints.length);
    
    if (!isRoutingMode) {
      console.log('Not in routing mode, ignoring double-click');
      return;
    }

    const lngLat: [number, number] = [e.lngLat.lng, e.lngLat.lat];
    console.log('Double-clicked coordinates:', lngLat);
    
    if (routePoints.length === 0) {
      // First point
      console.log('Setting first route point');
      setRoutePoints([lngLat]);
      addRouteMarker(lngLat, 'A');
      toast({
        title: "נקודת התחלה נבחרה",
        description: "לחץ לחיצה כפולה על המפה לבחירת נקודת הסיום",
      });
    } else if (routePoints.length === 1) {
      // Second point
      console.log('Setting second route point');
      const newPoints = [...routePoints, lngLat];
      setRoutePoints(newPoints);
      addRouteMarker(lngLat, 'B');
      
      // Calculate route
      getRoute(routePoints[0], lngLat);
    }
  };

  const toggleRoutingMode = () => {
    console.log('Toggling routing mode from:', isRoutingMode);
    if (isRoutingMode) {
      clearRoute();
      setIsRoutingMode(false);
      toggleMapInteractions(true); // Re-enable map interactions
      toast({
        title: "מצב מסלול בוטל",
        description: "חזרה למצב רגיל",
      });
    } else {
      setIsRoutingMode(true);
      setRoutePoints([]);
      toggleMapInteractions(false); // Disable map interactions
      toast({
        title: "מצב מסלול",
        description: "לחץ לחיצה כפולה על המפה לבחירת נקודת התחלה",
      });
    }
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

          markerElement.addEventListener('click', () => {
            if (setSelectedApartmentId) setSelectedApartmentId(apartment.id);
            popup.addTo(map.current!);

            if (popupTimeoutRef.current) {
              clearTimeout(popupTimeoutRef.current);
            }
            popupTimeoutRef.current = window.setTimeout(() => {
              popup.remove();
            }, 3000);
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
        clearRouteMarkers();
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

      // Add double-click handler for routing mode
      map.current.on('dblclick', handleMapDoubleClick);
      console.log('Map double-click handler added');

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
      clearRouteMarkers();
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

  return (
    <Card className="bg-white/90 backdrop-blur-sm border-purple-200">
      <CardContent className="p-0">
        <div className="relative">
          <div ref={mapContainer} className="w-full h-96 rounded-lg" />
          
          {/* Route Controls */}
          <div className="absolute top-2 left-2 flex flex-col gap-2">
            <Button
              onClick={toggleRoutingMode}
              variant={isRoutingMode ? "destructive" : "default"}
              size="sm"
              className="flex items-center gap-2"
            >
              {isRoutingMode ? (
                <>
                  <X className="w-4 h-4" />
                  ביטול מסלול
                </>
              ) : (
                <>
                  <Route className="w-4 h-4" />
                  מסלול
                </>
              )}
            </Button>
            
            {isRoutingMode && routePoints.length > 0 && (
              <Button
                onClick={clearRoute}
                variant="outline"
                size="sm"
                className="text-xs"
              >
                נקה מסלול
              </Button>
            )}
            
            {/* Status info */}
            {isRoutingMode && (
              <div className="bg-white/90 p-2 rounded text-xs">
                <div>מצב מסלול: פעיל</div>
                <div>נקודות: {routePoints.length}</div>
                <div>הוראה: לחיצה כפולה לסימון נקודות</div>
                <div className="text-orange-600 font-bold">זום והזזה מבוטלים</div>
              </div>
            )}
          </div>

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
};

export default Map;
