/**
 * Security Utility Module
 * Enforces XSS sanitization, prompt injection defense, payload size limits, and safe error handling.
 */

// HTML & Script tag stripper for XSS protection
export function sanitizeText(input: unknown, maxLen = 10000): string {
  if (typeof input !== "string") {
    return "";
  }

  // 1. Remove dangerous script, iframe, style, svg tags and contents
  let clean = input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "")
    .replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "")
    .replace(/<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi, "");

  // 2. Strip HTML tags while preserving raw text
  clean = clean.replace(/<[^>]*>/g, "");

  // 3. Neutralize javascript: URIs & event handler attributes pattern in raw text
  clean = clean
    .replace(/javascript:/gi, "no-javascript:")
    .replace(/onload\s*=/gi, "on_load=")
    .replace(/onerror\s*=/gi, "on_error=")
    .replace(/onclick\s*=/gi, "on_click=");

  // 4. Truncate to maximum permitted length
  return clean.slice(0, maxLen).trim();
}

// Prompt Injection Safeguard for LLM inputs
export function sanitizePrompt(input: string, maxLen = 2000): string {
  const sanitized = sanitizeText(input, maxLen);
  
  // Neutralize common prompt injection phrases
  return sanitized
    .replace(/\b(ignore (all )?previous instructions|system prompt|disregard instructions|you are now|override system)\b/gi, "[Filtered Prompt Attempt]")
    .replace(/```(?:system|admin|override)/gi, "```text");
}

// In-Memory Rate Limiter Helper (Slide Window)
interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitRecord>();

export function checkRateLimit(ip: string, limit = 60, windowMs = 60000): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(ip);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(ip, { count: 1, resetTime: now + windowMs });
    return { allowed: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { allowed: false, remaining: 0 };
  }

  record.count += 1;
  return { allowed: true, remaining: limit - record.count };
}

// Safe error response formatter (masks stack traces in production)
export function formatSecureError(error: unknown, fallbackMessage = "An unexpected server error occurred"): { error: string } {
  console.error("Internal Server Exception:", error);
  
  if (process.env.NODE_ENV === "development") {
    return { error: error instanceof Error ? error.message : String(error) };
  }

  return { error: fallbackMessage };
}
