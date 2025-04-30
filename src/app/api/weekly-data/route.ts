import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get('userId');

        if (!userId) {
            return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
        }

        const weeklyDataDir = path.join(process.cwd(), 'weekly-data');
        const files = await fs.readdir(weeklyDataDir);
        
        const weeklyData = await Promise.all(
            files
                .filter(file => file.startsWith('week') && file.endsWith('.json'))
                .map(async file => {
                    const content = await fs.readFile(path.join(weeklyDataDir, file), 'utf-8');
                    const data = JSON.parse(content);
                    const weekNumber = parseInt(file.replace('week', '').replace('.json', ''));
                    return { weekNumber, data };
                })
        );

        return NextResponse.json({ weeklyData });
    } catch (error) {
        console.error('Error reading weekly data:', error);
        return NextResponse.json({ error: 'Failed to read weekly data' }, { status: 500 });
    }
}