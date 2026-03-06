import { NextResponse } from 'next/server';

const FLASK_API_URL = process.env.FLASK_API_URL || 'http://localhost:5001';

export async function POST(request) {
  try {
    const body = await request.json();
    
    console.log('Diet API Request:', body);
    
    // Forward request to Flask backend
    const response = await fetch(`${FLASK_API_URL}/predict_diet`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`Flask API returned ${response.status}`);
    }

    const data = await response.json();
    console.log('Diet API Response:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Diet API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to connect to diet service' 
      },
      { status: 500 }
    );
  }
}