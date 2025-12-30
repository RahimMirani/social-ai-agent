import { type NextRequest, NextResponse } from "next/server"
import sql from "@/lib/db"
import { generateAIResponse } from "@/lib/ai-handler"

// Webhook verification for Facebook/Instagram
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const mode = searchParams.get("hub.mode")
  const token = searchParams.get("hub.verify_token")
  const challenge = searchParams.get("hub.challenge")

  const verifyToken = process.env.WEBHOOK_VERIFY_TOKEN || "your_verify_token"

  if (mode === "subscribe" && token === verifyToken) {
    console.log("[v0] Webhook verified")
    return new NextResponse(challenge, { status: 200 })
  }

  return NextResponse.json({ error: "Verification failed" }, { status: 403 })
}

// Handle incoming messages from Facebook/Instagram
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    console.log("[v0] Webhook received:", JSON.stringify(body, null, 2))

    // Handle Facebook/Instagram webhook events
    if (body.object === "page" || body.object === "instagram") {
      for (const entry of body.entry) {
        const messaging = entry.messaging || entry.changes

        if (messaging) {
          for (const event of messaging) {
            // Handle message events
            if (event.message && !event.message.is_echo) {
              await handleIncomingMessage(event, body.object)
            }
          }
        }
      }
    }

    return NextResponse.json({ status: "ok" })
  } catch (error) {
    console.error("[v0] Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handleIncomingMessage(event: any, platform: string) {
  try {
    const senderId = event.sender?.id
    const recipientId = event.recipient?.id
    const messageText = event.message?.text

    if (!senderId || !messageText) return

    console.log("[v0] Processing message from:", senderId)

    // Get the agent and check if auto-reply is enabled
    const agents = await sql`SELECT * FROM agents ORDER BY created_at DESC LIMIT 1`
    const agent = agents[0]

    if (!agent || !agent.auto_reply_enabled) {
      console.log("[v0] Auto-reply disabled")
      return
    }

    // Get or create conversation
    const conversations = await sql`
      SELECT * FROM conversations 
      WHERE platform_conversation_id = ${senderId}
    `

    let conversation = conversations[0]

    if (!conversation) {
      const newConversations = await sql`
        INSERT INTO conversations (agent_id, platform, platform_conversation_id, last_message_at)
        VALUES (${agent.id}, ${platform}, ${senderId}, NOW())
        RETURNING *
      `
      conversation = newConversations[0]
    } else {
      await sql`
        UPDATE conversations 
        SET last_message_at = NOW()
        WHERE id = ${conversation.id}
      `
    }

    // Save incoming message
    await sql`
      INSERT INTO messages (conversation_id, platform_message_id, sender_type, content)
      VALUES (${conversation.id}, ${event.message.mid}, 'customer', ${messageText})
    `

    // Get message history for context
    const messageHistory = await sql`
      SELECT sender_type, content, sent_at
      FROM messages
      WHERE conversation_id = ${conversation.id}
      ORDER BY sent_at DESC
      LIMIT 10
    `

    // Add response delay if configured
    if (agent.response_delay_seconds > 0) {
      await new Promise((resolve) => setTimeout(resolve, agent.response_delay_seconds * 1000))
    }

    // Generate AI response
    const aiResponse = await generateAIResponse(agent, messageHistory.reverse(), messageText)

    // Save AI response
    await sql`
      INSERT INTO messages (conversation_id, sender_type, content)
      VALUES (${conversation.id}, 'agent', ${aiResponse})
    `

    // Get platform connection
    const connections = await sql`
      SELECT * FROM platform_connections 
      WHERE agent_id = ${agent.id} 
        AND platform = ${platform}
        AND is_active = true
      LIMIT 1
    `

    const connection = connections[0]

    if (!connection) {
      console.log("[v0] No active connection found for platform:", platform)
      return
    }

    // Send response back to Facebook/Instagram
    await sendMessageToPlatform(platform, senderId, aiResponse, connection.access_token)

    console.log("[v0] Response sent successfully")
  } catch (error) {
    console.error("[v0] Error handling message:", error)
  }
}

async function sendMessageToPlatform(platform: string, recipientId: string, text: string, accessToken: string) {
  const url =
    platform === "facebook"
      ? "https://graph.facebook.com/v18.0/me/messages"
      : "https://graph.facebook.com/v18.0/me/messages"

  const response = await fetch(`${url}?access_token=${accessToken}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      recipient: { id: recipientId },
      message: { text },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Failed to send message: ${error}`)
  }

  return response.json()
}
