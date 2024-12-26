import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { chats } from '@/db/schema'
import { loadAndSplitTheDocs } from '@/lib/pdf-processing'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

export async function GET() {
  try {
    const allChats = await db.select().from(chats)
    return NextResponse.json(allChats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json({ error: 'Failed to fetch chats' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const pdfFile = formData.get('pdf') as File

    if (!name || !description || !pdfFile) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Save PDF file
    const buffer = Buffer.from(await pdfFile.arrayBuffer())
    const pdfId = crypto.randomUUID()
    const pdfFileName = `${pdfId}.pdf`
    const pdfDir = path.join(process.cwd(), 'uploads')
    const pdfPath = path.join(pdfDir, pdfFileName)

    await fs.mkdir(pdfDir, { recursive: true })
    await fs.writeFile(pdfPath, buffer)

    // Process PDF and store in ChromaDB
    await loadAndSplitTheDocs(pdfPath)

    // Create chat in database
    const chatId = crypto.randomUUID()
    await db.insert(chats).values({
      id: chatId,
      name,
      description,
      pdfUrl: pdfPath,
    })

    return NextResponse.json({ chatId })
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json({ error: 'Failed to create chat' }, { status: 500 })
  }
}
