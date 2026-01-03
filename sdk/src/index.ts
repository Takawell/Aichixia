interface ChatOptions {
  persona?: string;
  history?: Array<{ role: string; content: string }>;
}

interface ImageOptions {
  steps?: number;
  width?: number;
  height?: number;
}

interface ModelOptions {
  history?: Array<{ role: string; content: string }>;
  persona?: string;
}

interface ChatResponse {
  reply: string;
  provider?: string;
  error?: string;
}

interface ImageResponse {
  imageBase64: string;
  provider?: string;
  error?: string;
}

class AichixiaClient {
  private baseURL: string;

  constructor(baseURL?: string) {
    this.baseURL = baseURL || "https://aichixia.vercel.app";
  }

  private async request<T>(endpoint: string, body: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Aichixia SDK Error: ${error.message}`);
      }
      throw new Error("Aichixia SDK Error: Unknown error occurred");
    }
  }

  async chat(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/gemini", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async deepSearch(message: string, options: ChatOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/compound", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async gemini(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/gemini", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async gpt4mini(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/openai", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async claude(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/claude", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async deepseek(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/deepseek", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async deepseekV(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/deepseek-v", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async llama(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/llama", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async qwen(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/qwen", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async qwen3(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/qwen3", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async mistral(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/mistral", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async gptoss(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/gptoss", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async mimo(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/mimo", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async kimi(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/kimi", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async glm(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/glm", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async minimax(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/minimax", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async cohere(message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>("/api/models/cohere", {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }

  async flux(prompt: string, options: ImageOptions = {}): Promise<ImageResponse> {
    return this.request<ImageResponse>("/api/models/flux", {
      prompt,
      steps: options.steps || 4,
      width: options.width,
      height: options.height,
    });
  }

  async model(modelId: string, message: string, options: ModelOptions = {}): Promise<ChatResponse> {
    return this.request<ChatResponse>(`/api/models/${modelId}`, {
      message,
      history: options.history || [],
      persona: options.persona,
    });
  }
}

export default AichixiaClient;
export { AichixiaClient };
export type { ChatOptions, ImageOptions, ModelOptions, ChatResponse, ImageResponse };
