import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const data = await request.json();
    
    // Send the data to the Python backend
    const response = await fetch('http://localhost:5000/predict-maternal-risk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to get prediction from backend');
    }

    const prediction = await response.json();
    
    // Transform the prediction into the expected format
    const riskLevel = {
      level: prediction.risk_level.toLowerCase(),
      score: prediction.risk_score,
      recommendations: prediction.recommendations || [],
      maternalConditions: prediction.maternal_conditions || {}
    };

    return NextResponse.json(riskLevel);
  } catch (error) {
    console.error('Error in risk prediction:', error);
    return NextResponse.json(
      { error: 'Failed to process risk prediction' },
      { status: 500 }
    );
  }
}