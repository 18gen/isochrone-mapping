export interface Location {
  lat: number;
  lng: number;
  address?: string;
}

export interface IsochroneParams {
  location: Location;
  time: number;
  mode: 'walking' | 'driving' | 'transit';
}

export interface IsochroneData {
  id: string;
  polygon: GeoJSON.Feature<GeoJSON.Polygon>;
  params: IsochroneParams;
  color: string;
}

export interface MapboxIsochroneResponse {
  features: Array<{
    geometry: GeoJSON.Polygon;
    properties: {
      contour: number;
      color: string;
    };
  }>;
}

export interface OpenRouteServiceResponse {
  features: Array<{
    geometry: GeoJSON.Polygon;
    properties: {
      value: number;
    };
  }>;
}