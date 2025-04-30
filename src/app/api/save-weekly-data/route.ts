import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const { data, fileName } = await request.json();
        const weeklyDataDir = path.join(process.cwd(), 'weekly-data');

        // Ensure the directory exists
        await fs.mkdir(weeklyDataDir, { recursive: true });

        // Save the data
        await fs.writeFile(
            path.join(weeklyDataDir, fileName),
            JSON.stringify(data, null, 2)
        );

        return NextResponse.json({ message: 'Data saved successfully' });
    } catch (error) {
        console.error('Error saving weekly data:', error);
        return NextResponse.json(
            { error: 'Failed to save weekly data' },
            { status: 500 }
        );
    }
}