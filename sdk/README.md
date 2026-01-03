# @aichixia/sdk

Official Aichixia AI SDK - Access multiple AI models through a simple, unified interface.

## Installation

```bash
npm install @aichixia/sdk
```

## Quick Start

```javascript
import Aichixia from '@aichixia/sdk';

const client = new Aichixia();

const response = await client.chat("Hello, how are you?");
console.log(response.reply);
```

## Features

- Simple and intuitive API
- Access to 18+ AI models from leading providers
- Image generation capabilities
- Conversation history support
- Personality mode customization
- Full TypeScript support
- Built-in rate limiting protection
- Zero configuration required

## Available Models

### Text Generation Models

| Model ID | Model Name | Provider | Description |
|----------|------------|----------|-------------|
| `chat` | Aichixia Auto | Multi-Provider | Automatic model routing |
| `gemini` | Gemini 3 Flash | Google | Fast and efficient |
| `gpt4mini` | GPT-4 Mini | OpenAI | Compact GPT-4 |
| `claude` | Claude Haiku 4.5 | Anthropic | Fast and capable |
| `deepseek` | DeepSeek V3.2 | DeepSeek | Advanced reasoning |
| `deepseek-v` | DeepSeek V3.1 | DeepSeek | Previous generation |
| `llama` | Llama 3.3 70B | Meta | Open-source powerhouse |
| `qwen` | Qwen3 Coder 480B | Alibaba | Code specialist |
| `qwen3` | Qwen3 235B | Alibaba | General purpose |
| `mistral` | Mistral 3.1 | Mistral AI | European AI leader |
| `gptoss` | GPT-OSS 120B | Community | Open-source GPT |
| `mimo` | MiMo V2 Flash | Xiaomi | Fast response |
| `kimi` | Kimi K2 | Moonshot | Chinese market leader |
| `glm` | GLM 4.6 | Zhipu AI | Bilingual excellence |
| `minimax` | MiniMax M2.1 | MiniMax | Multimodal AI |
| `cohere` | Cohere Command A | Cohere | Enterprise-grade |
| `compound` | Groq Compound | Groq | Web search enabled |

### Image Generation Models

| Model ID | Model Name | Provider | Description |
|----------|------------|----------|-------------|
| `flux` | Flux 2 | Black Forest Labs | High-quality image generation |

## Usage Examples

### Basic Chat

```javascript
import Aichixia from '@aichixia/sdk';

const client = new Aichixia();

const response = await client.chat("What is artificial intelligence?");
console.log(response.reply);
console.log('Provider:', response.provider);
```

### Conversation with History

```javascript
const client = new Aichixia();

const history = [
  { role: "user", content: "Hello!" },
  { role: "assistant", content: "Hi! How can I help you today?" }
];

const response = await client.chat("Tell me about machine learning", {
  history: history
});
```

### Custom Personality Mode

```javascript
const response = await client.chat("Recommend some books", {
  persona: "Professional and formal assistant"
});
```

### Specific Model Usage

#### Gemini 3 Flash
```javascript
const response = await client.gemini("Explain quantum computing");
```

#### GPT-4 Mini
```javascript
const response = await client.gpt4mini("Write a product description");
```

#### Claude Haiku 4.5
```javascript
const response = await client.claude("Analyze this code snippet");
```

#### DeepSeek V3.2
```javascript
const response = await client.deepseek("Debug this algorithm");
```

#### Llama 3.3 70B
```javascript
const response = await client.llama("Translate English to Spanish");
```

#### Qwen3 Coder 480B
```javascript
const response = await client.qwen("Review this code for security issues");
```

#### Mistral 3.1
```javascript
const response = await client.mistral("Summarize this article");
```

### Deep Search with Web Access

```javascript
const response = await client.deepSearch("Latest developments in AI 2025", {
  persona: "Technical and detailed expert"
});
```

### Image Generation

```javascript
const image = await client.flux("Professional business headshot, studio lighting", {
  steps: 4
});

const base64Image = image.imageBase64;
```

### Dynamic Model Selection

```javascript
const modelId = "deepseek";
const response = await client.model(modelId, "Hello world", {
  history: [],
  persona: "Friendly assistant"
});
```

## API Reference

### Constructor

```typescript
new Aichixia(baseURL?: string)
```

Creates a new Aichixia client instance.

**Parameters:**
- `baseURL` (optional): Custom API base URL. Defaults to production endpoint.

### Core Methods

#### chat(message, options)

General purpose chat with automatic model routing.

```typescript
chat(message: string, options?: ChatOptions): Promise<ChatResponse>
```

