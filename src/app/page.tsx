'use client'

import { useState } from 'react'
import { useChat } from 'ai/react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Send, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function BrandingChat() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/chat',
    body: { sessionId }
  })

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setIsUploading(true)
      
      const formData = new FormData()
      formData.append('pdf', selectedFile)

      try {
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        })

        if (response.ok) {
          const { sessionId } = await response.json();
          setSessionId(sessionId)
          
          toast.success("PDF uploaded successfully", {
            description: "You can now start chatting about the content.",
          })
        } else {
          throw new Error('Upload failed')
        }
      } catch (error) {
        console.error('Upload error:', error)
        toast.error("Upload failed", {
          description: "Please try again later.",
        })
        setSessionId(null)
      } finally {
        setIsUploading(false)
      }
    }
  }

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (sessionId) {
      handleSubmit(e)
    } else {
      toast.error("No PDF uploaded", {
        description: "Please upload a PDF before chatting.",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Chat</CardTitle>
        </CardHeader>
        <CardContent className="h-[60vh] overflow-y-auto space-y-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] rounded-lg p-3 ${m.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                {m.content}
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4">
          <div className="w-full">
            <label htmlFor="pdf-upload" className="flex items-center justify-center w-full px-4 py-2 bg-white text-blue-500 rounded-lg shadow-lg tracking-wide border border-blue cursor-pointer hover:bg-blue-500 hover:text-white">
              {isUploading ? (
                <Loader2 className="w-6 h-6 mr-2 animate-spin" />
              ) : (
                <Upload className="w-6 h-6 mr-2" />
              )}
              <span className="text-base leading-normal">
                {sessionId ? 'PDF Uploaded' : 'Upload PDF'}
              </span>
            </label>
            <input
              id="pdf-upload"
              type="file"
              className="hidden"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </div>
          <form onSubmit={onSubmit} className="flex w-full space-x-2">
            <Input
              value={input}
              onChange={handleInputChange}
              placeholder="Ask about the branding..."
              className="flex-grow"
            />
            <Button type="submit" disabled={isLoading || !sessionId}>
              {isLoading ? (
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
