# Social Media AI Agent

An intelligent automation system for managing Facebook and Instagram business page messages with AI-powered responses.

## Features

- **AI Agent Configuration**: Customize your agent's personality, model, temperature, and response behavior
- **Knowledge Base**: Upload files (FAQs, product info, policies) for your agent to reference
- **Platform Connections**: Connect multiple Facebook and Instagram business pages
- **Automated Responses**: AI-powered replies to customer messages with context awareness
- **Message History**: Track all conversations and responses
- **Test Mode**: Try your agent before going live

## Setup Instructions

### 1. Database Setup

This app requires a Neon or Supabase database. Run the SQL script in the Scripts section:

\`\`\`bash
# The database schema will be automatically created
\`\`\`

### 2. Environment Variables

Add these environment variables:

\`\`\`env
# Database (Required)
DATABASE_URL=your_database_connection_string

# Webhook Verification (Required for Facebook/Instagram)
WEBHOOK_VERIFY_TOKEN=your_secure_random_token

# AI is handled by Vercel AI Gateway (no API key needed)
\`\`\`

### 3. Facebook/Instagram Setup

1. **Create a Facebook App**:
   - Go to [Meta for Developers](https://developers.facebook.com/)
   - Create a new app with "Business" type
   - Add "Messenger" and "Instagram" products

2. **Configure Webhooks**:
   - In your Facebook App, go to Webhooks
   - Subscribe to `messages` events
   - Set callback URL to: `https://your-app-url/api/webhook`
   - Use your `WEBHOOK_VERIFY_TOKEN` for verification

3. **Get Access Tokens**:
   - Go to Tools > Access Token Tool
   - Generate a Page Access Token with these permissions:
     - `pages_messaging`
     - `pages_read_engagement`
     - `instagram_basic`
     - `instagram_manage_messages`

4. **Connect in App**:
   - Go to Platforms tab
   - Add your Page/Account ID and Access Token
   - Enable the connection

## How It Works

1. **Customer sends message** → Facebook/Instagram forwards it to your webhook
2. **Webhook receives message** → Saves to database and triggers AI generation
3. **AI generates response** → Uses your agent config, knowledge base, and conversation history
4. **Response sent back** → Posted to customer via Facebook/Instagram API

## Testing Your Agent

Use the Test tab to try your agent before connecting platforms:
- Type a sample customer message
- See how your agent responds
- Adjust configuration and knowledge base as needed

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Database**: Neon (PostgreSQL)
- **AI**: Vercel AI SDK with AI Gateway
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Platforms**: Facebook Graph API + Instagram Graph API

## Support

For issues with:
- Facebook/Instagram API → Check Meta Developer docs
- AI responses → Adjust agent configuration and system prompt
- Database → Verify connection string and schema
