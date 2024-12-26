import { NextRequest, NextResponse } from 'next/server'
import { vectorSaveAndSearch, generatePrompt, generateOutput } from '@/lib/pdf-processing'

export async function POST(req: NextRequest) {
  try {
    const { messages, file } = await req.json()
    const question = messages[messages.length - 1].content

    const searches = await vectorSaveAndSearch(file, question)
    const prompt = await generatePrompt(searches, question)
    const response = await generateOutput(prompt)

    return response    
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Error in chat' }, { status: 500 })
  }
}

