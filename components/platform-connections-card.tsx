"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Facebook, Instagram, Plus, CheckCircle2, XCircle, Loader2, Trash2 } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import {
  getPlatformConnections,
  addPlatformConnection,
  togglePlatformConnection,
  deletePlatformConnection,
} from "@/app/actions/platform-actions"
import type { PlatformConnection } from "@/types"

interface PlatformConnectionsCardProps {
  agentId: string
}

export function PlatformConnectionsCard({ agentId }: PlatformConnectionsCardProps) {
  const [connections, setConnections] = useState<PlatformConnection[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedPlatform, setSelectedPlatform] = useState<"facebook" | "instagram">("facebook")
  const [formData, setFormData] = useState({
    pageId: "",
    pageName: "",
    accessToken: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    loadConnections()
  }, [])

  const loadConnections = async () => {
    setIsLoading(true)
    const data = await getPlatformConnections()
    setConnections(data)
    setIsLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    try {
      await addPlatformConnection({
        platform: selectedPlatform,
        ...formData,
      })
      await loadConnections()
      setDialogOpen(false)
      setFormData({ pageId: "", pageName: "", accessToken: "" })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggle = async (connectionId: string, currentState: boolean) => {
    await togglePlatformConnection(connectionId, !currentState)
    await loadConnections()
  }

  const handleDelete = async (connectionId: string) => {
    await deletePlatformConnection(connectionId)
    await loadConnections()
  }

  const openDialog = (platform: "facebook" | "instagram") => {
    setSelectedPlatform(platform)
    setDialogOpen(true)
  }

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-6">
        <Plus className="h-5 w-5 text-primary" />
        <h2 className="text-xl font-semibold text-foreground">Platform Connections</h2>
      </div>

      <div className="space-y-4">
        <p className="text-sm text-muted-foreground mb-6">
          Connect your Facebook and Instagram business pages to enable automated responses
        </p>

        {/* Add Platform Buttons */}
        <div className="grid gap-4 md:grid-cols-2">
          <Dialog open={dialogOpen && selectedPlatform === "facebook"} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <div
                className="border rounded-lg p-6 space-y-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => openDialog("facebook")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-blue-500 p-2 rounded-lg">
                    <Facebook className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Facebook</h3>
                    <p className="text-sm text-muted-foreground">Business Page</p>
                  </div>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Facebook
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Facebook Page</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fb-pageName">Page Name</Label>
                  <Input
                    id="fb-pageName"
                    value={formData.pageName}
                    onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                    placeholder="My Business Page"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-pageId">Page ID</Label>
                  <Input
                    id="fb-pageId"
                    value={formData.pageId}
                    onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                    placeholder="123456789012345"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fb-accessToken">Page Access Token</Label>
                  <Input
                    id="fb-accessToken"
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="EAAG..."
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Connect
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          <Dialog open={dialogOpen && selectedPlatform === "instagram"} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <div
                className="border rounded-lg p-6 space-y-4 bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => openDialog("instagram")}
              >
                <div className="flex items-center gap-3">
                  <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-2 rounded-lg">
                    <Instagram className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Instagram</h3>
                    <p className="text-sm text-muted-foreground">Business Account</p>
                  </div>
                </div>
                <Button className="w-full bg-transparent" variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Connect Instagram
                </Button>
              </div>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Instagram Account</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="ig-pageName">Account Name</Label>
                  <Input
                    id="ig-pageName"
                    value={formData.pageName}
                    onChange={(e) => setFormData({ ...formData, pageName: e.target.value })}
                    placeholder="@mybusiness"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ig-pageId">Instagram Business Account ID</Label>
                  <Input
                    id="ig-pageId"
                    value={formData.pageId}
                    onChange={(e) => setFormData({ ...formData, pageId: e.target.value })}
                    placeholder="17841400000000000"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ig-accessToken">Access Token</Label>
                  <Input
                    id="ig-accessToken"
                    type="password"
                    value={formData.accessToken}
                    onChange={(e) => setFormData({ ...formData, accessToken: e.target.value })}
                    placeholder="EAAG..."
                    required
                  />
                </div>
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  Connect
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Connected Platforms List */}
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : connections.length > 0 ? (
          <div className="space-y-3 mt-6">
            <h3 className="font-medium text-sm text-muted-foreground">Connected Accounts</h3>
            {connections.map((connection) => (
              <div key={connection.id} className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  {connection.platform === "facebook" ? (
                    <div className="bg-blue-500 p-2 rounded-lg">
                      <Facebook className="h-5 w-5 text-white" />
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-500 p-2 rounded-lg">
                      <Instagram className="h-5 w-5 text-white" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-foreground">{connection.page_name}</p>
                    <p className="text-sm text-muted-foreground capitalize">{connection.platform}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    {connection.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-muted-foreground" />
                    )}
                    <Switch
                      checked={connection.is_active}
                      onCheckedChange={() => handleToggle(connection.id, connection.is_active)}
                    />
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(connection.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : null}

        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <h4 className="font-medium text-sm mb-2 text-foreground">Setup Instructions</h4>
          <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
            <li>Create a Facebook App in Meta Developer Console</li>
            <li>Add Instagram Graph API and Messenger Platform</li>
            <li>Get Page Access Token with required permissions</li>
            <li>Set up webhooks to point to your app URL</li>
            <li>Add your connection details above</li>
          </ol>
        </div>
      </div>
    </Card>
  )
}
