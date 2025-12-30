"use server"

import sql from "@/lib/db"
import { revalidatePath } from "next/cache"
import type { PlatformConnection } from "@/types"
import { getAgent } from "./agent-actions"

export async function getPlatformConnections(): Promise<PlatformConnection[]> {
  try {
    const agent = await getAgent()
    if (!agent) return []

    const result = await sql`
      SELECT * FROM platform_connections 
      WHERE agent_id = ${agent.id}
      ORDER BY connected_at DESC
    `
    return result as PlatformConnection[]
  } catch (error) {
    console.error("Error fetching platform connections:", error)
    return []
  }
}

export async function addPlatformConnection(data: {
  platform: "facebook" | "instagram"
  pageId: string
  pageName: string
  accessToken: string
}) {
  try {
    const agent = await getAgent()
    if (!agent) throw new Error("No agent found")

    await sql`
      INSERT INTO platform_connections (agent_id, platform, page_id, page_name, access_token, is_active)
      VALUES (${agent.id}, ${data.platform}, ${data.pageId}, ${data.pageName}, ${data.accessToken}, true)
      ON CONFLICT (agent_id, platform, page_id) 
      DO UPDATE SET 
        page_name = ${data.pageName},
        access_token = ${data.accessToken},
        is_active = true,
        connected_at = NOW()
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error adding platform connection:", error)
    return { success: false, error: "Failed to add connection" }
  }
}

export async function togglePlatformConnection(connectionId: string, isActive: boolean) {
  try {
    await sql`
      UPDATE platform_connections 
      SET is_active = ${isActive}
      WHERE id = ${connectionId}
    `

    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error toggling connection:", error)
    return { success: false, error: "Failed to toggle connection" }
  }
}

export async function deletePlatformConnection(connectionId: string) {
  try {
    await sql`DELETE FROM platform_connections WHERE id = ${connectionId}`
    revalidatePath("/")
    return { success: true }
  } catch (error) {
    console.error("Error deleting connection:", error)
    return { success: false, error: "Failed to delete connection" }
  }
}
