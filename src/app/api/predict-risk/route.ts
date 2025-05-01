import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const data = await req.json();
        
        // Check if this is maternal or neonatal data based on the fields present
        const isMaternalData = data.gestationalAge !== undefined && data.weightChange !== undefined;
        
        // Call the appropriate prediction endpoint
        const endpoint = isMaternalData ? 
            'http://localhost:5000/predict-maternal-risk' :
            'http://localhost:3005/predict-neonatal-risk';

        const response = await fetch(endpoint, {
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
            ...(isMaternalData 
                ? { maternalConditions: prediction.maternal_conditions || {} }
                : { neonatalConditions: prediction.neonatal_conditions || {} }
            )
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