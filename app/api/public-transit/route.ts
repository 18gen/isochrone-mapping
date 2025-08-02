import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const { lat, lng, time } = await request.json();
    
    const openRouteServiceKey = process.env.OPENROUTE_SERVICE_KEY;
    
    if (!openRouteServiceKey) {
      return NextResponse.json(
        { error: 'OpenRouteService API key not configured' },
        { status: 500 }
      );
    }

    // OpenRouteService Isochrone API for public transport
    const url = 'https://api.openrouteservice.org/v2/isochrones/public-transport';
    
    const requestBody = {
      locations: [[lng, lat]],
      range: [time * 60], // Convert minutes to seconds
      range_type: 'time'
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': openRouteServiceKey,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`OpenRouteService API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Transform to match expected format
    const transformedData = {
      features: data.features.map((feature: any) => ({
        geometry: feature.geometry,
        properties: {
          contour: time,
          color: '#8B5CF6'
        }
      }))
    };
    
    return NextResponse.json(transformedData);
  } catch (error) {
    console.error('Public transit API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch public transit isochrone data' },
      { status: 500 }
    );
  }
}