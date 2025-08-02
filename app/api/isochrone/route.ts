import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, time, mode } = await request.json();
    
    const mapboxToken = process.env.MAPBOX_ACCESS_TOKEN;
    
    if (!mapboxToken) {
      return NextResponse.json(
        { error: 'Mapbox access token not configured' },
        { status: 500 }
      );
    }

    // Mapbox Isochrone API supports walking and driving
    if (mode !== 'walking' && mode !== 'driving') {
      return NextResponse.json(
        { error: 'Mapbox Isochrone API only supports walking and driving modes' },
        { status: 400 }
      );
    }

    const profile = mode === 'walking' ? 'walking' : 'driving';
    const url = `https://api.mapbox.com/isochrone/v1/mapbox/${profile}/${lng},${lat}?contours_minutes=${time}&polygons=true&access_token=${mapboxToken}`;

    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Mapbox API error: ${response.status}`);
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Isochrone API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch isochrone data' },
      { status: 500 }
    );
  }
}