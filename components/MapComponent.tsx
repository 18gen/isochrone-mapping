'use client';

import { useEffect, useRef, useMemo } from 'react';
import mapboxgl from 'mapbox-gl';
import { initializeMap, addMarker, addIsochroneLayer, removeIsochroneLayer } from '@/lib/mapbox';
import { Location, IsochroneData } from '@/types';

interface MapComponentProps {
  onLocationSelect: (location: Location) => void;
  isochrones: IsochroneData[];
  currentLocation: Location | null;
}

export default function MapComponent({ onLocationSelect, isochrones, currentLocation }: MapComponentProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const currentMarkerRef = useRef<mapboxgl.Marker | null>(null);

  
  // Memoize the token to prevent re-renders
  const mapboxToken = useMemo(() => {
    return process.env.NEXT_PUBLIC_MAPBOX_TOKEN || '';
  }, []);

  useEffect(() => {
    if (!mapContainerRef.current || !mapboxToken) return;

    try {
      const map = initializeMap(mapContainerRef.current, mapboxToken);
      mapRef.current = map;

      // Add click handler
      map.on('click', (e) => {
        const { lng, lat } = e.lngLat;
        onLocationSelect({ lat, lng });
      });

      // Add navigation controls
      map.addControl(new mapboxgl.NavigationControl(), 'top-right');

      return () => {
        map.remove();
      };
    } catch (error) {
      console.error('Error initializing map:', error);
    }
  }, [mapboxToken, onLocationSelect]);

  // Update marker when currentLocation changes
  useEffect(() => {
    if (!mapRef.current || !currentLocation) return;

    const map = mapRef.current;

    // Remove existing current location marker
    if (currentMarkerRef.current) {
      currentMarkerRef.current.remove();
    }

    // Add new marker at current location
    const marker = addMarker(map, currentLocation.lng, currentLocation.lat, '#FF0000');
    currentMarkerRef.current = marker;

    // Center map on new location
    map.flyTo({
      center: [currentLocation.lng, currentLocation.lat],
      zoom: 14,
      duration: 1000
    });
  }, [currentLocation]);

  // Update isochrones on map
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;

    // Wait for map to load
    if (!map.isStyleLoaded()) {
      map.on('load', () => updateIsochrones());
    } else {
      updateIsochrones();
    }

    function updateIsochrones() {
      // Remove all existing isochrone layers
      const style = map.getStyle();
      if (style?.layers) {
        style.layers.forEach(layer => {
          if (layer.id.startsWith('isochrone-')) {
            removeIsochroneLayer(map, layer.id.replace('-stroke', ''));
          }
        });
      }

      // Add current isochrones
      isochrones.forEach(isochrone => {
        addIsochroneLayer(map, isochrone.id, isochrone.polygon, isochrone.color);
      });
    }
  }, [isochrones]);

  if (!mapboxToken) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100">
        <div className="text-center p-8 max-w-md">
          <h3 className="text-lg font-semibold mb-4">Mapboxトークンが必要です</h3>
          <p className="text-sm text-gray-600 mb-4">
            このアプリケーションを使用するには、環境変数にMapboxアクセストークンを設定する必要があります。
          </p>
          <p className="text-xs text-gray-500">
            .env.localファイルに<code>NEXT_PUBLIC_MAPBOX_TOKEN</code>を設定してください
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full" 
      style={{ minHeight: '500px' }}
    />
  );
}