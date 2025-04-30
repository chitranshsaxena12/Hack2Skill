import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const weekNumber = searchParams.get('week');

    if (!weekNumber) {
        return NextResponse.json({ error: 'Week number is required' }, { status: 400 });
    }

    try {
        const filePath = path.join(process.cwd(), 'weekly-data', `week${weekNumber}.json`);
        const fileContent = await fs.readFile(filePath, 'utf-8');
        const data = JSON.parse(fileContent);
        
        return NextResponse.json(data);
    } catch (error) {
        console.error('Error reading weekly data:', error);
        return NextResponse.json({ error: 'Failed to read weekly data' }, { status: 500 });
    }
}