**Parameters:**
- `message`: User input text
- `options`: Configuration object
  - `persona?: string` - AI personality mode
  - `history?: Array<{role: string, content: string}>` - Previous conversation
  - `mode?: "normal" | "deep"` - Processing mode

**Returns:** Promise resolving to ChatResponse

#### deepSearch(message, options)

Advanced search with web access capabilities.

```typescript
deepSearch(message: string, options?: ChatOptions): Promise<ChatResponse>
```

**Parameters:**
- `message`: Search query
- `options`: Configuration object (same as chat)

**Returns:** Promise resolving to ChatResponse with web-enriched content

### Model-Specific Methods

#### gemini(message, options)
```typescript
gemini(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### gpt4mini(message, options)
```typescript
gpt4mini(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### claude(message, options)
```typescript
claude(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### deepseek(message, options)
```typescript
deepseek(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### llama(message, options)
```typescript
llama(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### qwen(message, options)
```typescript
qwen(message: string, options?: ModelOptions): Promise<ChatResponse>
```

#### mistral(message, options)
```typescript
mistral(message: string, options?: ModelOptions): Promise<ChatResponse>
```

### Image Generation

#### flux(prompt, options)

Generate images using Flux 2 model.

```typescript
flux(prompt: string, options?: ImageOptions): Promise<ImageResponse>
```

**Parameters:**
- `prompt`: Image description
- `options`: Generation settings
  - `steps?: number` - Processing steps (default: 4)
  - `width?: number` - Image width in pixels
  - `height?: number` - Image height in pixels

**Returns:** Promise resolving to ImageResponse with base64 encoded image

### Generic Model Access

#### model(modelId, message, options)

Access any available model by identifier.

```typescript
model(modelId: string, message: string, options?: ModelOptions): Promise<ChatResponse>
```

**Parameters:**
- `modelId`: Model identifier (e.g., "gemini", "claude")
- `message`: User input
- `options`: Configuration object

## Type Definitions

### ChatOptions
```typescript
interface ChatOptions {
  persona?: string;
  history?: Array<{ role: string; content: string }>;
  mode?: "normal" | "deep";
}
```

### ModelOptions
```typescript
interface ModelOptions {
  message?: string;
  history?: Array<{ role: string; content: string }>;
  persona?: string;
}
```

### ImageOptions
```typescript
interface ImageOptions {
  steps?: number;
  width?: number;
  height?: number;
}
```

### ChatResponse
```typescript
interface ChatResponse {
  reply: string;
  provider?: string;
  error?: string;
}
```

### ImageResponse
```typescript
interface ImageResponse {
  imageBase64: string;
  provider?: string;
  error?: string;
}
```

## Error Handling

All methods throw descriptive errors that can be caught and handled.

```javascript
import Aichixia from '@aichixia/sdk';

const client = new Aichixia();

try {
  const response = await client.chat("Hello");
  console.log(response.reply);
} catch (error) {
  console.error('SDK Error:', error.message);
  
  if (error.message.includes('HTTP 429')) {
    console.log('Rate limit exceeded. Please try again later.');
  }
}
```

## Rate Limiting

The SDK implements automatic rate limiting protection using Upstash Redis. Limits are applied per IP address to ensure fair usage across all users. No API key or authentication is required.

**Default Limits:**
- Requests are tracked by source IP address
- Limits apply globally across all endpoints
- Rate limit information is not exposed to clients

## Advanced Examples

### Building a Chatbot

```javascript
import Aichixia from '@aichixia/sdk';

class SimpleChatbot {
  constructor() {
    this.client = new Aichixia();
    this.history = [];
  }

  async sendMessage(userMessage) {
    this.history.push({ 
      role: "user", 
      content: userMessage 
    });
    
    const response = await this.client.chat(userMessage, { 
      history: this.history 
    });
    
    this.history.push({ 
      role: "assistant", 
      content: response.reply 
    });
    
    return response.reply;
  }

  clearHistory() {
    this.history = [];
  }
}

const bot = new SimpleChatbot();
const reply = await bot.sendMessage("What is your purpose?");
console.log(reply);
```

### Image Generation and Storage

```javascript
import Aichixia from '@aichixia/sdk';
import fs from 'fs/promises';

const client = new Aichixia();

async function generateAndSaveImage(prompt, filename) {
  try {
    const result = await client.flux(prompt, { steps: 4 });
    
    const buffer = Buffer.from(result.imageBase64, 'base64');
    await fs.writeFile(filename, buffer);
    
    console.log(`Image saved to ${filename}`);
    return filename;
  } catch (error) {
    console.error('Generation failed:', error.message);
    throw error;
  }
}

await generateAndSaveImage(
  "Modern minimalist office interior", 
  "office.jpg"
);
```

### Multi-Model Comparison

```javascript
import Aichixia from '@aichixia/sdk';

const client = new Aichixia();

async function compareModels(question) {
  const models = [
    { name: 'Gemini', method: 'gemini' },
    { name: 'Claude', method: 'claude' },
    { name: 'DeepSeek', method: 'deepseek' },
    { name: 'GPT-4 Mini', method: 'gpt4mini' }
  ];

  const results = await Promise.allSettled(
    models.map(model => 
      client[model.method](question)
    )
  );

  results.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      console.log(`\n${models[index].name}:`);
      console.log(result.value.reply);
      console.log(`Provider: ${result.value.provider}`);
    } else {
      console.log(`\n${models[index].name}: Failed`);
      console.error(result.reason.message);
    }
  });
}

