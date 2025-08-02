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

export const addMarker = (
  map: mapboxgl.Map,
  lng: number,
  lat: number,
  _color: string = '#FF0000', // keep signature, but no border/bg
  iconHTML?: string
) => {
  const el = document.createElement('div');
  el.style.width = '32px';
  el.style.height = '32px';
  el.style.display = 'flex';
  el.style.alignItems = 'center';
  el.style.justifyContent = 'center';
  el.style.fontSize = '28px'; // bigger icon!
  el.style.background = 'none'; // no bg
  el.style.border = 'none';    // no border
  el.style.boxShadow = 'none'; // no shadow
  el.style.padding = '0';      // tight
  el.innerHTML = iconHTML || '<span style="color: #FF0000;">&#x1F4CD;</span>'; // default pin icon

  const marker = new mapboxgl.Marker({ element: el })
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