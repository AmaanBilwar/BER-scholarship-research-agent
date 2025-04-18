import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/analyzed-sponsors');
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching analyzed sponsors from backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch analyzed sponsors from backend' },
      { status: 500 }
    );
  }
} 