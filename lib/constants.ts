export const TRANSPORTATION_MODES = [
  { value: 'walking', label: '徒歩', color: '#10B981', icon: '🚶' },
  { value: 'driving', label: '車', color: '#3B82F6', icon: '🚗' },
  { value: 'transit', label: '公共交通機関', color: '#8B5CF6', icon: '🚌' }
] as const;

export const TIME_OPTIONS = [
  { value: 15, label: '15分' },
  { value: 30, label: '30分' },
  { value: 45, label: '45分' },
  { value: 60, label: '1時間' }
];

export const MAP_STYLE = 'mapbox://styles/mapbox/light-v11';
export const DEFAULT_CENTER: [number, number] = [139.7671, 35.6812]; // 東京駅
export const DEFAULT_ZOOM = 11;