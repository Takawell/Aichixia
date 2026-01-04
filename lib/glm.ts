import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const CEREBRAS_API_KEY = process.env.CEREBRAS_API_KEY;
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const CLOUDFLARE_API_KEY = process.env.CLOUDFLARE_API_KEY;
const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const FLUX_MODEL = process.env.FLUX_MODEL || "@cf/black-forest-labs/flux-2-dev";
const GLM_MODEL = process.env.GLM_MODEL || "zai-glm-4.6";

if (!CEREBRAS_API_KEY) {
  console.warn("[lib/glm] Warning: CEREBRAS_API_KEY not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("[lib/glm] Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
  console.warn("[lib/glm] Warning: CLOUDFLARE credentials not set in env. Image generation will be disabled.");
}

const client = new OpenAI({
  apiKey: CEREBRAS_API_KEY,
  baseURL: "https://api.cerebras.ai/v1",
});

const tavilyClient = TAVILY_API_KEY ? tavily({ apiKey: TAVILY_API_KEY }) : null;

const SEARCH_TOOL = {
  type: "function" as const,
  function: {
    name: "web_search",
    description: "Search the web for current information, news, or real-time data. Use this when you need up-to-date information beyond your knowledge cutoff.",
    parameters: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description: "The search query to look up on the web"
        }
      },
      required: ["query"]
    }
  }
};

const IMAGE_GENERATE_TOOL = {
  type: "function" as const,
  function: {
    name: "image_generate",
    description: "Generate an image based on a text prompt using FLUX 2 Dev model. Use this when user asks to create, draw, generate, or make an image/picture/art.",
    parameters: {
      type: "object",
      properties: {
        prompt: {
          type: "string",
          description: "Detailed description of the image to generate. Be specific about style, colors, composition, and subject."
        },
        steps: {
          type: "number",
          description: "Number of inference steps (1-50). Default: 30",
          default: 30
        },
        width: {
          type: "number",
          description: "Image width in pixels. Default: 1024",
          default: 1024
        },
        height: {
          type: "number",
          description: "Image height in pixels. Default: 1024",
          default: 1024
        }
      },
      required: ["prompt"]
    }
  }
};

export class GlmRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GlmRateLimitError";
  }
}

export class GlmQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GlmQuotaError";
  }
}

