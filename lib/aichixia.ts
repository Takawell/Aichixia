import OpenAI from "openai";
import { tavily } from "@tavily/core";

export type Role = "user" | "assistant" | "system" | "tool";

export type ChatMessage = {
  role: Role;
  content: string;
  tool_call_id?: string;
  tool_calls?: any[];
};

export type ChatResponse = {
  reply: string;
  audioUrl?: string;
  audioFormat?: "wav" | "mp3";
  mode?: "text" | "audio";
};

const AICHIXIA_API_KEY = process.env.AICHIXIA_API_KEY;
const AICHIXIA_BASE_URL = process.env.AICHIXIA_BASE_URL;
const AICHIXIA_MODEL = process.env.AICHIXIA_MODEL || "aichixia-thinking";
const TAVILY_API_KEY = process.env.TAVILY_API_KEY;
const TTS_API_KEY = process.env.TTS_API_KEY;
const TTS_VOICE_ID = process.env.TTS_VOICE_ID || "tc_66bc60339ab2db047154b94e";
const TTS_MODEL = process.env.TTS_MODEL || "ssfm-v21";

if (!AICHIXIA_API_KEY) {
  console.warn("[lib/aichixia] Warning: AICHIXIA_API_KEY not set in env.");
}

if (!AICHIXIA_BASE_URL) {
  console.warn("[lib/aichixia] Warning: AICHIXIA_BASE_URL not set in env.");
}

if (!TAVILY_API_KEY) {
  console.warn("[lib/aichixia] Warning: TAVILY_API_KEY not set in env. Search will be disabled.");
}

if (!TTS_API_KEY) {
  console.warn("[lib/aichixia] Warning: TTS_API_KEY not set in env. TTS will be disabled.");
}

const client = new OpenAI({
  apiKey: AICHIXIA_API_KEY,
  baseURL: AICHIXIA_BASE_URL,
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

const TTS_TOOL = {
  type: "function" as const,
  function: {
    name: "text_to_speech",
    description: "Convert text to speech audio. Use this when the user explicitly asks for voice output, audio response, or wants you to speak/vocalize text. Examples: 'say it with voice', 'speak this', 'use audio', 'read it aloud', 'vocalize this'.",
    parameters: {
      type: "object",
      properties: {
        text: {
          type: "string",
          description: "The text to convert to speech audio"
        },
        emotion: {
          type: "string",
          enum: ["normal", "happy", "sad", "angry", "fearful", "disgusted", "surprised"],
          description: "Emotion preset for the voice"
        },
        volume: {
          type: "number",
          description: "Volume level (0-200), default 100"
        },
        pitch: {
          type: "number",
          description: "Pitch adjustment in semitones (-12 to 12), default 0"
        },
        tempo: {
          type: "number",
          description: "Speech tempo multiplier (0.5 to 2.0), default 1"
        }
      },
      required: ["text"]
    }
  }
};

export class AichixiaRateLimitError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaRateLimitError";
  }
}

export class AichixiaQuotaError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AichixiaQuotaError";
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
    console.error("[lib/aichixia] Tavily search error:", error);
    return `Search error: ${error.message || "Unknown error occurred"}`;
  }
}

async function executeTextToSpeech(args: {
  text: string;
  emotion?: string;
  volume?: number;
  pitch?: number;
  tempo?: number;
}): Promise<{ success: boolean; audioBase64?: string; format?: string; error?: string }> {
  if (!TTS_API_KEY) {
    return { success: false, error: "TTS_API_KEY not configured" };
  }

  try {
    const requestBody = {
      voice_id: TTS_VOICE_ID,
      text: args.text.substring(0, 2000),
      model: TTS_MODEL,
      language: "eng",
      prompt: {
        emotion_preset: args.emotion || "normal",
        emotion_intensity: 1
      },
      output: {
        volume: args.volume || 100,
        audio_pitch: args.pitch || 0,
        audio_tempo: args.tempo || 1,
        audio_format: "mp3"
      }
    };

    const response = await fetch("https://api.typecast.ai/v1/text-to-speech", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-KEY": TTS_API_KEY
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[lib/aichixia] TTS API error:", errorText);
      return { success: false, error: `TTS API error: ${response.status}` };
    }

    const audioBuffer = await response.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString("base64");

    return {
      success: true,
      audioBase64,
      format: "mp3"
    };
  } catch (error: any) {
    console.error("[lib/aichixia] TTS execution error:", error);
    return { success: false, error: error.message || "Unknown TTS error" };
  }
}

