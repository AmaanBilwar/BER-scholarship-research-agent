import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Proxy the request to the Flask backend
    const response = await fetch('http://localhost:5000/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      // Try to parse as JSON first
      try {
        const errorData = await response.json();
        return NextResponse.json({ 
          success: false,
          message: errorData.message || 'Failed to generate content'
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
      
      // The backend already saves templates to MongoDB, so we just need to return the response
      return NextResponse.json({
        success: true,
        message: data.message || 'Template generated successfully',
        template_content: data.template_content,
        template_path: data.template_path,
        template_paths: data.template_paths
      });
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
    console.error('Error generating content:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to generate content. Make sure the Flask backend is running.' },
      { status: 500 }
    );
  }
} 