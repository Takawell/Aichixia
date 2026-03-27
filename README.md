<div align="center">

<img src="https://www.aichixia.xyz/favicon.ico" width="64" height="64" alt="Aichixia" />

# Aichixia

**Unified AI API Platform — OpenAI & Anthropic Compatible**

[![Live](https://img.shields.io/badge/Live-aichixia.xyz-02A9FF?style=for-the-badge&logo=vercel&logoColor=white)](https://www.aichixia.xyz)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

Access 20+ AI models — Claude, GPT, Gemini, Grok, DeepSeek, and more — through a single OpenAI-compatible API. Includes image generation, text-to-speech, an API playground, and a full developer console.

[**Live Demo**](https://www.aichixia.xyz) · [**API Docs**](https://www.aichixia.xyz/docs) · [**Console**](https://www.aichixia.xyz/console)

</div>

---

## What is Aichixia?

Aichixia is an open-source AI API gateway that aggregates 20+ state-of-the-art language models, image generation models, and TTS models behind a single unified API. It is fully OpenAI SDK-compatible and also supports the Anthropic SDK — change one line of code to switch from any existing AI provider.

**Key highlights:**
- One API key for all models
- OpenAI SDK + Anthropic SDK compatible
- Image generation (`/api/v1/images/generations`)
- Text-to-speech (`/api/v1/audio/speech`)
- Built-in API playground in the console
- API key management with rate limiting
- Free and Pro tiers

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (Pages Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth |
| Styling | Tailwind CSS |
| Deployment | Vercel |
| AI Providers | OpenAI, Anthropic, Google, xAI, DeepSeek, Mistral, Cloudflare AI, Typecast, and more |

---

## API Endpoints

### Chat Completions (OpenAI-compatible)

```http
POST /api/v1/chat/completions
Authorization: Bearer YOUR_API_KEY
```

```typescript
import OpenAI from "openai";

const client = new OpenAI({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://www.aichixia.xyz/api/v1",
});

const response = await client.chat.completions.create({
  model: "claude-opus-4.5",
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(response.choices[0].message.content);
```

### Messages (Anthropic-compatible)

```http
POST /api/v1/messages
x-api-key: YOUR_API_KEY
```

```typescript
import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({
  apiKey: "YOUR_API_KEY",
  baseURL: "https://www.aichixia.xyz/api/v1",
});

const message = await client.messages.create({
  model: "grok-3",
  max_tokens: 1024,
  messages: [{ role: "user", content: "Hello!" }],
});

console.log(message.content[0].text);
```

### Image Generation

```http
POST /api/v1/images/generations
Authorization: Bearer YOUR_API_KEY
```

```json
{
  "model": "flux-2-dev",
  "prompt": "A serene mountain landscape at sunset",
  "size": "1024x1024",
  "steps": 30,
  "response_format": "b64_json"
}
```

### Text-to-Speech

```http
POST /api/v1/audio/speech
Authorization: Bearer YOUR_API_KEY
```

```json
{
  "model": "starling-tts",
  "input": "Hello, this is Aichixia speaking.",
  "emotion": "happy",
  "volume": 100,
  "pitch": 0,
  "tempo": 1.0
}
```

---

## Available Models

### Text Generation

| Model ID | Name | Provider | Context | Plan |
|----------|------|----------|---------|------|
| `gpt-5-mini` | GPT-5 Mini | OpenAI | 400K | Free |
| `gpt-5.2` | GPT-5.2 | OpenAI | 400K | Free |
| `gpt-oss-120b` | GPT-OSS 120B | OpenAI | 131K | Free |
| `claude-opus-4.5` | Claude Opus 4.5 | Anthropic | 200K | Pro |
| `gemini-3-flash` | Gemini 3 Flash | Google | 1M | Free |
| `grok-3` | Grok 3 | xAI | 1M | Free |
| `grok-4-fast` | Grok 4 Fast | xAI | 2M | Pro |
| `deepseek-v3.2` | DeepSeek V3.2 | DeepSeek | 128K | Pro |
| `deepseek-v3.1` | DeepSeek V3.1 | DeepSeek | 128K | Free |
| `mistral-3.1` | Mistral 3.1 | Mistral AI | 128K | Free |
| `kimi-k2` | Kimi K2 | Moonshot | 256K | Free |
| `glm-4.7` | GLM 4.7 | Zhipu | 200K | Pro |
| `glm-4.7-flash` | GLM 4.7 Flash | Zhipu | 131K | Free |
| `qwen3-235b` | Qwen3 235B | Alibaba | 256K | Pro |
| `qwen3-coder-480b` | Qwen3 Coder 480B | Alibaba | 256K | Free |
| `minimax-m2.1` | MiniMax M2.1 | MiniMax | 200K | Pro |
| `llama-3.3-70b` | Llama 3.3 70B | Meta | 130K | Free |
| `mimo-v2-flash` | MiMo V2 Flash | Xiaomi | 256K | Free |
| `groq-compound` | Groq Compound | Groq | 131K | Free |
| `cohere-command-a` | Cohere Command A | Cohere | 256K | Free |
| `aichixia-flash` | Aichixia 114B | Aichiverse | 256K | Pro |

> Vision models (image input supported): `gemini-3-flash`, `gpt-5.2`, `aichixia-flash`, `grok-4-fast`

### Image Generation

| Model ID | Name | Provider |
|----------|------|----------|
| `flux-2-dev` | Flux 2 | Black Forest Labs |
| `lucid-origin` | Lucid Origin | Leonardo |
| `phoenix-1.0` | Phoenix 1.0 | Leonardo |
| `nano-image` | Nano Banana Pro | Google Gemini |

### Text-to-Speech

| Model ID | Name | Provider |
|----------|------|----------|
| `starling-tts` | Starling TTS | Typecast |
| `lindsay-tts` | Lindsay TTS | Typecast |

---

## Architecture

```mermaid
graph TB
    subgraph Client["Client"]
        A[Web App / SDK / HTTP]
    end

    subgraph Gateway["Aichixia API Gateway (Next.js)"]
        B[Auth & API Key Verification]
        C[Rate Limiter]
        D[Request Router]
    end

    subgraph Endpoints["Endpoints"]
        E[/api/v1/chat/completions]
        F[/api/v1/messages]
        G[/api/v1/images/generations]
        H[/api/v1/audio/speech]
    end

    subgraph Providers["AI Providers"]
        I[OpenAI · Anthropic · Google]
        J[xAI · DeepSeek · Mistral]
        K[Zhipu · Alibaba · Meta]
        L[Cloudflare AI · Typecast]
    end

    subgraph Storage["Supabase"]
        M[(API Keys)]
        N[(Request Logs)]
        O[(Usage Stats)]
    end

    A --> B
    B --> C
    C --> D
    D --> E & F & G & H
    E & F --> I & J & K
    G --> L
    H --> L
    B --> M
    D --> N & O
```

---

## Project Structure

```
aichixia/
├── pages/
│   ├── index.tsx                  # Landing page
│   ├── docs.tsx                   # API documentation
│   ├── api/
│   │   ├── v1/
│   │   │   ├── chat/
│   │   │   │   └── completions.ts # OpenAI-compatible chat endpoint
│   │   │   ├── messages.ts        # Anthropic-compatible endpoint
│   │   │   ├── images/
│   │   │   │   └── generations.ts # Image generation endpoint
│   │   │   └── audio/
│   │   │       └── speech.ts      # Text-to-speech endpoint
│   │   └── console/
│   │       ├── keys.ts            # API key management
│   │       ├── stats.ts           # Usage statistics
│   │       └── profile.ts         # User profile
│   └── console/
│       └── index.tsx              # Developer console
├── components/
│   └── console/
│       ├── overview.tsx
│       ├── apikeys.tsx
│       ├── activity.tsx
│       ├── models.tsx
│       ├── playground.tsx
│       └── settings.tsx
├── lib/
│   ├── supabase.ts
│   ├── console-utils.ts           # API key verification, logging
│   ├── openai.ts                  # GPT-5 Mini
│   ├── claude.ts                  # Claude Opus 4.5
│   ├── gemini.ts                  # Gemini 3 Flash
│   ├── grok.ts                    # Grok 3
│   ├── grok-fast.ts               # Grok 4 Fast
│   ├── deepseek.ts                # DeepSeek V3.2
│   ├── deepseek-v.ts              # DeepSeek V3.1
│   ├── mistral.ts / zhipu.ts      # Mistral / GLM via Cloudflare
│   ├── kimi.ts                    # Kimi K2
│   ├── glm.ts                     # GLM 4.7
│   ├── qwen.ts / qwen3.ts         # Qwen3 models
│   ├── minimax.ts                 # MiniMax M2.1
│   ├── llama.ts                   # Llama 3.3 70B
│   ├── gpt.ts / gpt-oss.ts        # GPT-5.2 / GPT-OSS
│   ├── mimo.ts                    # MiMo V2 Flash
│   ├── compound.ts                # Groq Compound
│   ├── cohere.ts                  # Cohere Command A
│   ├── aichixia.ts                # Aichixia 114B
│   ├── flux.ts / lucid.ts         # Image generation
│   ├── phoenix.ts / nano.ts       # Image generation
│   ├── starling.ts                # Starling TTS
│   └── lindsay.ts                 # Lindsay TTS
└── public/
```

---

## Getting Started

### Prerequisites

- Node.js 18+
- A Supabase project
- API keys for whichever AI providers you want to enable

### Installation

```bash
git clone https://github.com/Takawell/Aichixia.git
cd Aichixia
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Text Models
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GEMINI_API_KEY=
XAI_API_KEY=
DEEPSEEK_API_KEY=
KIMI_API_KEY=
MINIMAX_API_KEY=
COHERE_API_KEY=

# Cloudflare AI (Mistral, GLM, Llama, MiMo, Groq Compound)
CLOUDFLARE_API_KEY=
CLOUDFLARE_ACCOUNT_ID=
ZHIPU_API_KEY=
ZHIPU_ACCOUNT_ID=

# Image Generation (via Cloudflare)
FLUX_MODEL=@cf/black-forest-labs/flux-2-dev
LUCID_MODEL=@cf/leonardo/lucid-origin
PHOENIX_MODEL=@cf/leonardo/phoenix-1.0

# TTS (Typecast)
TTS_API_KEY=
TTS_VOICE_ID=
TTS_VOICE_ID_LINDSAY=
TTS_MODEL=ssfm-v21
TTS_MODEL_LINDSAY=ssfm-v21
```

### Supabase Schema

Run these in your Supabase SQL editor:

```sql
create table api_keys (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  key text unique not null,
  name text not null,
  prefix text not null,
  is_active boolean default true,
  rate_limit integer default 100,
  requests_used integer default 0,
  last_reset_at timestamptz default now(),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table request_logs (
  id uuid default gen_random_uuid() primary key,
  api_key_id uuid references api_keys not null,
  user_id uuid references auth.users not null,
  model text not null,
  endpoint text not null,
  status integer not null,
  latency_ms integer,
  tokens_used integer default 0,
  error_message text,
  ip_address text,
  user_agent text,
  created_at timestamptz default now()
);

create table daily_usage (
  id uuid default gen_random_uuid() primary key,
  api_key_id uuid references api_keys not null,
  user_id uuid references auth.users not null,
  date date not null,
  requests_count integer default 0,
  tokens_used integer default 0,
  success_count integer default 0,
  error_count integer default 0,
  created_at timestamptz default now()
);

create table user_settings (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique not null,
  plan text default 'free' check (plan in ('free', 'pro', 'enterprise')),
  plan_expires_at timestamptz,
  is_admin boolean default false,
  created_at timestamptz default now()
);

create table user_profiles (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users unique not null,
  display_name text,
  avatar_url text,
  created_at timestamptz default now()
);
```

### Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

The easiest way to deploy is via [Vercel](https://vercel.com):

```bash
npm install -g vercel
vercel
```

Add all environment variables in your Vercel project settings. The project deploys automatically on push to `main`.

---

## Console Features

The built-in developer console at `/console` includes:

- **Overview** — usage stats, daily request chart, active keys
- **API Keys** — create, revoke, and rename keys (max 2 active)
- **Activity** — full request log with model, endpoint, status, latency, tokens
- **Models** — browse all available models with endpoint details
- **Playground** — interactive API tester with code generation in 12 languages
- **Settings** — profile management, plan info, promo code redemption

---

## Plans

| Feature | Free | Pro |
|---------|------|-----|
| API Keys | Up to 2 | Up to 2 |
| Rate Limit | 100 req/reset | 400 req/reset |
| All free models | ✓ | ✓ |
| Pro models (Claude, Grok 4, DeepSeek V3.2...) | ✗ | ✓ |
| Priority access | ✗ | ✓ |

Pro is free — find the redeem code in the docs.

---

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.

1. Fork the repo
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add your feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

---

## Related Projects

[![Aichiow](https://img.shields.io/badge/Aichiow-6A5ACD?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Takawell/Aichiow)

---

## License

MIT © [Takawell](https://github.com/Takawell)
