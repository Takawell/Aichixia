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
const MINIMAX_MODEL = process.env.MINIMAX_MODEL || "minimax/minimax-m2.7";
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
  timeout: 60000,
  maxRetries: 0,
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

export class MinimaxTimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MinimaxTimeoutError";
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

function handleMinimaxError(error: any): never {
  if (error?.name === "AbortError" || error?.code === "ETIMEDOUT" || error?.message?.includes("timeout")) {
    throw new MinimaxTimeoutError(`Minimax request timed out: ${error.message}`);
  }
  if (error?.status === 429) {
    throw new MinimaxRateLimitError(`Minimax rate limit exceeded: ${error.message}`);
  }
  if (error?.status === 402 || error?.code === "insufficient_quota" || error?.message?.includes("quota")) {
    throw new MinimaxQuotaError(`Minimax quota exceeded: ${error.message}`);
  }
  if (error?.status === 503 || error?.status === 500) {
    throw new Error(`Minimax server error: ${error.message}`);
  }
  if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
    throw new Error("Minimax returned an invalid response. The model may be overloaded, please try again.");
  }
  throw error;
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

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 55000);

      let response;
      try {
        response = await client.chat.completions.create(
          {
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
          },
          { signal: controller.signal }
        );
      } finally {
        clearTimeout(timeout);
      }

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
    handleMinimaxError(error);
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
  if (!MINIMAX_API_KEY) {
    throw new Error("MINIMAX_API_KEY not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const enqueue = (text: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
      };

      const enqueueError = (message: string) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: message })}\n\n`));
      };

      try {
        let messages = [...history];
        const maxIterations = 3;
        let iterations = 0;

        while (iterations < maxIterations) {
          iterations++;

          if (iterations > 1 || !enableSearch) {
            const abortController = new AbortController();
            const timeout = setTimeout(() => abortController.abort(), 55000);

            try {
              const streamResponse = await client.chat.completions.create(
                {
                  model: MINIMAX_MODEL,
                  messages: messages.map((m) => ({
                    role: m.role,
                    content: m.content,
                    ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
                    ...(m.tool_calls && { tool_calls: m.tool_calls }),
                  })),
                  temperature: opts?.temperature ?? 0.7,
                  max_tokens: opts?.maxTokens ?? 1080,
                  stream: true,
                },
                { signal: abortController.signal }
              );

              for await (const chunk of streamResponse) {
                const delta = chunk.choices[0]?.delta?.content;
                if (delta) {
                  enqueue(delta);
                }
              }

              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              return;
            } finally {
              clearTimeout(timeout);
            }
          }

          const abortController = new AbortController();
          const timeout = setTimeout(() => abortController.abort(), 55000);

          let response;
          try {
            response = await client.chat.completions.create(
              {
                model: MINIMAX_MODEL,
                messages: messages.map((m) => ({
                  role: m.role,
                  content: m.content,
                  ...(m.tool_call_id && { tool_call_id: m.tool_call_id }),
                  ...(m.tool_calls && { tool_calls: m.tool_calls }),
                })),
                temperature: opts?.temperature ?? 0.7,
                max_tokens: opts?.maxTokens ?? 1080,
                tools: [SEARCH_TOOL],
              },
              { signal: abortController.signal }
            );
          } finally {
            clearTimeout(timeout);
          }

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
                controller.enqueue(
                  encoder.encode(`data: ${JSON.stringify({ searching: args.query })}\n\n`)
                );
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

          const reply = message?.content?.trim() ?? "I'm unable to respond right now.";
          enqueue(reply);
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
          return;
        }

        enqueue("Request took too long. Please try again.");
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      } catch (error: any) {
        let message = "An unexpected error occurred.";
        if (error?.name === "AbortError" || error?.message?.includes("timeout")) {
          message = "Request timed out. The model may be busy, please try again.";
        } else if (error?.status === 429) {
          message = "Rate limit exceeded. Please wait a moment.";
        } else if (error?.message?.includes("<!DOCTYPE") || error?.message?.includes("not valid JSON")) {
          message = "Model returned an invalid response. Please try again.";
        }
        enqueueError(message);
        controller.enqueue(encoder.encode("data: [DONE]\n\n"));
        controller.close();
      }
    },
  });

  return stream;
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
