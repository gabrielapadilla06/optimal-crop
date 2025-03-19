export type MessageRole = "system" | "user" | "assistant"

export interface ChatMessage {
  content: string
  role: MessageRole
  created_at?: string // Change from Timestamp to string
}

export interface Conversation {
  id: string
  title: string
  lastMessage: string
}

