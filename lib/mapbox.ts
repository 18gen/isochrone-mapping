import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

export const initializeMap = (container: HTMLElement, accessToken: string) => {
  mapboxgl.accessToken = accessToken;
  
  return new mapboxgl.Map({
    container,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [139.7671, 35.6812], // Tokyo Station
    zoom: 11,
    attributionControl: false,
    language: 'ja' // Set map language to Japanese
  });
};

export const addMarker = (map: mapboxgl.Map, lng: number, lat: number, color: string = '#FF0000') => {
  const marker = new mapboxgl.Marker({ color })
    .setLngLat([lng, lat])
    .addTo(map);
  
  return marker;
};

export const addIsochroneLayer = (
  map: mapboxgl.Map, 
  id: string, 
  geojson: GeoJSON.Feature<GeoJSON.Polygon>, 
  color: string
) => {
  // Remove existing layer and source if they exist
  if (map.getLayer(id)) {
    map.removeLayer(id);
  }
  if (map.getSource(id)) {
    map.removeSource(id);
  }

  // Add source
  map.addSource(id, {
    type: 'geojson',
    data: geojson
  });

  // Add fill layer
  map.addLayer({
    id,
    type: 'fill',
    source: id,
    paint: {
      'fill-color': color,
      'fill-opacity': 0.3
    }
  });

  // Add stroke layer
  map.addLayer({
    id: `${id}-stroke`,
    type: 'line',
    source: id,
    paint: {
      'line-color': color,
      'line-width': 2,
      'line-opacity': 0.8
    }
  });
};

export const removeIsochroneLayer = (map: mapboxgl.Map, id: string) => {
  if (map.getLayer(`${id}-stroke`)) {
    map.removeLayer(`${id}-stroke`);
  }
  if (map.getLayer(id)) {
    map.removeLayer(id);
  }
  if (map.getSource(id)) {
    map.removeSource(id);
  }
};