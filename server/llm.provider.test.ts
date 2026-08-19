import { describe, expect, it } from "vitest";
import { resolveLlmProvider } from "./_core/llm";

describe("language-model provider selection", () => {
  it("prefers the configured Gemini provider over OpenAI and internal Forge credentials", () => {
    expect(resolveLlmProvider({
      geminiApiKey: "gemini-key",
      openaiApiKey: "external-key",
      forgeApiUrl: "https://forge.example",
      forgeApiKey: "forge-key",
    })).toEqual({
      name: "gemini",
      apiKey: "gemini-key",
      chatCompletionsUrl: "https://generativelanguage.googleapis.com/v1beta",
      modelsUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    });
  });

  it("retains the internal provider only when no external key is configured", () => {
    expect(resolveLlmProvider({
      geminiApiKey: "",
      openaiApiKey: "",
      forgeApiUrl: "",
      forgeApiKey: "forge-key",
    })).toMatchObject({
      name: "forge",
      apiKey: "forge-key",
      chatCompletionsUrl: "https://forge.manus.im/v1/chat/completions",
    });
  });
});
