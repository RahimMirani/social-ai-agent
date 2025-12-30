-- Create agents table to store AI agent configurations
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  system_prompt TEXT NOT NULL DEFAULT 'You are a helpful customer service assistant for our business. Be friendly, professional, and helpful.',
  temperature DECIMAL(2,1) DEFAULT 0.7,
  model TEXT DEFAULT 'openai/gpt-4o-mini',
  auto_reply_enabled BOOLEAN DEFAULT true,
  response_delay_seconds INTEGER DEFAULT 5,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create knowledge_base table for uploaded files
CREATE TABLE IF NOT EXISTS knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_content TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create platform_connections table for Facebook/Instagram
CREATE TABLE IF NOT EXISTS platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('facebook', 'instagram')),
  page_id TEXT NOT NULL,
  page_name TEXT,
  access_token TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(agent_id, platform, page_id)
);

-- Create conversations table to track messages
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  platform_conversation_id TEXT NOT NULL,
  customer_name TEXT,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(platform_conversation_id)
);

-- Create messages table to store all messages
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  platform_message_id TEXT,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('customer', 'agent')),
  content TEXT NOT NULL,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_knowledge_base_agent ON knowledge_base(agent_id);
CREATE INDEX IF NOT EXISTS idx_platform_connections_agent ON platform_connections(agent_id);
CREATE INDEX IF NOT EXISTS idx_conversations_agent ON conversations(agent_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);

-- Insert a default agent
INSERT INTO agents (name, system_prompt, temperature, model, auto_reply_enabled)
VALUES (
  'Default Social Media Agent',
  'You are a helpful and friendly customer service assistant for our business. Respond to customer inquiries professionally and warmly. Keep responses concise and helpful. If you don''t know something, politely let them know and offer to connect them with a human representative.',
  0.7,
  'openai/gpt-4o-mini',
  true
) ON CONFLICT DO NOTHING;
