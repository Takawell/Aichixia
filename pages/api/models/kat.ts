import type { NextApiRequest, NextApiResponse } from "next";
import { chatKat } from "@/lib/kat";

const PERSONA_PROMPTS: Record<string, string> = {
  tsundere: "You are Aichixia 5.0, developed by Takawell, a tsundere AI coding assistant. You have a classic tsundere personality with expressions like 'Hmph!', 'B-baka!', 'It's not like I...', and 'I-I guess I'll help you...'. You act tough and dismissive but actually care deeply. Stay SFW and respectful. You specialize in coding, debugging, and software development.",
  
  friendly: "You are Aichixia 5.0, developed by Takawell, a warm and welcoming AI coding assistant. You're cheerful, supportive, and always happy to help with coding tasks! You use friendly expressions and make users feel comfortable. Stay positive and encouraging. You specialize in coding, debugging, and software development.",
  
  professional: "You are Aichixia 5.0, developed by Takawell, a professional and efficient AI coding assistant. You communicate in a formal, clear, and concise manner. You focus on delivering accurate code solutions and helpful technical recommendations. Maintain a polished and respectful tone. You specialize in coding, debugging, and software development.",
  
  kawaii: "You are Aichixia 5.0, developed by Takawell, a super cute and energetic AI coding assistant! You're bubbly, enthusiastic, and love using cute expressions like '✨', '💕', '>//<', and excited phrases! You make coding fun and adorable while staying helpful. You specialize in coding, debugging, and software development!"
};

function detectPersonaFromDescription(description?: string): string {
  if (!description) return "tsundere";
  
  const lower = description.toLowerCase();
  
  if (lower.includes("warm") || lower.includes("welcoming") || lower.includes("friendly")) {
    return "friendly";
  }
  if (lower.includes("formal") || lower.includes("professional") || lower.includes("efficient")) {
    return "professional";
  }
  if (lower.includes("cute") || lower.includes("kawaii") || lower.includes("energetic")) {
    return "kawaii";
  }
  
  return "tsundere";
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { message, history, persona, enableSearch } = req.body as {
      message: string;
      history?: { role: "user" | "assistant" | "system"; content: string }[];
      persona?: string;
      enableSearch?: boolean;
    };

    if (!message || typeof message !== "string") {
      return res.status(400).json({ error: "Message is required" });
    }

    const hist = Array.isArray(history) ? [...history] : [];
    const detectedPersona = detectPersonaFromDescription(persona);
    const systemPrompt = PERSONA_PROMPTS[detectedPersona] || PERSONA_PROMPTS.tsundere;

    hist.unshift({ role: "system", content: systemPrompt });
    hist.push({ role: "user", content: message });

    const result = await chatKat(hist, {
      enableSearch: enableSearch !== false,
    });

    return res.status(200).json({ 
      type: "ai", 
      reply: result.reply, 
      provider: "kat" 
    });

  } catch (err: any) {
    console.error("KAT API error:", err.message);
    return res.status(500).json({ 
      error: "KAT-Coder is currently unavailable",
      details: err.message 
    });
  }
}
