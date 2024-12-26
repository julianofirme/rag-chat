'use client'

import { useState, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useParams } from 'next/navigation'

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  createdAt: Date
}

interface Chat {
  id: string
  name: string
  description: string
  pdfUrl: string
}

export default function ChatPage() {
  const [chat, setChat] = useState<Chat | null>(null)
  const [initialMessages, setInitialMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams<{ id: string; }>()

  const { messages, input, handleInputChange, handleSubmit, isLoading: isChatLoading } = useChat({
    api: '/api/chat',
    body: { chatId: params.id },
    initialMessages
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [chatResponse, messagesResponse] = await Promise.all([
          fetch(`/api/chats/${params.id}`),
          fetch(`/api/chats/${params.id}/messages`)
        ])

        if (!chatResponse.ok || !messagesResponse.ok) {
          throw new Error('Failed to fetch data')
        }

        const [chatData, messagesData] = await Promise.all([
          chatResponse.json(),
          messagesResponse.json()
        ])

        setChat(chatData)
        setInitialMessages(messagesData)
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load chat')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [params.id])

  if (isLoading || !chat) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-100 p-4">
      <Card className="flex-grow">
        <CardHeader className="border-b">
          <CardTitle>{chat.name}</CardTitle>
          <p className="text-sm text-gray-500">{chat.description}</p>
        </CardHeader>
        <CardContent className="flex-grow overflow-y-auto space-y-4 p-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {m.content}
              </div>
            </div>
          ))}
          {isChatLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-200 rounded-lg p-3">
                <Loader2 className="w-5 h-5 animate-spin" />
              </div>
            </div>
          )}
        </CardContent>
        <CardFooter className="border-t p-4">
          <form onSubmit={handleSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the branding..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isChatLoading}>
              {isChatLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}
