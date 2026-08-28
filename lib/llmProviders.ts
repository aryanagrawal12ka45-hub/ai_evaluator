import Anthropic from "@anthropic-ai/sdk";

export interface ProviderCallResult {
  text: string;
  latencyMs: number;
  engine: string;
  provider: "Anthropic" | "Google AI" | "OpenAI";
  isFallback: boolean;
  errorNote?: string;
}

// ----------------------------------------------------------------------
// 1. ANTHROPIC CLAUDE CALLER
// ----------------------------------------------------------------------
export async function callClaude(
  prompt: string,
  systemPrompt?: string
): Promise<ProviderCallResult> {
  const startTime = Date.now();
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-anthropic-api-key-here") {
    return {
      text: "",
      latencyMs: Date.now() - startTime,
      engine: "claude-3-5-sonnet",
      provider: "Anthropic",
      isFallback: true,
      errorNote: "ANTHROPIC_API_KEY unconfigured",
    };
  }

  try {
    const client = new Anthropic({ apiKey, timeout: 15000 });
    const response = await client.messages.create({
      model: "claude-3-5-sonnet-20241022",
      max_tokens: 1400,
      temperature: 0.2,
      system: systemPrompt,
      messages: [{ role: "user", content: prompt }],
    });

    const text = response.content[0].type === "text" ? response.content[0].text : "";
    return {
      text,
      latencyMs: Date.now() - startTime,
      engine: "claude-3-5-sonnet",
      provider: "Anthropic",
      isFallback: false,
    };
  } catch (error) {
    console.warn("Claude API call failed:", (error as Error).message);
    return {
      text: "",
      latencyMs: Date.now() - startTime,
      engine: "claude-3-5-sonnet",
      provider: "Anthropic",
      isFallback: true,
      errorNote: (error as Error).message,
    };
  }
}

// ----------------------------------------------------------------------
// 2. GOOGLE GEMINI CALLER (generateContent endpoint)
// ----------------------------------------------------------------------
export async function callGemini(
  prompt: string,
  systemPrompt?: string,
  modelVariant: string = "gemini-3.5-flash"
): Promise<ProviderCallResult> {
  const startTime = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey || apiKey.trim() === "" || apiKey === "your-gemini-api-key-here") {
    throw new Error("GEMINI_API_KEY_NOT_FOUND: GEMINI_API_KEY is not defined in project environment variables (.env or .env.local).");
  }

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${modelVariant}:generateContent`;
    const payload = {
      system_instruction: systemPrompt ? { parts: [{ text: systemPrompt }] } : undefined,
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        maxOutputTokens: 1400,
      },
    };

    const res = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": apiKey,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`GEMINI_API_CALL_FAILED (HTTP ${res.status}): ${errText}`);
    }

    const data = await res.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!candidateText) {
      throw new Error("GEMINI_EMPTY_RESPONSE: Gemini API returned 200 OK but candidate text payload was empty.");
    }

    return {
      text: candidateText,
      latencyMs: Date.now() - startTime,
      engine: modelVariant,
      provider: "Google AI",
      isFallback: false,
    };
  } catch (error) {
    throw error;
  }
}
