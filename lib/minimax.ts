import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

const MINIMAX_API_KEY = process.env.MINIMAX_API_KEY;
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "minimaxai/minimax-m3";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;

if (!MINIMAX_API_KEY) {
  console.warn("[lib/minimax] Warning: MINIMAX_API_KEY not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("[lib/minimax] Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

const client = new OpenAI({
  apiKey: MINIMAX_API_KEY,
  baseURL: "https://integrate.api.nvidia.com/v1",
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
          description: "The search query to look up on the web",
        },
      },
      required: ["query"],
    },
  },
};

export class MinimaxRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxRateLimitError";
  }
}

export class MinimaxQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxQuotaError";
  }
}

export class MinimaxConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxConfigError";
  }
}

export class MinimaxServerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxServerError";
  }
}

function ensureConfigured() {
  if (!MINIMAX_API_KEY) {
    throw new MinimaxConfigError("Minimax is not configured properly. Please contact the admin.");
  }
}

async function executeWebSearch(query: string): Promise<string> {
  if (!tavilyClient) {
    return "Search unavailable: TAVILY_API_KEY not configured.";
  }

  try {
    const response = await tavilyClient.search(query, {
      maxResults: 6,
      includeAnswer: true,
      searchDepth: "basic",
    });

    if (response.answer) {
      return `Search Answer: ${response.answer}\n\nSources:\n${response.results
        .map(
          (r: any, i: number) =>
            `${i + 1}. ${r.title} - ${r.url}\n${r.content.substring(0, 200)}...`
        )
        .join("\n\n")}`;
    }

    return response.results
      .map(
        (r: any, i: number) =>
          `${i + 1}. ${r.title}\n${r.content.substring(0, 300)}...\nURL: ${r.url}`
      )
      .join("\n\n");
  } catch (error: any) {
    console.error("[lib/minimax] Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

export async function chatMinimax(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<{ reply: string }> {
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const maxIterations = 3;
  let iterations = 0;
  let messages = [...history];

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: MINIMAX_MODEL,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
          ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
          ...(m.tool_calls && { tool_calls: m.tool_calls }),
        })),
        temperature: opts?.temperature ?? 0.8,
        max_tokens: opts?.maxTokens ?? 4090,
        ...(enableSearch && { tools: [SEARCH_TOOL] }),
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
          if (toolCall.function.name === "web_search") {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResult = await executeWebSearch(args.query);

            messages.push({
              role: "tool",
              content: searchResult,
              tool_call_id: toolCall.id,
            });
          }
        }

        continue;
      }

      const reply = message.content?.trim() ?? "I'm unable to respond right now.";
      return { reply };
    }

    return { reply: "Request took too long. Please try again." };
  } catch (error: any) {
    console.error("[lib/minimax] chatMinimax error:", error);

    if (error?.status === 429) {
      throw new MinimaxRateLimitError(`Minimax rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
      throw new MinimaxQuotaError(`Minimax quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Minimax server error: ${error.message}`);
    }

    throw error;
  }
}

export async function streamMinimax(
  history: ChatMessage[],
  opts?: {
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
): Promise<ReadableStream<Uint8Array>> {
  ensureConfigured();

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const encoder = new TextEncoder();
  const model = MINIMAX_MODEL;
  const id = `chatcmpl-${Date.now()}`;
  const created = Math.floor(Date.now() / 1000);

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueueChunk = (
        delta: Record<string, any>,
        finishReason: string | null = null
      ) => {
        const chunk = {
          id,
          object: "chat.completion.chunk",
          created,
          model,
          choices: [
            {
              index: 0,
              delta,
              finish_reason: finishReason,
            },
          ],
        };
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify(chunk)}\n\n`)
        );
      };

      const enqueueDone = () => {
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      };

      try {
        let messages = [...history];
        const maxIterations = 3;
        let iterations = 0;

        while (iterations < maxIterations) {
          iterations++;

          if (enableSearch && iterations === 1) {
            const response = await client.chat.completions.create({
              model,
              messages: messages.map((m) => ({
                role: m.role,
                content: m.content,
                ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
                ...(m.tool_calls && { tool_calls: m.tool_calls }),
              })),
              temperature: opts?.temperature ?? 0.8,
              max_tokens: opts?.maxTokens ?? 4090,
              tools: [SEARCH_TOOL],
            });

            const message = response.choices[0]?.message;

            if (message?.tool_calls && message.tool_calls.length > 0) {
              messages.push({
                role: "assistant",
                content: message.content || "",
                tool_calls: message.tool_calls,
              });

              for (const toolCall of message.tool_calls) {
                if (toolCall.function.name === "web_search") {
                  const args = JSON.parse(toolCall.function.arguments);
                  enqueueChunk({ searching: args.query });
                  const searchResult = await executeWebSearch(args.query);
                  messages.push({
                    role: "tool",
                    content: searchResult,
                    tool_call_id: toolCall.id,
                  });
                }
              }

              continue;
            }

            enqueueChunk({ role: "assistant", content: "" });

            const reply = message?.content?.trim() ?? "I'm unable to respond right now.";
            enqueueChunk({ content: reply });
            enqueueChunk({}, "stop");
            enqueueDone();
            return;
          }

          enqueueChunk({ role: "assistant", content: "" });

          const streamResponse = await client.chat.completions.create({
            model,
            messages: messages.map((m) => ({
              role: m.role,
              content: m.content,
              ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
              ...(m.tool_calls && { tool_calls: m.tool_calls }),
            })),
            temperature: opts?.temperature ?? 0.8,
            max_tokens: opts?.maxTokens ?? 4090,
            stream: true,
          });

          let receivedAny = false;

          for await (const chunk of streamResponse) {
            const delta = chunk.choices[0]?.delta?.content;
            if (delta) {
              receivedAny = true;
              enqueueChunk({ content: delta });
            }
          }

          if (!receivedAny) {
            try {
              const fallback = await chatMinimax(messages, opts);
              enqueueChunk({ content: fallback.reply });
            } catch (fallbackError: any) {
              console.error("[lib/minimax] streamMinimax fallback error:", fallbackError);
              enqueueChunk({ content: "I'm unable to respond right now." });
            }
          }

          enqueueChunk({}, "stop");
          enqueueDone();
          return;
        }

        enqueueChunk({ content: "Request took too long. Please try again." });
        enqueueChunk({}, "stop");
        enqueueDone();
      } catch (error: any) {
        console.error("[lib/minimax] streamMinimax error:", error);

        let message = "Something went wrong, please try again.";

        if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
          message = "Quota exceeded. Please try again later.";
        } else if (error?.status === 503 || error?.status === 500) {
          message = "Server error. Please try again.";
        } else if (
          error?.message?.includes("<!DOCTYPE") ||
          error?.message?.includes("not valid JSON")
        ) {
          message = "Model returned an invalid response. Please try again.";
        }

        enqueueChunk({ content: message });
        enqueueChunk({}, "stop");
        enqueueDone();
      }
    },
  });
}

export async function quickChatMinimax(
  userMessage: string,
  opts?: {
    systemPrompt?: string;
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
  }
) {
  const hist: ChatMessage[] = [];

  if (opts?.systemPrompt) {
    hist.push({ role: "system", content: opts.systemPrompt });
  }

  if (opts?.history?.length) {
    hist.push(...opts.history);
  }

  hist.push({ role: "user", content: userMessage });

  const { reply } = await chatMinimax(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
  });
  
  return reply;
}

export default {
  chatMinimax,
  streamMinimax,
  quickChatMinimax,
};