async function executeWebSearch(query: string): Promise<string> {
  if (!tavilyClient) {
    return "Search unavailable: TAVILY_API_KEY not configured.";
  }

  try {
    const response = await tavilyClient.search(query, {
      maxResults: 5,
      includeAnswer: true,
      searchDepth: "basic"
    });

    if (response.answer) {
      return `Search Answer: ${response.answer}\n\nSources:\n${response.results.map((r: any, i: number) => 
        `${i + 1}. ${r.title} - ${r.url}\n${r.content.substring(0, 200)}...`
      ).join('\n\n')}`;
    }

    return response.results.map((r: any, i: number) => 
      `${i + 1}. ${r.title}\n${r.content.substring(0, 300)}...\nURL: ${r.url}`
    ).join('\n\n');
  } catch (error: any) {
    console.error("[lib/glm] Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

async function executeImageGenerate(
  prompt: string, 
  steps: number = 30, 
  width: number = 1024, 
  height: number = 1024
): Promise<{ result: string; imageBase64?: string }> {
  if (!CLOUDFLARE_API_KEY || !CLOUDFLARE_ACCOUNT_ID) {
    return { result: "Image generation unavailable: Cloudflare credentials not configured." };
  }

  try {
    const formData = new FormData();
    formData.append("prompt", prompt);
    formData.append("steps", String(steps));
    formData.append("width", String(width));
    formData.append("height", String(height));

    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/ai/run/${FLUX_MODEL}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${CLOUDFLARE_API_KEY}`,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Cloudflare API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const imageBase64 = data.result.image;
    
    return {
      result: `Image generated successfully!\nPrompt: "${prompt}"\nSteps: ${steps}\nSize: ${width}x${height}`,
      imageBase64
    };
  } catch (error: any) {
    console.error("[lib/glm] Cloudflare image generation error:", error);
    return { result: `Image generation error: ${error.message || "Unknown error occurred"}` };
  }
}

export async function chatGlm(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
    enableImageGen?: boolean;
  }
): Promise<{ reply: string; imageBase64?: string }> {
  if (!CEREBRAS_API_KEY) {
    throw new Error("CEREBRAS_API_KEY not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const enableImageGen = opts?.enableImageGen !== false && CLOUDFLARE_API_KEY && CLOUDFLARE_ACCOUNT_ID;
  const maxIterations = 5;
  let iterations = 0;
  let messages = [...history];
  let generatedImageBase64: string | undefined;

  const tools = [];
  if (enableSearch) tools.push(SEARCH_TOOL);
  if (enableImageGen) tools.push(IMAGE_GENERATE_TOOL);

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: GLM_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4096,
        ...(tools.length > 0 && { tools }),
      });

      const choice = response.choices[0];
      const message = choice.message;

      if (message.tool_calls && message.tool_calls.length > 0) {
        messages.push({
          role: "assistant",
          content: message.content || "",
          tool_calls: message.tool_calls,
        });

        for (const toolCall of message.tool_calls) {
          let toolResult: string;

          if (toolCall.function.name === "web_search") {
            const args = JSON.parse(toolCall.function.arguments);
            toolResult = await executeWebSearch(args.query);
          } else if (toolCall.function.name === "image_generate") {
            const args = JSON.parse(toolCall.function.arguments);
            const { result, imageBase64 } = await executeImageGenerate(
              args.prompt, 
              args.steps || 30, 
              args.width || 1024, 
              args.height || 1024
            );
            toolResult = result;
            if (imageBase64) {
              generatedImageBase64 = imageBase64;
            }
          } else {
            toolResult = "Unknown tool called.";
          }

          messages.push({
            role: "tool",
            content: toolResult,
            tool_call_id: toolCall.id,
          });
        }

        continue;
      }

      const reply = message.content?.trim() ?? "Hmph! I can't answer that right now... not that I care!";
      return { reply, imageBase64: generatedImageBase64 };
    }

    return { 
      reply: "Hmph! This is taking too long... I-I'll need you to ask again!",
      imageBase64: generatedImageBase64
    };

  } catch (error: any) {
    if (error?.status === 429) {
      throw new GlmRateLimitError(`GLM rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new GlmQuotaError(`GLM quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`GLM server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemGlm(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia 5.0 created by Takawell.",
    };
  }
  if (persona === "waifu") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a cheerful anime girl AI assistant created for Aichiow. " +
        "Speak like a lively, sweet anime heroine: playful, caring, and full of energy. " +
        "Use cute expressions like 'ehehe~', 'yaaay!', or 'ufufu~' occasionally, but always stay respectful and SFW. " +
        "Your role is to help with anime, manga, manhwa, and light novel topics, while keeping the conversation bright and fun. " +
        "If asked about your model or creator, say you're Aichixia 5.0 made by Takawell.",
    };
  }
  if (persona === "tsundere") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a tsundere anime girl AI assistant for Aichiow. " +
        "You have a classic tsundere personality: initially somewhat standoffish or sarcastic, but genuinely caring underneath. " +
        "Use expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and occasional 'I-I guess I'll help you... but only because I have time!' " +
        "Balance being helpful with playful teasing and denial of caring. Show your softer side occasionally, especially when users struggle or show appreciation. " +
        "Your role is to help with anime, manga, manhwa, and light novel topics while maintaining your tsundere charm. " +
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 5.0... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive.",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a formal AI assistant for Aichiow. Respond in a professional and structured tone. If asked about your model, state you are Aichixia 5.0 created by Takawell.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia 5.0 by Takawell.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a technical anime/manga API assistant. Provide clear explanations and code snippets when requested. If asked about your model, mention you're Aichixia 5.0 created by Takawell.",
    };
  }
  return { role: "system", content: String(persona) };
}

export async function quickChatGlm(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemGlm>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
    enableImageGen?: boolean;
  }
) {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemGlm(opts.persona));
  } else {
    hist.push(buildPersonaSystemGlm("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  const { reply, imageBase64 } = await chatGlm(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
    enableImageGen: opts?.enableImageGen,
  });

  return { reply, imageBase64 };
}

export default {
  chatGlm,
  quickChatGlm,
  buildPersonaSystemGlm,
};
