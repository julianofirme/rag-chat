import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/db'
import { chats, messages } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { vectorSearch, generatePrompt, generateOutput } from '@/lib/pdf-processing'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  try {
    const { messages: chatMessages, chatId } = await req.json()
    
    if (!chatId) {
      return NextResponse.json({ error: 'No chat ID provided' }, { status: 400 })
    }

    // Get chat from database
    const chat = db.select().from(chats).where(eq(chats.id, chatId)).get()

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }
    
    const question = chatMessages[chatMessages.length - 1].content

    // Save user message
    const userMessageId = crypto.randomUUID()
    await db.insert(messages).values({
      id: userMessageId,
      chatId,
      content: question,
      role: 'user',
    })

    // Get context and generate response
    const searches = await vectorSearch(chatId, question)
    const prompt = await generatePrompt(searches, question)
    const response = await generateOutput(prompt)

    // Save assistant message
    const assistantMessageId = crypto.randomUUID()
    await db.insert(messages).values({
      id: assistantMessageId,
      chatId,
      content: String(response),
      role: 'assistant',
    })

    return response    
  } catch (error) {
    console.error('Error in chat:', error)
    return NextResponse.json({ error: 'Error in chat' }, { status: 500 })
  }
}