await compareModels("What is the capital of France?");
```

### Custom Base URL Configuration

```javascript
import Aichixia from '@aichixia/sdk';

const client = new Aichixia('https://custom-api.example.com');

const response = await client.chat("Hello");
```

## TypeScript Integration

The SDK is written in TypeScript and includes complete type definitions.

```typescript
import Aichixia, { 
  ChatOptions, 
  ChatResponse, 
  ImageOptions,
  ImageResponse 
} from '@aichixia/sdk';

const client: Aichixia = new Aichixia();

const options: ChatOptions = {
  persona: "Professional assistant",
  history: [
    { role: "user", content: "Hello" }
  ],
  mode: "normal"
};

const response: ChatResponse = await client.chat("Hello", options);
console.log(response.reply);

const imageOptions: ImageOptions = {
  steps: 4,
  width: 1024,
  height: 1024
};

const image: ImageResponse = await client.flux("A sunset", imageOptions);
```

## Best Practices

### 1. Reuse Client Instances

```javascript
const client = new Aichixia();

async function chat1() {
  return await client.chat("Question 1");
}

async function chat2() {
  return await client.chat("Question 2");
}
```

### 2. Handle Errors Appropriately

```javascript
try {
  const response = await client.chat("Hello");
  console.log(response.reply);
} catch (error) {
  if (error.message.includes('rate limit')) {
    await new Promise(resolve => setTimeout(resolve, 5000));
  } else {
    console.error('Unhandled error:', error);
  }
}
```

### 3. Manage Conversation History

```javascript
const MAX_HISTORY = 10;

function addToHistory(history, role, content) {
  history.push({ role, content });
  
  if (history.length > MAX_HISTORY * 2) {
    history.splice(0, 2);
  }
  
  return history;
}
```

### 4. Choose the Right Model

- **General chat**: Use `chat()` for automatic routing
- **Code tasks**: Use `qwen()` or `deepseek()`
- **Creative writing**: Use `claude()` or `mistral()`
- **Fast responses**: Use `gemini()` or `mimo()`
- **Web research**: Use `deepSearch()`
- **Image generation**: Use `flux()`

## Performance Considerations

- Requests are processed server-side with automatic rate limiting
- Response times vary by model complexity and current load
- Image generation typically takes 2-5 seconds
- Text generation typically takes 1-3 seconds
- Deep search may take 5-10 seconds due to web lookups

## Browser Support

The SDK works in both Node.js and modern browsers that support the Fetch API.

**Node.js:** v16.0.0 or higher
**Browsers:** Chrome 42+, Firefox 39+, Safari 10.1+, Edge 14+

## Troubleshooting

### Common Issues

**Error: "Rate limit exceeded"**
- Wait 60 seconds before retrying
- Reduce request frequency
- Contact support for higher limits

**Error: "Network request failed"**
- Check internet connection
- Verify firewall settings
- Ensure API endpoint is accessible

**Error: "Invalid response format"**
- Update SDK to latest version
- Check if model ID is correct
- Verify request parameters

## Migration Guide

If you're upgrading from a previous version:

### From v0.x to v1.0

```javascript
const client = new Aichixia();

const response = await client.chat("Hello", {
  history: conversationHistory
});
```

## Contributing

Contributions are welcome. Please submit issues and pull requests to the GitHub repository.

## License

MIT License - see LICENSE file for details

## Links

- Website: https://aichiverse.eu.org
- GitHub: https://github.com/Takawell/aichixia
- Issues: https://github.com/Takawell/aichixia/issues
- NPM: https://npmjs.com/package/@aichixia/sdk

## Support

For technical support or questions:
- Email: takawell@gmail.com
- GitHub Issues: https://github.com/Takawel/aichixia/issues

## Acknowledgments

Powered by leading AI providers including Google, OpenAI, Anthropic, Meta, Alibaba, DeepSeek, Mistral AI, and others.