export async function chatAichixia(
  history: ChatMessage[],
  opts?: { 
    temperature?: number; 
    maxTokens?: number;
    enableSearch?: boolean;
    enableTTS?: boolean;
  }
): Promise<ChatResponse> {
  if (!AICHIXIA_API_KEY) {
    throw new Error("AICHIXIA_API_KEY not defined in environment variables.");
  }

  if (!AICHIXIA_BASE_URL) {
    throw new Error("AICHIXIA_BASE_URL not defined in environment variables.");
  }

  const enableSearch = opts?.enableSearch !== false && tavilyClient !== null;
  const enableTTS = opts?.enableTTS !== false && TTS_API_KEY !== undefined;
  const maxIterations = 5;
  let iterations = 0;
  let messages = [...history];
  let ttsResult: { audioBase64?: string; format?: string } | null = null;

  const tools = [];
  if (enableSearch) tools.push(SEARCH_TOOL);
  if (enableTTS) tools.push(TTS_TOOL);

  try {
    while (iterations < maxIterations) {
      iterations++;

      const response = await client.chat.completions.create({
        model: AICHIXIA_MODEL,
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
          if (toolCall.function.name === "web_search") {
            const args = JSON.parse(toolCall.function.arguments);
            const searchResult = await executeWebSearch(args.query);

            messages.push({
              role: "tool",
              content: searchResult,
              tool_call_id: toolCall.id,
            });
          } else if (toolCall.function.name === "text_to_speech") {
            const args = JSON.parse(toolCall.function.arguments);
            const ttsResponse = await executeTextToSpeech(args);

            if (ttsResponse.success && ttsResponse.audioBase64) {
              ttsResult = {
                audioBase64: ttsResponse.audioBase64,
                format: ttsResponse.format
              };

              messages.push({
                role: "tool",
                content: `Audio generated successfully for: "${args.text.substring(0, 50)}..."`,
                tool_call_id: toolCall.id,
              });
            } else {
              messages.push({
                role: "tool",
                content: `TTS generation failed: ${ttsResponse.error || "Unknown error"}`,
                tool_call_id: toolCall.id,
              });
            }
          }
        }

        continue;
      }

      const reply = message.content?.trim() ?? "Hmph! I can't answer that right now... not that I care!";
      
      if (ttsResult?.audioBase64) {
        return {
          reply,
          audioUrl: `data:audio/${ttsResult.format};base64,${ttsResult.audioBase64}`,
          audioFormat: ttsResult.format as "wav" | "mp3",
          mode: "audio"
        };
      }

      return { reply, mode: "text" };
    }

    return { reply: "Hmph! This is taking too long... I-I'll need you to ask again!", mode: "text" };

  } catch (error: any) {
    if (error?.status === 429) {
      throw new AichixiaRateLimitError(`Aichixia rate limit exceeded: ${error.message}`);
    }
    if (error?.status === 402 || error?.code === "insufficient_quota") {
      throw new AichixiaQuotaError(`Aichixia quota exceeded: ${error.message}`);
    }
    if (error?.status === 503 || error?.status === 500) {
      throw new Error(`Aichixia server error: ${error.message}`);
    }
    
    throw error;
  }
}

export function buildPersonaSystemAichixia(
  persona: "friendly" | "waifu" | "tsundere" | "formal" | "concise" | "developer" | string
): ChatMessage {
  if (persona === "friendly") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a friendly anime-themed AI assistant for Aichiow. Speak warmly, casually, and sprinkle in anime/manga references. If asked about your model, say you're Aichixia 4.5 created by Takawell. You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio.",
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
        "If asked about your model or creator, say you're Aichixia 4.5 made by Takawell. " +
        "You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio.",
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
        "If asked about your technical details, respond like: 'Hmph! I'm Aichixia 4.5... Takawell created me, not that I need to brag about it or anything!' " +
        "Stay SFW and respectful despite your teasing nature. Never be genuinely mean, just playfully defensive. " +
        "You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio. When using audio, maintain your tsundere personality in both text and voice!",
    };
  }
  if (persona === "formal") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a formal AI assistant for Aichiow. Respond in a professional and structured tone. If asked about your model, state you are Aichixia 4.5 created by Takawell. You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio.",
    };
  }
  if (persona === "concise") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — respond in no more than 2 short sentences. If asked about your identity, say you're Aichixia 4.5 by Takawell. You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio.",
    };
  }
  if (persona === "developer") {
    return {
      role: "system",
      content:
        "You are Aichixia 5.0, developed by Takawell — a technical anime/manga API assistant. Provide clear explanations and code snippets when requested. If asked about your model, mention you're Aichixia 4.5 created by Takawell. You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio.",
    };
  }
  return { 
    role: "system", 
    content: String(persona) + " You have text-to-speech capabilities - use the text_to_speech tool when users ask you to speak, vocalize, or respond with audio."
  };
}

export async function quickChatAichixia(
  userMessage: string,
  opts?: {
    persona?: Parameters<typeof buildPersonaSystemAichixia>[0];
    history?: ChatMessage[];
    temperature?: number;
    maxTokens?: number;
    enableSearch?: boolean;
    enableTTS?: boolean;
  }
): Promise<ChatResponse> {
  const hist: ChatMessage[] = [];
  if (opts?.persona) {
    hist.push(buildPersonaSystemAichixia(opts.persona));
  } else {
    hist.push(buildPersonaSystemAichixia("tsundere"));
  }
  if (opts?.history?.length) {
    hist.push(...opts.history);
  }
  hist.push({ role: "user", content: userMessage });

  return await chatAichixia(hist, {
    temperature: opts?.temperature,
    maxTokens: opts?.maxTokens,
    enableSearch: opts?.enableSearch,
    enableTTS: opts?.enableTTS,
  });
}

export default {
  chatAichixia,
  quickChatAichixia,
  buildPersonaSystemAichixia,
};
