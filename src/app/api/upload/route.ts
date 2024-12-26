import { NextRequest, NextResponse } from 'next/server'
import { loadAndSplitTheDocs } from '@/lib/pdf-processing'
import path from 'path'
import fs from 'fs/promises'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const pdfFile = formData.get('pdf') as File

    if (!pdfFile) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    const buffer = Buffer.from(await pdfFile.arrayBuffer())
    const tempFilePath = path.join(process.cwd(), 'tmp', pdfFile.name)

    await fs.mkdir(path.dirname(tempFilePath), { recursive: true })
    await fs.writeFile(tempFilePath, buffer)

    const sessionId = crypto.randomUUID()
    await loadAndSplitTheDocs(tempFilePath)

    await fs.unlink(tempFilePath)

    return NextResponse.json({ 
      sessionId,
      message: 'PDF processed successfully' 
    })
  } catch (error) {
    console.error('Error processing PDF:', error)
    return NextResponse.json({ error: 'Error processing PDF' }, { status: 500 })
  }
}
