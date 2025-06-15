
import { useState, useRef, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Bot, User, Send, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface SummaryChatboxProps {
  summaryId: string
  summaryContent: string
  initialChatHistory: Message[] | null
}

export const SummaryChatbox = ({
  summaryId,
  summaryContent,
  initialChatHistory,
}: SummaryChatboxProps) => {
  const [messages, setMessages] = useState<Message[]>(initialChatHistory || [])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollElement = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
      if (scrollElement) {
        scrollElement.scrollTo({
          top: scrollElement.scrollHeight,
          behavior: 'smooth',
        });
      }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = { role: 'user', content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) throw new Error('Not authenticated')

      const { data, error } = await supabase.functions.invoke('chat-with-summary', {
        body: {
          summaryContent,
          userMessage: input,
          chatHistory: messages,
        },
      })

      if (error) throw error

      const assistantMessage: Message = { role: 'assistant', content: data.reply }
      const updatedMessages = [...newMessages, assistantMessage]
      setMessages(updatedMessages)
      
      // Save chat history to database
      const { error: updateError } = await supabase
        .from('summaries')
        .update({ chat_history: updatedMessages })
        .eq('id', summaryId)
      
      if (updateError) {
          throw updateError
      }

    } catch (error: any) {
      console.error('Error sending message:', error)
      toast({
        title: 'Error',
        description: `Failed to get a response. ${error.message}`,
        variant: 'destructive',
      })
      // Restore previous state on error
      setMessages(messages)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="glass-card border-0 shadow-xl mt-8">
      <CardHeader>
        <CardTitle className="flex items-center text-2xl">
          <Bot className="h-6 w-6 text-purple-500 mr-3" />
          Chat with Summary
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col h-[500px] bg-gray-50 rounded-2xl p-4 border border-gray-100">
          <ScrollArea className="flex-grow pr-4" ref={scrollAreaRef}>
            <div className="space-y-6">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-md rounded-2xl px-4 py-3 text-white ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-turquoise to-sky-blue rounded-br-none'
                        : 'bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-none'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                  </div>
                   {message.role === 'user' && (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-turquoise to-sky-blue flex items-center justify-center flex-shrink-0">
                      <User className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {loading && (
                 <div className="flex items-start gap-3 justify-start">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="max-w-md rounded-2xl px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-none text-white">
                        <Loader2 className="h-5 w-5 animate-spin" />
                    </div>
                </div>
              )}
            </div>
          </ScrollArea>
          <form onSubmit={handleSendMessage} className="mt-4 flex items-center gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about the summary..."
              className="flex-grow rounded-full"
              disabled={loading}
            />
            <Button type="submit" size="icon" className="rounded-full bg-gradient-to-r from-turquoise to-sky-blue text-white" disabled={loading}>
              <Send className="h-5 w-5" />
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  )
}
