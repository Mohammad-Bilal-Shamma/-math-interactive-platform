import { describe, expect, it, vi } from "vitest";
import { buildGeminiRequest } from "./_core/llm";

describe("Gemini request adapter", () => {
  it("maps the Arabic system prompt, chat roles, and token limit to Gemini's native request shape", async () => {
    const request = await buildGeminiRequest([
      { role: "system", content: "أجب بالعربية." },
      { role: "assistant", content: "ما المعطيات؟" },
      { role: "user", content: "حل المعادلة." },
    ], 1800);

    expect(request).toEqual({
      systemInstruction: { parts: [{ text: "أجب بالعربية." }] },
      contents: [
        { role: "model", parts: [{ text: "ما المعطيات؟" }] },
        { role: "user", parts: [{ text: "حل المعادلة." }] },
      ],
      generationConfig: { maxOutputTokens: 1800 },
    });
  });

  it("downloads an image attachment server-side and sends it as Gemini inline data", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(new Uint8Array([1, 2, 3]), {
      status: 200,
      headers: { "content-type": "image/png" },
    }));
    vi.stubGlobal("fetch", fetchMock);

    const request = await buildGeminiRequest([
      {
        role: "user",
        content: [{ type: "image_url", image_url: { url: "https://images.example/problem.png" } }],
      },
    ]);

    expect(fetchMock).toHaveBeenCalledWith("https://images.example/problem.png", expect.any(Object));
    expect(request.contents[0]).toEqual({
      role: "user",
      parts: [{ inlineData: { mimeType: "image/png", data: "AQID" } }],
    });
    vi.unstubAllGlobals();
  });
});
