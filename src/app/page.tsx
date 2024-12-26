'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Chat {
  id: string
  name: string
  description: string
  pdfUrl: string
  createdAt: string
}

export default function HomePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [chats, setChats] = useState<Chat[]>([])
  const [isLoadingChats, setIsLoadingChats] = useState(true)

  useEffect(() => {
    const fetchChats = async () => {
      try {
        const response = await fetch('/api/chats')
        if (response.ok) {
          const data = await response.json()
          setChats(data)
        } else {
          throw new Error('Failed to fetch chats')
        }
      } catch (error) {
        console.error('Error:', error)
        toast.error('Failed to load chats')
      } finally {
        setIsLoadingChats(false)
      }
    }

    fetchChats()
  }, [])

  const handleCreateChat = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const name = formData.get('name')
    const description = formData.get('description')
    const pdf = formData.get('pdf')

    if (!name || !description || !pdf) {
      toast.error('Please fill all fields')
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/chats', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { chatId } = await response.json()
        router.push(`/chat/${chatId}`)
      } else {
        throw new Error('Failed to create chat')
      }
    } catch (error) {
      console.error('Error:', error)
      toast.error('Failed to create chat')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Create New Chat Card */}
        <Card>
          <CardHeader>
            <CardTitle>Create New Chat</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreateChat} className="space-y-4">
              <Input
                name="name"
                placeholder="Chat Name"
                required
              />
              <Input
                name="description"
                placeholder="Description"
                required
              />
              <label className="flex items-center justify-center w-full px-4 py-2 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
                <Upload className="w-6 h-6 mr-2" />
                <span>Upload Brand PDF</span>
                <input
                  name="pdf"
                  type="file"
                  className="hidden"
                  accept=".pdf"
                  required
                />
              </label>
              <Button type="submit" disabled={isLoading} className="w-full">
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Create Chat
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Existing Chats */}
        <Card>
          <CardHeader>
            <CardTitle>Your Chats</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingChats ? (
              <div className="flex justify-center p-4">
                <Loader2 className="w-8 h-8 animate-spin" />
              </div>
            ) : chats.length === 0 ? (
              <p className="text-center text-gray-500">No chats yet</p>
            ) : (
              <div className="space-y-2">
                {chats.map((chat) => (
                  <Card 
                    key={chat.id} 
                    className="p-4 hover:bg-gray-50 cursor-pointer transition-colors" 
                    onClick={() => router.push(`/chat/${chat.id}`)}
                  >
                    <h3 className="font-semibold">{chat.name}</h3>
                    <p className="text-sm text-gray-500">{chat.description}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      Created {new Date(chat.createdAt).toLocaleDateString()}
                    </p>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
