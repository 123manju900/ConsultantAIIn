# MyAI3 - AI Consulting Interview Coach

## Overview

MyAI3 is a customizable AI chatbot assistant built with Next.js that functions as a professional case interview coach for consulting preparation. The application simulates realistic consulting case interviews (McKinsey, BCG, Bain-style) and provides structured feedback to candidates.

The system features:
- Real-time AI-powered conversational interviews using OpenAI's GPT-4.1
- Web search capabilities for real-world data retrieval
- Vector database (Pinecone) integration for stored knowledge and frameworks
- Content moderation using OpenAI's moderation API
- Adaptive interview flow that responds to candidate approaches
- Session persistence using localStorage
- Responsive UI built with Radix UI components and Tailwind CSS

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: Next.js 14+ with App Router and React Server Components
- TypeScript-based with strict type checking
- Client-side state management using React hooks and localStorage
- Form handling with React Hook Form and Zod validation
- Real-time streaming UI updates using Vercel AI SDK's `useChat` hook

**UI Component System**: 
- Radix UI primitives for accessible components (dialogs, dropdowns, tooltips, etc.)
- Custom AI-specific components in `components/ai-elements/` for specialized chat UI (messages, tools, reasoning display)
- Tailwind CSS with custom design tokens defined in `globals.css`
- shadcn/ui component library configuration

**Visual Design Theme**:
- Colorful gradient background with animated shifting colors (purple, pink, teal)
- Glass morphism effect on header and footer overlays
- Vibrant purple/violet primary color with WCAG-compliant contrast
- Gradient text effects for header title
- Glowing input field with shadow effects
- Gradient send button with hover animations
- Supports `prefers-reduced-motion` for accessibility

**Message Architecture**:
- User messages rendered with `UserMessage` component
- Assistant messages support multiple part types: text, reasoning, tool calls, and tool results
- Tool execution visualization with streaming state indicators
- Message persistence in browser localStorage with duration tracking for reasoning steps

### Backend Architecture

**AI Integration**:
- Vercel AI SDK for streaming chat completions
- Multiple AI provider support (@ai-sdk/openai, @ai-sdk/groq, @ai-sdk/deepseek, @ai-sdk/xai, @ai-sdk/fireworks)
- Primary model: OpenAI GPT-4.1 configured in `config.ts`
- System prompts separated into modular concerns in `prompts.ts`:
  - Identity and role definition
  - Tool calling behavior
  - Tone and conversational style
  - Guardrails and safety constraints

**API Route Structure**:
- Chat endpoint at `app/api/chat/` handles streaming conversations
- Tool definitions in `app/api/chat/tools/` directory
- Each tool exports its implementation and gets imported into the main route handler
- Tools include web search (Tavily API) and Pinecone vector search

**Content Safety**:
- OpenAI Moderation API integration in `lib/moderation.ts`
- Category-specific denial messages configured in `config.ts`
- Pre-processing of user messages before AI completion

### Data Storage Solutions

**Vector Database**: Pinecone
- Index configured via `PINECONE_INDEX_NAME` environment variable (default: "consultai")
- Semantic search over stored case documents and consulting frameworks
- Top-K retrieval configured in `config.ts` (default: 40 results)
- Text embeddings for query matching
- Namespace support (currently using 'default')
- Source attribution with context windows (pre_context, text, post_context)

**Session Storage**: 
- Browser localStorage for client-side message persistence
- Stores conversation history and reasoning duration metrics
- Key: 'chat-messages'
- Data structure includes UIMessage array and duration tracking object

**State Management**:
- No global state library (Redux, Zustand, etc.)
- React Context used sparingly in UI components
- Vercel AI SDK manages streaming state
- Form state handled by React Hook Form

### Authentication and Authorization

**Current Implementation**: None
- Application is publicly accessible
- No user authentication system
- No API key protection on frontend (API keys stored as environment variables server-side)

**Deployment Security**:
- Server-side API keys for OpenAI, Pinecone, Tavily
- Vercel deployment with environment variable management
- CORS configured via `next.config.ts` for Replit development environments

## External Dependencies

### Third-Party APIs

**OpenAI**:
- GPT-4.1 for chat completions
- Moderation API for content filtering
- Environment variable: `OPENAI_API_KEY`

**Pinecone**:
- Vector database for semantic search
- Stores consulting frameworks and case materials
- Environment variable: `PINECONE_API_KEY`
- Index name configurable in `config.ts`

**Tavily** (implied from web search functionality):
- Web search API for real-time data retrieval
- Used when candidates request current market information
- Tool implementation in `app/api/chat/tools/`

### Key NPM Packages

**AI & ML**:
- `ai` (Vercel AI SDK) - Streaming chat, tool calling
- `@ai-sdk/openai`, `@ai-sdk/groq`, `@ai-sdk/deepseek`, `@ai-sdk/xai`, `@ai-sdk/fireworks` - AI provider integrations
- `@ai-sdk/react` - React hooks for AI interactions
- `@pinecone-database/pinecone` - Vector database client

**UI Framework**:
- `next` - React framework with App Router
- `react`, `react-dom` - Core React libraries
- All `@radix-ui/react-*` packages - Accessible UI primitives
- `tailwindcss` - Utility-first CSS
- `class-variance-authority` - Component variant management
- `@xyflow/react` - Flow diagram rendering (for potential visual case structures)

**Form & Validation**:
- `react-hook-form` - Form state management
- `@hookform/resolvers` - Form validation resolvers
- `zod` - Schema validation

**Utilities**:
- `clsx`, `tailwind-merge` - Class name management
- `streamdown` - Markdown streaming renderer
- `react-syntax-highlighter` - Code syntax highlighting
- `unist-util-visit` - AST traversal for markdown processing
- `motion` (Framer Motion) - Animation library
- `vaul` - Drawer component
- `cmdk` - Command palette
- `embla-carousel-react` - Carousel component
- `recharts` - Charting library
- `use-stick-to-bottom` - Auto-scroll behavior for chat

**Development**:
- `typescript` - Type safety
- `eslint` - Code linting

### Hosting & Deployment

**Platform**: Vercel
- Automatic deployments on git push
- Edge runtime support for API routes
- Environment variable management
- Serverless function execution

**Configuration**:
- `next.config.ts` allows Replit dev origins and server actions
- TypeScript configuration in `tsconfig.json`
- Build command: `next build`
- Dev command: `next dev`