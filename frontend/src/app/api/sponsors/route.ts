import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Proxy the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/sponsors');
    
    if (!response.ok) {
      // Try to parse as JSON first
      try {
        const errorData = await response.json();
        return NextResponse.json({ 
          success: false,
          message: errorData.message || 'Failed to fetch sponsors'
        }, { status: response.status });
      } catch (jsonError) {
        // If not JSON, it might be HTML or other format
        const text = await response.text();
        console.error('Received non-JSON response:', text.substring(0, 200) + '...');
        return NextResponse.json({ 
          success: false,
          message: `Backend error: ${response.status} ${response.statusText}. Make sure the Flask backend is running.`
        }, { status: response.status });
      }
    }
    
    // Try to parse the response as JSON
    try {
      const data = await response.json();
      return NextResponse.json(data);
    } catch (jsonError) {
      // If not JSON, it might be HTML or other format
      const text = await response.text();
      console.error('Received non-JSON response:', text.substring(0, 200) + '...');
      return NextResponse.json({ 
        success: false,
        message: 'Backend returned non-JSON response. Make sure the Flask backend is running correctly.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Error fetching sponsors from backend:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch sponsors from backend. Make sure the Flask backend is running.' },
      { status: 500 }
    );
  }
} 