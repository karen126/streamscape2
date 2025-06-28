"use client"

import type React from "react"
import type { Message } from "@/types/chat"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Paperclip, Send, Smile, Video } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase"
import { sendMessage, getChatMessages, markMessagesAsRead } from "@/lib/db"

import { VideoCallInterface } from "@/components/video/video-call-interface"

interface ChatInterfaceProps {
  chatId: string
  otherUser: {
    id: string
    first_name: string
    last_name: string
    avatar_url: string | null
    online?: boolean
  }
  currentUserId: string
}

export function ChatInterface({ chatId, otherUser, currentUserId }: ChatInterfaceProps) {
  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isEmojiPickerOpen, setIsEmojiPickerOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Cargar mensajes iniciales
  useEffect(() => {
    const loadMessages = async () => {
      setIsLoading(true)
      const messages = await getChatMessages(chatId)
      setMessages(messages)
      setIsLoading(false)

      // Marcar mensajes como leídos
      await markMessagesAsRead(chatId, currentUserId)
    }

    loadMessages()
  }, [chatId, currentUserId])

  // Suscribirse a nuevos mensajes
  useEffect(() => {
    const subscription = supabase
      .channel(`chat:${chatId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${chatId}`,
        },
        async (payload) => {
          const newMessage = payload.new as Message
          setMessages((prevMessages) => [...prevMessages, newMessage])

          // Si el mensaje no es del usuario actual, marcarlo como leído
          if (newMessage.sender_id !== currentUserId) {
            await markMessagesAsRead(chatId, currentUserId)
          }
        },
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [chatId, currentUserId])

  // Auto-scroll al último mensaje
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!message.trim()) return

    try {
      const { success } = await sendMessage(chatId, currentUserId, message)

      if (success) {
        setMessage("")
      } else {
        toast({
          title: "Error",
          description: "Failed to send message. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleAttachment = () => {
    toast({
      title: "Coming soon",
      description: "File attachments will be available soon!",
    })
  }

  const handleEmojiPicker = () => {
    setIsEmojiPickerOpen(!isEmojiPickerOpen)
  }

  const addEmoji = (emoji: string) => {
    setMessage((prev) => prev + emoji)
    setIsEmojiPickerOpen(false)
  }

  const formatTime = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-4 border-b p-4">
          <Avatar>
            <AvatarImage
              src={otherUser.avatar_url || "/placeholder.svg?height=40&width=40"}
              alt={`${otherUser.first_name} ${otherUser.last_name}`}
            />
            <AvatarFallback>{getUserInitials(otherUser.first_name, otherUser.last_name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{`${otherUser.first_name} ${otherUser.last_name}`}</div>
            <div className="text-xs text-muted-foreground">{otherUser.online ? "Online" : "Offline"}</div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <Button size="icon" variant="ghost" onClick={() => setIsVideoModalOpen(true)} title="Start video call">
              <Video className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <p>Loading messages...</p>
            </div>
          ) : messages.length > 0 ? (
            <div className="space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 ${msg.sender_id === currentUserId ? "justify-end" : ""}`}
                >
                  {msg.sender_id !== currentUserId && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={otherUser.avatar_url || "/placeholder.svg?height=32&width=32"}
                        alt={otherUser.first_name}
                      />
                      <AvatarFallback>{getUserInitials(otherUser.first_name, otherUser.last_name)}</AvatarFallback>
                    </Avatar>
                  )}
                  <div
                    className={`rounded-lg ${
                      msg.sender_id === currentUserId ? "bg-primary text-primary-foreground" : "bg-muted"
                    } p-3 max-w-[70%] break-words animate-fadeIn`}
                  >
                    <p className="text-sm">{msg.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTime(msg.created_at)}</span>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <p className="text-muted-foreground mb-2">No messages yet</p>
              <p className="text-sm text-muted-foreground">Start a conversation with {otherUser.first_name}</p>
            </div>
          )}
        </div>

        <div className="border-t p-4">
          <form className="flex items-center gap-2" onSubmit={handleSendMessage}>
            <Button type="button" size="icon" variant="ghost" onClick={handleAttachment}>
              <Paperclip className="h-4 w-4" />
            </Button>
            <div className="relative flex-1">
              <Input
                className="pr-10"
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-0 top-0 h-full"
                onClick={handleEmojiPicker}
              >
                <Smile className="h-4 w-4" />
              </Button>
              {isEmojiPickerOpen && (
                <div className="absolute bottom-full right-0 mb-2 p-2 bg-background border rounded-md shadow-md grid grid-cols-6 gap-2 z-10">
                  {["😊", "😂", "❤️", "👍", "🎉", "🔥", "😍", "🙏", "👋", "🤔", "😎", "🥳"].map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl hover:bg-muted p-1 rounded"
                      onClick={() => addEmoji(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <Button type="submit" size="icon">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </div>
      </div>

      {/* Video Call Dialog */}
      {isVideoModalOpen && (
        <VideoCallInterface
          chatId={chatId}
          otherUser={otherUser}
          currentUserId={currentUserId}
          isOpen={isVideoModalOpen}
          onClose={() => setIsVideoModalOpen(false)}
        />
      )}
    </>
  )
}
