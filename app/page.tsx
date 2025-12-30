import { getAgent, getKnowledgeBaseFiles, getAgentAnalytics } from "./actions/agent-actions"
import { AgentConfigForm } from "@/components/agent-config-form"
import { KnowledgeBaseSection } from "@/components/knowledge-base-section"
import { PlatformConnectionsCard } from "@/components/platform-connections-card"
import { TestAgentCard } from "@/components/test-agent-card"
import { DashboardOverview } from "@/components/dashboard-overview"
import { MessageSquare, Settings, Upload, Link, TestTube, AlertCircle, BarChart3 } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default async function Home() {
  if (!process.env.DATABASE_URL) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert variant="destructive" className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Database Not Connected</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>Please set up your database connection to use this app:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Open the Vars section in the left sidebar</li>
              <li>
                Add a new environment variable: <code className="bg-muted px-1 py-0.5 rounded">DATABASE_URL</code>
              </li>
              <li>Paste your Neon or Supabase connection string</li>
              <li>Refresh the page</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  const agent = await getAgent()
  const knowledgeBaseFiles = await getKnowledgeBaseFiles()
  const analytics = await getAgentAnalytics()

  if (!agent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Alert className="max-w-2xl">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>Database Setup Required</AlertTitle>
          <AlertDescription className="mt-2 space-y-2">
            <p>Your database is connected but needs to be initialized:</p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Click the Scripts tab in the bottom panel</li>
              <li>
                Run the <code className="bg-muted px-1 py-0.5 rounded">001_initial_schema.sql</code> script
              </li>
              <li>Wait for it to complete</li>
              <li>Refresh this page</li>
            </ol>
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold tracking-tight">Social Media AI Agent</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Automate responses for Facebook & Instagram</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <Tabs defaultValue="dashboard" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 h-auto p-1">
            <TabsTrigger value="dashboard" className="gap-2 data-[state=active]:bg-background">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="agent" className="gap-2 data-[state=active]:bg-background">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Config</span>
            </TabsTrigger>
            <TabsTrigger value="knowledge" className="gap-2 data-[state=active]:bg-background">
              <Upload className="h-4 w-4" />
              <span className="hidden sm:inline">Knowledge</span>
            </TabsTrigger>
            <TabsTrigger value="platforms" className="gap-2 data-[state=active]:bg-background">
              <Link className="h-4 w-4" />
              <span className="hidden sm:inline">Platforms</span>
            </TabsTrigger>
            <TabsTrigger value="test" className="gap-2 data-[state=active]:bg-background">
              <TestTube className="h-4 w-4" />
              <span className="hidden sm:inline">Test</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="mt-6">
            {analytics ? (
              <DashboardOverview analytics={analytics} />
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No Data Available</AlertTitle>
                <AlertDescription>
                  Connect your platforms and start receiving messages to see analytics.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          <TabsContent value="agent" className="mt-6">
            <AgentConfigForm agent={agent} />
          </TabsContent>

          <TabsContent value="knowledge" className="mt-6">
            <KnowledgeBaseSection files={knowledgeBaseFiles} />
          </TabsContent>

          <TabsContent value="platforms" className="mt-6">
            <PlatformConnectionsCard agentId={agent.id} />
          </TabsContent>

          <TabsContent value="test" className="mt-6">
            <TestAgentCard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
