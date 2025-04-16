import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Get the absolute path to the data directory
    const dataDir = path.join(process.cwd(), '..', 'data');
    const filePath = path.join(dataDir, 'potential_sponsors.json');
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error('Scholarship data file not found at:', filePath);
      return NextResponse.json(
        { error: 'Scholarship data file not found' },
        { status: 404 }
      );
    }
    
    // Read and parse the file
    const fileContents = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    
    // Validate data is an array
    if (!Array.isArray(data)) {
      console.error('Invalid data format: expected array, got', typeof data);
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 500 }
      );
    }
    
    // Return the data as JSON
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error reading scholarship data:', error);
    return NextResponse.json(
      { error: 'Failed to load scholarship data', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 