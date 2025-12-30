export interface Agent {
  id: string
  name: string
  system_prompt: string
  temperature: number
  model: string
  auto_reply_enabled: boolean
  response_delay_seconds: number
  created_at: string
  updated_at: string
}

export interface KnowledgeBaseFile {
  id: string
  agent_id: string
  file_name: string
  file_type: string
  file_content: string
  file_size: number
  created_at: string
}

export interface PlatformConnection {
  id: string
  agent_id: string
  platform: "facebook" | "instagram"
  page_id: string
  page_name?: string
  access_token: string
  is_active: boolean
  connected_at: string
}

export interface Conversation {
  id: string
  agent_id: string
  platform: string
  platform_conversation_id: string
  customer_name?: string
  last_message_at: string
  created_at: string
}

export interface Message {
  id: string
  conversation_id: string
  platform_message_id?: string
  sender_type: "customer" | "agent"
  content: string
  sent_at: string
  created_at: string
}
