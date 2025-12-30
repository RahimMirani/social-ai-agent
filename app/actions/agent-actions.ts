"use server"

import sql from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { Agent, KnowledgeBaseFile } from "@/types"

export async function getAgent(): Promise<Agent | null> {
  try {
    const result = await sql`
      SELECT * FROM agents 
      ORDER BY created_at DESC 
      LIMIT 1
    `
    return result[0] || null
  } catch (error) {
    if (error instanceof Error && error.message.includes('relation "agents" does not exist')) {
      console.error("[v0] Database tables not created yet")
      return null
    }
    console.error("Error fetching agent:", error)
    return null
  }
}

export async function updateAgent(data: {
  name: string
  system_prompt: string
  temperature: number
  model: string
  auto_reply_enabled: boolean
  response_delay_seconds: number
}) {
  try {
    const agent = await getAgent()
    if (!agent) throw new Error("No agent found")

    await sql`
      UPDATE agents 
      SET 
        name = ${data.name},
        system_prompt = ${data.system_prompt},
        temperature = ${data.temperature},
        model = ${data.model},
        auto_reply_enabled = ${data.auto_reply_enabled},
        response_delay_seconds = ${data.response_delay_seconds},
        updated_at = NOW()
      WHERE id = ${agent.id}
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error updating agent:", error)
    return { success: false, error: "Failed to update agent" }
  }
}

export async function getKnowledgeBaseFiles(): Promise<KnowledgeBaseFile[]> {
  try {
    const agent = await getAgent()
    if (!agent) return []

    const result = await sql`
      SELECT * FROM knowledge_base 
      WHERE agent_id = ${agent.id}
      ORDER BY created_at DESC
    `
    return result as KnowledgeBaseFile[]
  } catch (error) {
    console.error("Error fetching knowledge base:", error)
    return []
  }
}

export async function uploadKnowledgeBaseFile(
  fileName: string,
  fileContent: string,
  fileType: string,
  fileSize: number,
) {
  try {
    const agent = await getAgent()
    if (!agent) throw new Error("No agent found")

    await sql`
      INSERT INTO knowledge_base (agent_id, file_name, file_type, file_content, file_size)
      VALUES (${agent.id}, ${fileName}, ${fileType}, ${fileContent}, ${fileSize})
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error uploading file:", error)
    return { success: false, error: "Failed to upload file" }
  }
}

export async function deleteKnowledgeBaseFile(fileId: string) {
  try {
    await sql`DELETE FROM knowledge_base WHERE id = ${fileId}`
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting file:", error)
    return { success: false, error: "Failed to delete file" }
  }
}

export async function getAgentAnalytics() {
  try {
    const agent = await getAgent()
    if (!agent) return null

    // Get total unique users
    const uniqueUsers = await sql`
      SELECT COUNT(DISTINCT platform_user_id) as count
      FROM conversations
      WHERE agent_id = ${agent.id}
    `

    // Get platform breakdown
    const platformBreakdown = await sql`
      SELECT 
        platform,
        COUNT(DISTINCT platform_user_id) as user_count,
        COUNT(DISTINCT id) as conversation_count
      FROM conversations
      WHERE agent_id = ${agent.id}
      GROUP BY platform
    `

    // Get total messages sent by AI
    const messagesSent = await sql`
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE agent_id = ${agent.id}
      )
      AND sender = 'agent'
    `

    // Get total messages received
    const messagesReceived = await sql`
      SELECT COUNT(*) as count
      FROM messages
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE agent_id = ${agent.id}
      )
      AND sender = 'user'
    `

    // Get recent conversations with last message
    const recentConversations = await sql`
      SELECT 
        c.id,
        c.platform,
        c.platform_user_name,
        c.last_message_at,
        m.content as last_message,
        m.sender as last_sender
      FROM conversations c
      LEFT JOIN LATERAL (
        SELECT content, sender
        FROM messages
        WHERE conversation_id = c.id
        ORDER BY created_at DESC
        LIMIT 1
      ) m ON true
      WHERE c.agent_id = ${agent.id}
      ORDER BY c.last_message_at DESC
      LIMIT 10
    `

    // Get activity over the last 7 days
    const dailyActivity = await sql`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as message_count
      FROM messages
      WHERE conversation_id IN (
        SELECT id FROM conversations WHERE agent_id = ${agent.id}
      )
      AND created_at >= NOW() - INTERVAL '7 days'
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `

    return {
      uniqueUsers: Number(uniqueUsers[0]?.count || 0),
      platformBreakdown: platformBreakdown.map((p) => ({
        platform: p.platform,
        userCount: Number(p.user_count),
        conversationCount: Number(p.conversation_count),
      })),
      messagesSent: Number(messagesSent[0]?.count || 0),
      messagesReceived: Number(messagesReceived[0]?.count || 0),
      recentConversations: recentConversations.map((c) => ({
        id: c.id,
        platform: c.platform,
        platformUserName: c.platform_user_name,
        lastMessageAt: c.last_message_at,
        lastMessage: c.last_message,
        lastSender: c.last_sender,
      })),
      dailyActivity: dailyActivity.map((d) => ({
        date: d.date,
        messageCount: Number(d.message_count),
      })),
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return null
  }
}
