import { neon } from "@neondatabase/serverless"

if (!process.env.DATABASE_URL) {
  console.error("[v0] DATABASE_URL environment variable is not set")
}

const sql = neon(process.env.DATABASE_URL || "")

export default sql
