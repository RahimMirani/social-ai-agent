"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Loader2, Send, MessageSquare, Bot, Info } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

export function TestAgentCard() {
  const [message, setMessage] = useState("")
  const [response, setResponse] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handleTest = async () => {
    if (!message.trim()) return

    setIsLoading(true)
    setResponse("")

    try {
      const res = await fetch("/api/test-agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })

      const data = await res.json()

      if (data.response) {
        setResponse(data.response)
      } else {
        setResponse("Error: " + (data.error || "Unknown error"))
      }
    } catch (error) {
      setResponse("Error: Failed to connect to agent")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          The agent uses the Vercel AI Gateway which supports OpenAI, Anthropic, and other providers by default. No
          additional API keys needed - just test your agent!
        </AlertDescription>
      </Alert>

      <Card className="p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <MessageSquare className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Test Your Agent</h2>
            <p className="text-sm text-muted-foreground">See how your AI responds to messages</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="test-message" className="text-sm font-medium">
              Customer Message
            </label>
            <Textarea
              id="test-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Hi, I have a question about your products..."
              rows={4}
              className="resize-none"
            />
          </div>

          <Button onClick={handleTest} disabled={isLoading || !message.trim()} className="w-full" size="lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Agent is thinking...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send Test Message
              </>
            )}
          </Button>

          {response && (
            <div className="mt-6 space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Bot className="h-4 w-4" />
                Agent Response
              </div>
              <div className="rounded-lg border bg-muted/30 p-4">
                <p className="text-sm leading-relaxed">{response}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
