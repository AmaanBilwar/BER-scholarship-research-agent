import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/sponsors');
    
    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Return the data in the format expected by the frontend
    if (data.success && Array.isArray(data.sponsors)) {
      return NextResponse.json(data.sponsors);
    } else {
      return NextResponse.json(
        { error: 'Invalid data format from backend' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error fetching scholarships from backend:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scholarships from backend' },
      { status: 500 }
    );
  }
} 