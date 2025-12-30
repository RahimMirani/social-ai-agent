"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { updateAgent } from "@/app/actions/agent-actions"
import { Loader2, Save, Sparkles } from "lucide-react"
import type { Agent } from "@/types"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AgentConfigFormProps {
  agent: Agent
}

export function AgentConfigForm({ agent }: AgentConfigFormProps) {
  const [formData, setFormData] = useState({
    name: agent.name,
    system_prompt: agent.system_prompt,
    temperature: Number(agent.temperature) || 0.7,
    model: agent.model,
    auto_reply_enabled: agent.auto_reply_enabled,
    response_delay_seconds: agent.response_delay_seconds,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      await updateAgent(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Agent Configuration</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Agent Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="My Social Media Agent"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="model">AI Model</Label>
          <Select value={formData.model} onValueChange={(value) => setFormData({ ...formData, model: value })}>
            <SelectTrigger id="model">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai/gpt-4o-mini">GPT-4o Mini (Fast)</SelectItem>
              <SelectItem value="openai/gpt-4o">GPT-4o (Balanced)</SelectItem>
              <SelectItem value="anthropic/claude-sonnet-4">Claude Sonnet 4 (Advanced)</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">Choose the AI model that powers your agent</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="system_prompt">System Prompt</Label>
          <Textarea
            id="system_prompt"
            value={formData.system_prompt}
            onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
            placeholder="You are a helpful customer service assistant..."
            rows={6}
            className="resize-none"
          />
          <p className="text-sm text-muted-foreground">Define how your agent should behave and respond to customers</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="temperature">Creativity Level: {Number(formData.temperature).toFixed(1)}</Label>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[Number(formData.temperature)]}
            onValueChange={([value]) => setFormData({ ...formData, temperature: value })}
            className="py-4"
          />
          <p className="text-sm text-muted-foreground">
            Lower values make responses more focused, higher values more creative
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="response_delay">Response Delay (seconds)</Label>
          <Input
            id="response_delay"
            type="number"
            min={0}
            max={60}
            value={formData.response_delay_seconds}
            onChange={(e) =>
              setFormData({
                ...formData,
                response_delay_seconds: Number.parseInt(e.target.value) || 0,
              })
            }
          />
          <p className="text-sm text-muted-foreground">Add a delay before responding to make it feel more natural</p>
        </div>

        <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
          <div className="space-y-0.5">
            <Label htmlFor="auto_reply">Auto-Reply Enabled</Label>
            <p className="text-sm text-muted-foreground">Automatically respond to incoming messages</p>
          </div>
          <Switch
            id="auto_reply"
            checked={formData.auto_reply_enabled}
            onCheckedChange={(checked) => setFormData({ ...formData, auto_reply_enabled: checked })}
          />
        </div>

        <Button type="submit" disabled={isLoading} className="w-full" size="lg">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Configuration
            </>
          )}
        </Button>
      </form>
    </Card>
  )
}
