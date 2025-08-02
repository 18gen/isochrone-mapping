'use client';

import { useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import Controls from '@/components/Controls';
import { Location, IsochroneParams, IsochroneData, MapboxIsochroneResponse } from '@/types';
import { TRANSPORTATION_MODES } from '@/lib/constants';

// Dynamically import MapComponent to avoid SSR issues
const MapComponent = dynamic(() => import('@/components/MapComponent'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-gray-100">
      Loading map...
    </div>
  )
});

export default function Home() {
  const [currentLocation, setCurrentLocation] = useState<Location | null>(null);
  const [isochrones, setIsochrones] = useState<IsochroneData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isControlsOpen, setIsControlsOpen] = useState(true);

  const handleLocationSelect = useCallback((location: Location) => {
    setCurrentLocation(location);
    toast.success(`場所を選択しました: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`);
  }, []);

  const handleAddIsochrone = useCallback(async (params: IsochroneParams) => {
    setIsLoading(true);
    
    try {
      let apiEndpoint = '/api/isochrone';
      let requestBody = {
        lat: params.location.lat,
        lng: params.location.lng,
        time: params.time,
        mode: params.mode
      };

      // Use different endpoint for public transit
      if (params.mode === 'transit') {
        apiEndpoint = '/api/public-transit';
      }

      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '到達圏データの取得に失敗しました');
      }

      const data: MapboxIsochroneResponse = await response.json();

      if (!data.features || data.features.length === 0) {
        throw new Error('到達圏データが返されませんでした');
      }

      // Get color for transportation mode
      const modeConfig = TRANSPORTATION_MODES.find(mode => mode.value === params.mode);
      const color = modeConfig?.color || '#000000';

      const isochroneData: IsochroneData = {
        id: `isochrone-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        polygon: {
          type: 'Feature',
          geometry: data.features[0].geometry,
          properties: data.features[0].properties
        },
        params,
        color
      };

      setIsochrones(prev => [...prev, isochroneData]);
      toast.success(`${modeConfig?.label}の到達圏を追加しました (${params.time}分)`);

    } catch (error) {
      console.error('Error fetching isochrone:', error);
      toast.error(error instanceof Error ? error.message : '到達圏の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleRemoveIsochrone = useCallback((id: string) => {
    setIsochrones(prev => prev.filter(iso => iso.id !== id));
    toast.success('到達圏を削除しました');
  }, []);

  const handleClearAll = useCallback(() => {
    setIsochrones([]);
    toast.success('すべての到達圏をクリアしました');
  }, []);

  const handleToggleControls = useCallback(() => {
    setIsControlsOpen(prev => !prev);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden">
      <MapComponent
        onLocationSelect={handleLocationSelect}
        isochrones={isochrones}
        currentLocation={currentLocation}
      />
      
      <Controls
        onAddIsochrone={handleAddIsochrone}
        onRemoveIsochrone={handleRemoveIsochrone}
        onClearAll={handleClearAll}
        isochrones={isochrones}
        currentLocation={currentLocation}
        isLoading={isLoading}
        onLocationUpdate={handleLocationSelect}
        isOpen={isControlsOpen}
        onToggle={handleToggleControls}
      />

    </div>
  );
}