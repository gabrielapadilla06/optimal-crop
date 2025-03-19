"use client"

import { useState, useEffect } from "react"
import toast from "react-hot-toast"
import { AlertCircle } from "lucide-react"
import { useUser, useSession } from "@clerk/nextjs"
import ChatArea from "@/components/chatArea"
import HistoryArea from "@/components/historyArea"
import type { ChatMessage, Conversation } from "@/lib/types"
import { ERROR_ASSISTANT_MESSAGE, INITIAL_ASSISTANT_MESSAGE } from "@/lib/constants"
import { createClient } from "@supabase/supabase-js"

export default function Chat() {
  const { user } = useUser()
  const { session } = useSession()

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
            template: "supabase",
          })
          const headers = new Headers(options?.headers)
          headers.set("Authorization", `Bearer ${clerkToken}`)
          return fetch(url, {
            ...options,
            headers,
          })
        },
      },
    }
  )

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [conversationsLoading, setConversationsLoading] = useState(true)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId)
    if (currentConversationId !== conversationId) {
      changeConversation(conversationId)
      fetchHistory()
    }
  }

  /** Starts a new conversation without saving it to Supabase. */
  const startNewConversation = async () => {
    const initialAssistantMessage: ChatMessage = {
      role: "assistant",
      content: INITIAL_ASSISTANT_MESSAGE,
    }
    setMessages([initialAssistantMessage])
  }

  const saveNewConversation = async () => {
    if (!user) {
      throw new Error("User is not authenticated")
    }

    try {
      const timestamp = new Date().toISOString()
      const conversationId = `${user.id}_${timestamp}`

      const { error } = await supabase
        .from("chats")
        .insert({
          user_id: user.id,
          conversation_id: conversationId,
          created_at: timestamp,
        })
        .select()

      if (error) {
        console.error("Error creating conversation:", error)
        throw error
      }

      setCurrentConversationId(conversationId)
      await fetchHistory()

      const initialAssistantMessage: ChatMessage = {
        role: "assistant",
        content: INITIAL_ASSISTANT_MESSAGE,
        created_at: timestamp,
      }

      setMessages([initialAssistantMessage])
      await saveMessage(initialAssistantMessage, conversationId)
      return conversationId
    } catch (error) {
      console.error("Detailed error:", error)
      throw error
    }
  }

  const getConversationId = async () => {
    try {
      return currentConversationId || (await saveNewConversation())
    } catch (error) {
      console.error("Error:", error)
      toast.error("Failed to create a new conversation.")
      return null
    }
  }

  useEffect(() => {
    if (user) {
      startNewConversation()
      fetchHistoryWithLoading()
    }
  }, [user])

  const saveMessage = async (message: ChatMessage, conversationId: string) => {
    const { error } = await supabase.from("messages").insert({
      conversation_id: conversationId,
      role: message.role,
      content: message.content,
      created_at: message.created_at || new Date().toISOString(),
    })

    if (error) {
      console.error("Error saving message:", error)
    }
  }

  const sendMessages = async () => {
    if (isLoading) {
      return
    }

    if (!message.trim()) {
      setMessage("")
      toast.custom(
        (t) => (
          <div
            className={`${
              t.visible ? "animate-enter" : "animate-leave"
            } max-w-md w-sm bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-2 rounded-lg shadow-lg`}
            style={{ animationDuration: "1s" }}
          >
            <div className="flex items-center">
              <AlertCircle className="w-5 h-5 text-yellow-800" />
              <div className="ml-2">Oops! It looks like you forgot to type something.</div>
            </div>
          </div>
        ),
        { duration: 1500 },
      )
      return
    }

    const timestamp = new Date().toISOString()
    const userMessage: ChatMessage = {
      role: "user",
      content: message,
      created_at: timestamp,
    }

    const conversationId = await getConversationId()
    if (!conversationId) {
      return
    }

    setMessages((prevMessages) => [...prevMessages, userMessage, { role: "assistant", content: "" }])
    setMessage("")
    setIsLoading(true)

    try {
      // Send the user's message to the API endpoint for processing
      const response = await fetch("/api/kb/retrieve", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: userMessage.content, messages }),
      })

      if (!response.ok) {
        toast.error("Failed to send the message.")
        console.error("Error:", response.statusText)
        return
      }

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantResponse = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const text = decoder.decode(value, { stream: true })
        assistantResponse += text
        setMessages((messages) => {
          const lastMessage = messages[messages.length - 1]
          const otherMessages = messages.slice(0, messages.length - 1)
          return [...otherMessages, { ...lastMessage, content: assistantResponse }]
        })
      }

      // Save the user and assistant messages to Supabase
      await saveMessage(userMessage, conversationId)
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: assistantResponse,
        created_at: new Date().toISOString(),
      }
      await saveMessage(assistantMessage, conversationId)
    } catch (error) {
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: ERROR_ASSISTANT_MESSAGE,
        created_at: new Date().toISOString(),
      }
      setMessages((messages) => [...messages, assistantMessage])
      await saveMessage(assistantMessage, conversationId)
      console.error("Error:", error)
    }

    setIsLoading(false)
  }

  // Fetch user chats
  const fetchHistory = async () => {
    if (!user) return

    const { data, error } = await supabase
      .from("chats")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching conversations:", error)
      return
    }

    const history = []

    for (const conversation of data) {
      const conversationId = conversation.conversation_id

      // Fetch the last message
      const { data: messagesData, error: messagesError } = await supabase
        .from("messages")
        .select("*")
        .eq("conversation_id", conversationId)
        .order("created_at", { ascending: false })
        .limit(1)

      if (messagesError) {
        console.error("Error fetching messages:", messagesError)
        continue
      }

      let lastMessage = "No messages"
      if (messagesData && messagesData.length > 0) {
        lastMessage = messagesData[0].content
      }

      const createdAtDate = new Date(conversation.created_at)
      const formattedDate = createdAtDate.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "numeric",
      })

      history.push({
        id: conversationId,
        title: `Chat of ${formattedDate}`,
        lastMessage: lastMessage,
      })
    }

    setConversations(history)
  }

  const fetchHistoryWithLoading = async () => {
    setConversationsLoading(true)
    await fetchHistory()
    setConversationsLoading(false)
  }

  const onDeleteConversation = async (id: string) => {
    try {
      // First delete all messages for this conversation
      const { error: messagesError } = await supabase.from("messages").delete().eq("conversation_id", id)

      if (messagesError) {
        console.error("Error deleting messages:", messagesError)
        throw messagesError
      }

      // Then delete the conversation
      const { error: chatError } = await supabase.from("chats").delete().eq("conversation_id", id)

      if (chatError) {
        console.error("Error deleting conversation:", chatError)
        throw chatError
      }

      setConversations((prevConversations) => prevConversations.filter((conversation) => conversation.id !== id))

      toast.success("Conversation deleted successfully.")
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast.error("Failed to delete the conversation.")
    }
  }

  const changeConversation = async (id: string) => {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching messages:", error)
      return
    }

    const conversationMessages = data.map((message) => ({
      role: message.role,
      content: message.content,
    }))

    setMessages(conversationMessages)
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row w-full" style={{ height: "calc(100vh - 4rem)" }}>
        <div className="hidden md:block md:w-1/3 mt-10 md:mt-0 bg-gray-100 dark:bg-slate-800 p-4 rounded-sm overflow-y-auto">
          <HistoryArea
            conversations={conversations}
            onSelectConversation={handleSelectConversation}
            onDeleteConversation={onDeleteConversation}
            currentConversationId={currentConversationId}
            user={user}
            loading={conversationsLoading}
          />
        </div>
        <div className="md:w-2/3 lg:w-3/4 w-full">
          <ChatArea
            message={message}
            messages={messages}
            setMessage={setMessage}
            sendMessages={sendMessages}
            disabled={isLoading}
          />
        </div>
      </div>
    </div>
  )
}