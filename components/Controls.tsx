'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, MapPin, Clock, Navigation, Search, X } from 'lucide-react';
import { TRANSPORTATION_MODES } from '@/lib/constants';
import { Location, IsochroneParams, IsochroneData } from '@/types';

interface ControlsProps {
  onAddIsochrone: (params: IsochroneParams) => void;
  onRemoveIsochrone: (id: string) => void;
  onClearAll: () => void;
  isochrones: IsochroneData[];
  currentLocation: Location | null;
  isLoading: boolean;
  onLocationUpdate: (location: Location) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export default function Controls({
  onAddIsochrone,
  onRemoveIsochrone,
  onClearAll,
  isochrones,
  currentLocation,
  isLoading,
  onLocationUpdate,
  isOpen,
  onToggle
}: ControlsProps) {
  const [selectedTime, setSelectedTime] = useState<number[]>([30]);
  const [selectedMode, setSelectedMode] = useState<'walking' | 'driving' | 'transit'>('walking');
  const [address, setAddress] = useState<string>('');
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = useCallback(async () => {
    if (!address.trim()) return;
    setIsSearching(true);
    try {
      const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!mapboxToken) throw new Error('地図APIキーが設定されていません');
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxToken}&country=JP&language=ja`
      );
      if (!response.ok) throw new Error('住所検索に失敗しました');
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [lng, lat] = data.features[0].center;
        const location: Location = { lat, lng, address: data.features[0].place_name };
        onLocationUpdate(location);
      } else {
        throw new Error('該当する住所が見つかりませんでした。');
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : '住所検索でエラーが発生しました');
    } finally {
      setIsSearching(false);
    }
  }, [address, onLocationUpdate]);

  const handleAddIsochrone = () => {
    if (!currentLocation) return;
    const timeValue = selectedTime[0];
    if (timeValue <= 0 || timeValue > 120) return;
    onAddIsochrone({ location: currentLocation, time: timeValue, mode: selectedMode });
  };

  const isValidTime = () => {
    const time = selectedTime[0];
    return time > 0 && time <= 120;
  };

  const formatTime = (minutes: number) => {
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const remainingMinutes = minutes % 60;
      if (remainingMinutes === 0) {
        return `${hours}時間`;
      }
      return `${hours}時間${remainingMinutes}分`;
    }
    return `${minutes}分`;
  };

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <div className="absolute top-4 left-4 z-30">
          <Button
            onClick={onToggle}
            size="icon"
            className="bg-white/80 hover:bg-gray-100 text-blue-700 shadow-lg border rounded-full p-2"
            aria-label="設定を開く"
          >
            <Navigation className="h-5 w-5" />
          </Button>
        </div>
      )}

      {/* Main controls */}
      {isOpen && (
        <div className="absolute top-4 left-4 z-30 w-[92vw] max-w-[300px] h-[90vh] rounded-2xl overflow-hidden shadow-2xl bg-white/95 border border-blue-100 flex flex-col">
          <Card className="flex flex-col h-full bg-transparent shadow-none border-0">
            {/* Header - fixed at top */}
            <CardHeader className="pb-2 pt-4 px-3 flex-shrink-0 bg-white/95 border-b border-blue-100">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-blue-700 text-lg font-bold tracking-wide">
                  <Navigation className="h-5 w-5 text-blue-400" />
                  到達エリア設定
                </CardTitle>
                <Button
                  onClick={onToggle}
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 text-gray-500 hover:text-blue-600"
                  aria-label="閉じる"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            
            {/* Content - scrollable area */}
            <CardContent className="flex-1 min-h-0 overflow-y-auto px-3 pt-4 pb-8">
              <div className="space-y-5">
                {/* 1. Active Isochrones */}
                {isochrones.length > 0 && (
                  <div className="space-y-0.5">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-blue-600 font-medium">
                      表示中 ({isochrones.length})
                    </span>
                    <Button
                      variant="link"
                      onClick={onClearAll}
                      disabled={isochrones.length === 0}
                      className="text-xs text-gray-400 hover:text-red-500 px-1 py-0 h-auto"
                      tabIndex={-1}
                      type="button"
                    >
                      クリア
                    </Button>
                  </div>
                  {isochrones.map((isochrone) => {
                    const mode = TRANSPORTATION_MODES.find(m => m.value === isochrone.params.mode);
                    const { address, lat, lng } = isochrone.params.location;
                    return (
                      <div
                        key={isochrone.id}
                        className="flex items-center gap-1.5 px-1.5 py-1 rounded hover:bg-blue-50 transition group"
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                          style={{ backgroundColor: isochrone.color }}
                        />
                        <span className="text-sm flex-shrink-0">{mode?.icon}</span>
                        <span className="font-medium text-xs text-blue-700 flex-shrink-0">{isochrone.params.time}分</span>
                        <span className="text-xs text-gray-500 truncate flex-1 min-w-0" title={address ? address : `${lat.toFixed(4)},${lng.toFixed(4)}`}>
                          {address
                            ? address.length > 15
                              ? address.slice(0, 15) + '…'
                              : address
                            : `${lat.toFixed(3)},${lng.toFixed(3)}`}
                        </span>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => onRemoveIsochrone(isochrone.id)}
                          className="p-0.5 w-5 h-5 ml-auto hover:bg-red-50 hover:text-red-600 flex-shrink-0"
                          aria-label="削除"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    );
                  })}
                  <div className="border-t border-gray-200 mt-1.5 mb-1" />
                </div>              
                )}

                {/* 2. Address Input */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">
                    出発地点を選択
                  </Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="例：岐阜県岐阜市橋本町1丁目…"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="flex-1 border-gray-200 bg-gray-50 text-xs py-1"
                    />
                    <Button
                      onClick={handleSearch}
                      disabled={!address.trim() || isSearching}
                      size="icon"
                      className="bg-blue-500 hover:bg-blue-600 text-white"
                      aria-label="住所検索"
                    >
                      {isSearching ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1 ml-1">
                    または地図をクリックして指定
                  </div>
                  {currentLocation && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-blue-700">
                      <MapPin className="h-3 w-3" />
                      <span>{currentLocation.address ? currentLocation.address : `${currentLocation.lat.toFixed(4)}, ${currentLocation.lng.toFixed(4)}`}</span>
                    </div>
                  )}
                </div>

                {/* 3. Time Selection */}
                <div>
                  <Label className="flex items-center gap-1 text-sm font-medium text-gray-700 mb-1">
                    <Clock className="h-4 w-4" />
                    移動時間
                  </Label>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xl font-bold text-blue-600">{formatTime(selectedTime[0])}</span>
                    <span className="text-xs text-gray-400">最大到達時間</span>
                  </div>
                  <Slider
                    value={selectedTime}
                    onValueChange={setSelectedTime}
                    max={120}
                    min={5}
                    step={5}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>5分</span>
                    <span>2時間</span>
                  </div>
                  <div className="flex gap-2 mt-1">
                    {[15, 30, 45, 60].map(time => (
                      <Button
                        key={time}
                        variant={selectedTime[0] === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime([time])}
                        className="flex-1 text-xs"
                      >
                        {formatTime(time)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* 4. Transportation Mode */}
                <div>
                  <Label className="block text-sm font-medium text-gray-700 mb-1">交通手段</Label>
                  <Select value={selectedMode} onValueChange={(value: any) => setSelectedMode(value)}>
                    <SelectTrigger className="bg-gray-50 border-gray-200 text-xs">
                      <SelectValue placeholder="選択してください" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRANSPORTATION_MODES.map(mode => (
                        <SelectItem key={mode.value} value={mode.value}>
                          <span className="flex items-center gap-2">
                            <span>{mode.icon}</span>
                            {mode.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 5. Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAddIsochrone}
                    disabled={!currentLocation || !isValidTime() || isLoading}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold text-base rounded-xl"
                  >
                    {isLoading ? '計算中…' : '到達エリアを追加'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}