import { NextResponse } from 'next/server'
import path from 'path'
import fs from 'fs'

export async function POST(req: Request) {
  try {
    const data = await req.json()
    const userId = data.userId

    // Create directory if it doesn't exist
    const userDir = path.join(process.cwd(), 'neonatal-data')
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true })
    }

    // Save user data to a file
    const filePath = path.join(userDir, `${userId}.json`)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2))

    return NextResponse.json({ message: 'Registration successful', userId })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Failed to register' }, { status: 500 })
  }
}