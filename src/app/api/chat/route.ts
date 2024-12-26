import { NextRequest, NextResponse } from 'next/server'
import { vectorSearch, generatePrompt, generateOutput } from '@/lib/pdf-processing'

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json()
    
    if (!sessionId) {
      return NextResponse.json({ error: 'No session ID provided' }, { status: 400 })
    }
    
    const question = messages[messages.length - 1].content
    const searches = await vectorSearch(sessionId, question)
    const prompt = await generatePrompt(searches, question)
    const response = await generateOutput(prompt)

    return response    
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Error in chat' }, { status: 500 })
  }
}
