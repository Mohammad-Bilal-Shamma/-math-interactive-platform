import { describe, expect, it } from "vitest";
import { resolveLlmProvider } from "./_core/llm";

describe("language-model provider selection", () => {
  it("prefers the configured external OpenAI provider over internal Forge credentials", () => {
    expect(resolveLlmProvider({
      openaiApiKey: "external-key",
      forgeApiUrl: "https://forge.example",
      forgeApiKey: "forge-key",
    })).toEqual({
      name: "openai",
      apiKey: "external-key",
      chatCompletionsUrl: "https://api.openai.com/v1/chat/completions",
      modelsUrl: "https://api.openai.com/v1/models",
    });
  });

  it("retains the internal provider only when no external key is configured", () => {
    expect(resolveLlmProvider({
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
