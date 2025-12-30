import { type NextRequest, NextResponse } from "next/server"
import { generateAIResponse } from "@/lib/ai-handler"
import sql from "@/lib/db"

// Test endpoint to try out your AI agent without connecting platforms
export async function POST(request: NextRequest) {
  try {
    const { message } = await request.json()

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 })
    }

    // Get the agent
    const agents = await sql`SELECT * FROM agents ORDER BY created_at DESC LIMIT 1`
    const agent = agents[0]

    if (!agent) {
      return NextResponse.json({ error: "No agent configured" }, { status: 404 })
    }

    // Generate response with empty history for testing
    const response = await generateAIResponse(agent, [], message)

    return NextResponse.json({ response })
  } catch (error) {
    console.error("[v0] Test agent error:", error)
    return NextResponse.json({ error: "Failed to generate response" }, { status: 500 })
  }
}
