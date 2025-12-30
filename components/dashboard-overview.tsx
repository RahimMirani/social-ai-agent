import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, MessageSquare, Send, TrendingUp, Facebook, Instagram } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface DashboardOverviewProps {
  analytics: {
    uniqueUsers: number
    platformBreakdown: Array<{
      platform: string
      userCount: number
      conversationCount: number
    }>
    messagesSent: number
    messagesReceived: number
    recentConversations: Array<{
      id: string
      platform: string
      platformUserName: string | null
      lastMessageAt: Date
      lastMessage: string | null
      lastSender: string | null
    }>
    dailyActivity: Array<{
      date: Date
      messageCount: number
    }>
  }
}

export function DashboardOverview({ analytics }: DashboardOverviewProps) {
  const facebookData = analytics.platformBreakdown.find((p) => p.platform === "facebook")
  const instagramData = analytics.platformBreakdown.find((p) => p.platform === "instagram")

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.uniqueUsers}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique conversations started</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.messagesSent}</div>
            <p className="text-xs text-muted-foreground mt-1">AI responses delivered</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Messages Received</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics.messagesReceived}</div>
            <p className="text-xs text-muted-foreground mt-1">Customer inquiries</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analytics.messagesReceived > 0
                ? Math.round((analytics.messagesSent / analytics.messagesReceived) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground mt-1">Messages answered</p>
          </CardContent>
        </Card>
      </div>

      {/* Platform Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Breakdown</CardTitle>
          <CardDescription>Activity across connected platforms</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                <Facebook className="h-6 w-6 text-blue-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Facebook</div>
                <div className="text-sm text-muted-foreground">
                  {facebookData?.userCount || 0} users · {facebookData?.conversationCount || 0} conversations
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-lg border p-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 bg-opacity-10">
                <Instagram className="h-6 w-6 text-pink-500" />
              </div>
              <div className="flex-1">
                <div className="font-semibold">Instagram</div>
                <div className="text-sm text-muted-foreground">
                  {instagramData?.userCount || 0} users · {instagramData?.conversationCount || 0} conversations
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Latest interactions with your customers</CardDescription>
        </CardHeader>
        <CardContent>
          {analytics.recentConversations.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No conversations yet. Connect your platforms to start.
            </div>
          ) : (
            <div className="space-y-4">
              {analytics.recentConversations.map((conv) => (
                <div key={conv.id} className="flex items-start gap-4 rounded-lg border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                    {conv.platform === "facebook" ? (
                      <Facebook className="h-5 w-5 text-blue-500" />
                    ) : (
                      <Instagram className="h-5 w-5 text-pink-500" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{conv.platformUserName || "Unknown User"}</p>
                      <Badge variant="secondary" className="capitalize">
                        {conv.platform}
                      </Badge>
                    </div>
                    {conv.lastMessage && (
                      <p className="text-sm text-muted-foreground truncate">
                        {conv.lastSender === "agent" ? "🤖 " : ""}
                        {conv.lastMessage}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.lastMessageAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
