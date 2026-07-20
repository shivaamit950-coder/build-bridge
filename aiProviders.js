import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const anthropic = process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const openai = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const gemini = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

export const PROVIDERS = {
  claude: { label: "Claude", available: !!process.env.ANTHROPIC_API_KEY },
  chatgpt: { label: "ChatGPT", available: !!process.env.OPENAI_API_KEY },
  gemini: { label: "Gemini", available: !!process.env.GEMINI_API_KEY },
};

// Picks the first configured provider so the app works with whichever key(s)
// are actually set in Vercel — previously this defaulted hard to "claude" even
// when only GEMINI_API_KEY was configured, causing every AI call to fail.
export function getDefaultProvider() {
  const order = ["claude", "gemini", "chatgpt"];
  const found = order.find((key) => PROVIDERS[key].available);
  if (!found) {
    throw new Error(
      "No AI provider is configured. Add ANTHROPIC_API_KEY, GEMINI_API_KEY, or OPENAI_API_KEY in Vercel's environment variables."
    );
  }
  return found;
}

/**
 * Unified chat call across providers.
 * messages: [{ role: 'user' | 'assistant', content: string }]
 * Returns: { text } or throws
 */
export async function callAI({ provider, system, messages, maxTokens = 1200 }) {
  const resolvedProvider = provider || getDefaultProvider();

  if (resolvedProvider === "chatgpt") {
    if (!openai) throw new Error("ChatGPT isn't connected — add OPENAI_API_KEY to enable it.");
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      max_tokens: maxTokens,
      messages: [...(system ? [{ role: "system", content: system }] : []), ...messages],
    });
    return { text: completion.choices[0].message.content };
  }

  if (resolvedProvider === "gemini") {
    if (!gemini) throw new Error("Gemini isn't connected — add GEMINI_API_KEY to enable it.");
    const model = gemini.getGenerativeModel({
      model: "gemini-2.0-flash",
      ...(system ? { systemInstruction: system } : {}),
    });
    // Gemini uses "model" instead of "assistant" as the role name
    const history = messages.slice(0, -1).map((m) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: [{ text: m.content }],
    }));
    const chat = model.startChat({ history });
    const lastMessage = messages[messages.length - 1];
    const result = await chat.sendMessage(lastMessage.content);
    return { text: result.response.text() };
  }

  // Claude
  if (!anthropic) throw new Error("Claude isn't connected — add ANTHROPIC_API_KEY to enable it.");
  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: maxTokens,
    ...(system ? { system } : {}),
    messages,
  });
  const textBlock = response.content.find((b) => b.type === "text");
  return { text: textBlock.text };
}
