import { generateText } from "ai"
import sql from "./db"
import type { Agent } from "@/types"

export async function generateAIResponse(agent: Agent, messageHistory: any[], latestMessage: string): Promise<string> {
  try {
    // Get knowledge base for context
    const knowledgeBase = await sql`
      SELECT file_name, file_content 
      FROM knowledge_base 
      WHERE agent_id = ${agent.id}
      ORDER BY created_at DESC
      LIMIT 5
    `

    // Build context from knowledge base
    let knowledgeContext = ""
    if (knowledgeBase.length > 0) {
      knowledgeContext = "\n\nKnowledge Base:\n"
      for (const file of knowledgeBase) {
        knowledgeContext += `\n--- ${file.file_name} ---\n${file.file_content.substring(0, 2000)}\n`
      }
    }

    // Build conversation history
    let conversationContext = ""
    if (messageHistory.length > 1) {
      conversationContext = "\n\nConversation History:\n"
      for (const msg of messageHistory.slice(0, -1)) {
        const role = msg.sender_type === "customer" ? "Customer" : "Assistant"
        conversationContext += `${role}: ${msg.content}\n`
      }
    }

    // Generate response using AI SDK
    const { text } = await generateText({
      model: agent.model,
      temperature: agent.temperature,
      prompt: `${agent.system_prompt}${knowledgeContext}${conversationContext}

Current Customer Message: ${latestMessage}

Respond to the customer's message in a helpful and professional way. Keep your response concise and focused.`,
    })

    return text
  } catch (error) {
    console.error("[v0] AI generation error:", error)
    return "I apologize, but I'm having trouble processing your message right now. Please try again later or contact our support team for assistance."
  }
}
