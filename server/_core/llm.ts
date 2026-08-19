import { ENV } from "./env";

export type Role = "system" | "user" | "assistant" | "tool" | "function";

export type TextContent = {
  type: "text";
  text: string;
};

export type ImageContent = {
  type: "image_url";
  image_url: {
    url: string;
    detail?: "auto" | "low" | "high";
  };
};

export type FileContent = {
  type: "file_url";
  file_url: {
    url: string;
    mime_type?: "audio/mpeg" | "audio/wav" | "application/pdf" | "audio/mp4" | "video/mp4" ;
  };
};

export type MessageContent = string | TextContent | ImageContent | FileContent;

export type Message = {
  role: Role;
  content: MessageContent | MessageContent[];
  name?: string;
  tool_call_id?: string;
};

export type Tool = {
  type: "function";
  function: {
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  };
};

export type ToolChoicePrimitive = "none" | "auto" | "required";
export type ToolChoiceByName = { name: string };
export type ToolChoiceExplicit = {
  type: "function";
  function: {
    name: string;
  };
};

export type ToolChoice =
  | ToolChoicePrimitive
  | ToolChoiceByName
  | ToolChoiceExplicit;

export type InvokeParams = {
  messages: Message[];
  tools?: Tool[];
  toolChoice?: ToolChoice;
  tool_choice?: ToolChoice;
  maxTokens?: number;
  max_tokens?: number;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  model?: string;
  thinking?: Record<string, unknown>;
  reasoning?: Record<string, unknown>;
};

export type ToolCall = {
  id: string;
  type: "function";
  function: {
    name: string;
    arguments: string;
  };
};

export type InvokeResult = {
  id: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: Role;
      content: string | Array<TextContent | ImageContent | FileContent>;
      tool_calls?: ToolCall[];
    };
    finish_reason: string | null;
  }>;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
};

export type JsonSchema = {
  name: string;
  schema: Record<string, unknown>;
  strict?: boolean;
};

export type OutputSchema = JsonSchema;

export type ResponseFormat =
  | { type: "text" }
  | { type: "json_object" }
  | { type: "json_schema"; json_schema: JsonSchema };

const ensureArray = (
  value: MessageContent | MessageContent[]
): MessageContent[] => (Array.isArray(value) ? value : [value]);

const normalizeContentPart = (
  part: MessageContent
): TextContent | ImageContent | FileContent => {
  if (typeof part === "string") {
    return { type: "text", text: part };
  }

  if (part.type === "text") {
    return part;
  }

  if (part.type === "image_url") {
    return part;
  }

  if (part.type === "file_url") {
    return part;
  }

  throw new Error("Unsupported message content part");
};

const normalizeMessage = (message: Message) => {
  const { role, name, tool_call_id } = message;

  if (role === "tool" || role === "function") {
    const content = ensureArray(message.content)
      .map(part => (typeof part === "string" ? part : JSON.stringify(part)))
      .join("\n");

    return {
      role,
      name,
      tool_call_id,
      content,
    };
  }

  const contentParts = ensureArray(message.content).map(normalizeContentPart);

  // If there's only text content, collapse to a single string for compatibility
  if (contentParts.length === 1 && contentParts[0].type === "text") {
    return {
      role,
      name,
      content: contentParts[0].text,
    };
  }

  return {
    role,
    name,
    content: contentParts,
  };
};

const normalizeToolChoice = (
  toolChoice: ToolChoice | undefined,
  tools: Tool[] | undefined
): "none" | "auto" | ToolChoiceExplicit | undefined => {
  if (!toolChoice) return undefined;

  if (toolChoice === "none" || toolChoice === "auto") {
    return toolChoice;
  }

  if (toolChoice === "required") {
    if (!tools || tools.length === 0) {
      throw new Error(
        "tool_choice 'required' was provided but no tools were configured"
      );
    }

    if (tools.length > 1) {
      throw new Error(
        "tool_choice 'required' needs a single tool or specify the tool name explicitly"
      );
    }

    return {
      type: "function",
      function: { name: tools[0].function.name },
    };
  }

  if ("name" in toolChoice) {
    return {
      type: "function",
      function: { name: toolChoice.name },
    };
  }

  return toolChoice;
};

export type LlmProviderConfig = {
  name: "gemini" | "openai" | "forge";
  apiKey: string;
  chatCompletionsUrl: string;
  modelsUrl: string;
};

export function resolveLlmProvider(config: Pick<typeof ENV, "geminiApiKey" | "openaiApiKey" | "forgeApiUrl" | "forgeApiKey"> = ENV): LlmProviderConfig {
  if (config.geminiApiKey.trim()) {
    return {
      name: "gemini",
      apiKey: config.geminiApiKey,
      chatCompletionsUrl: "https://generativelanguage.googleapis.com/v1beta",
      modelsUrl: "https://generativelanguage.googleapis.com/v1beta/models",
    };
  }

  if (config.openaiApiKey.trim()) {
    return {
      name: "openai",
      apiKey: config.openaiApiKey,
      chatCompletionsUrl: "https://api.openai.com/v1/chat/completions",
      modelsUrl: "https://api.openai.com/v1/models",
    };
  }

  const forgeBaseUrl = config.forgeApiUrl.trim()
    ? config.forgeApiUrl.replace(/\/$/, "")
    : "https://forge.manus.im";
  return {
    name: "forge",
    apiKey: config.forgeApiKey,
    chatCompletionsUrl: `${forgeBaseUrl}/v1/chat/completions`,
    modelsUrl: `${forgeBaseUrl}/v1/models`,
  };
}

const assertApiKey = (provider: LlmProviderConfig) => {
  if (!provider.apiKey) {
    throw new Error("لم يتم إعداد مفتاح مزود الذكاء الاصطناعي على الخادم.");
  }
};

const normalizeResponseFormat = ({
  responseFormat,
  response_format,
  outputSchema,
  output_schema,
}: {
  responseFormat?: ResponseFormat;
  response_format?: ResponseFormat;
  outputSchema?: OutputSchema;
  output_schema?: OutputSchema;
}):
  | { type: "json_schema"; json_schema: JsonSchema }
  | { type: "text" }
  | { type: "json_object" }
  | undefined => {
  const explicitFormat = responseFormat || response_format;
  if (explicitFormat) {
    if (
      explicitFormat.type === "json_schema" &&
      !explicitFormat.json_schema?.schema
    ) {
      throw new Error(
        "responseFormat json_schema requires a defined schema object"
      );
    }
    return explicitFormat;
  }

  const schema = outputSchema || output_schema;
  if (!schema) return undefined;

  if (!schema.name || !schema.schema) {
    throw new Error("outputSchema requires both name and schema");
  }

  return {
    type: "json_schema",
    json_schema: {
      name: schema.name,
      schema: schema.schema,
      ...(typeof schema.strict === "boolean" ? { strict: schema.strict } : {}),
    },
  };
};

const RETRY_MAX_RETRIES = 4;
const RETRY_BASE_DELAY_MS = 500;
const RETRY_MAX_DELAY_MS = 30_000;

type FetchInit = NonNullable<Parameters<typeof fetch>[1]>;

const sleep = (ms: number) =>
  new Promise<void>(resolve => setTimeout(resolve, ms));

const parseRetryAfter = (value: string | null): number | undefined => {
  if (!value) return undefined;
  const seconds = Number(value);
  if (Number.isFinite(seconds)) return Math.max(0, seconds * 1000);
  const at = Date.parse(value);
  return Number.isNaN(at) ? undefined : Math.max(0, at - Date.now());
};

// Equal-jitter exponential backoff. The cap/2 floor guarantees a minimum
// delay so a misbehaving caller loop slows down instead of hammering the
// upstream while it keeps returning errors.
const computeBackoffDelay = (
  attempt: number,
  retryAfterMs?: number
): number => {
  const cap = Math.min(RETRY_BASE_DELAY_MS * 2 ** attempt, RETRY_MAX_DELAY_MS);
  const jittered = cap / 2 + Math.random() * (cap / 2);
  return Math.min(Math.max(jittered, retryAfterMs ?? 0), RETRY_MAX_DELAY_MS);
};

// Retries non-2xx responses and network errors with exponential backoff, then
// returns the final Response so callers keep their existing error handling.
const fetchWithBackoff = async (
  url: string,
  init: FetchInit
): Promise<Response> => {
  let lastError: unknown;

  for (let attempt = 0; attempt <= RETRY_MAX_RETRIES; attempt++) {
    try {
      const response = await fetch(url, init);
      if (response.ok || attempt === RETRY_MAX_RETRIES) {
        return response;
      }

      const retryAfterMs = parseRetryAfter(
        response.headers.get("retry-after")
      );
      try {
        await response.body?.cancel();
      } catch {
        // Body already settled; nothing to clean up.
      }
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after status ${response.status}`
      );
      await sleep(computeBackoffDelay(attempt, retryAfterMs));
    } catch (error) {
      lastError = error;
      if (attempt === RETRY_MAX_RETRIES) throw error;
      console.warn(
        `LLM request retry ${attempt + 1}/${RETRY_MAX_RETRIES} after network error`
      );
      await sleep(computeBackoffDelay(attempt));
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("LLM request failed after exhausting retries");
};

type GeminiPart =
  | { text: string }
  | { inlineData: { mimeType: string; data: string } };

type GeminiContent = {
  role: "user" | "model";
  parts: GeminiPart[];
};

const GEMINI_MAX_IMAGE_BYTES = 5 * 1024 * 1024;

const imageUrlToGeminiPart = async (url: string): Promise<GeminiPart> => {
  const response = await fetchWithBackoff(url, { headers: { accept: "image/*" } });
  if (!response.ok) {
    throw new Error("تعذر تنزيل صورة المسألة لتحليلها.");
  }

  const bytes = new Uint8Array(await response.arrayBuffer());
  if (bytes.length === 0 || bytes.length > GEMINI_MAX_IMAGE_BYTES) {
    throw new Error("حجم صورة المسألة غير مناسب للتحليل.");
  }

  const contentType = response.headers.get("content-type")?.split(";")[0]?.trim();
  const mimeType = contentType && contentType.startsWith("image/") ? contentType : "image/jpeg";
  return { inlineData: { mimeType, data: Buffer.from(bytes).toString("base64") } };
};

const messageContentToGeminiParts = async (content: Message["content"]): Promise<GeminiPart[]> => {
  const parts = ensureArray(content);
  const geminiParts: GeminiPart[] = [];

  for (const part of parts) {
    if (typeof part === "string") {
      geminiParts.push({ text: part });
    } else if (part.type === "text") {
      geminiParts.push({ text: part.text });
    } else if (part.type === "image_url") {
      geminiParts.push(await imageUrlToGeminiPart(part.image_url.url));
    } else if (part.type === "file_url") {
      geminiParts.push({ text: `ملف مرفق: ${part.file_url.url}` });
    }
  }

  return geminiParts.length > 0 ? geminiParts : [{ text: "" }];
};

export async function buildGeminiRequest(messages: Message[], maxOutputTokens?: number) {
  const systemParts: GeminiPart[] = [];
  const contents: GeminiContent[] = [];

  for (const message of messages) {
    const parts = await messageContentToGeminiParts(message.content);
    if (message.role === "system") {
      systemParts.push(...parts);
      continue;
    }

    contents.push({
      role: message.role === "assistant" ? "model" : "user",
      parts,
    });
  }

  return {
    ...(systemParts.length > 0 ? { systemInstruction: { parts: systemParts } } : {}),
    contents,
    ...(typeof maxOutputTokens === "number" ? { generationConfig: { maxOutputTokens } } : {}),
  };
}

type GeminiGenerateResponse = {
  candidates?: Array<{
    content?: { parts?: Array<{ text?: string }> };
    finishReason?: string;
  }>;
  modelVersion?: string;
  usageMetadata?: {
    promptTokenCount?: number;
    candidatesTokenCount?: number;
    totalTokenCount?: number;
  };
};

const invokeGemini = async (provider: LlmProviderConfig, params: InvokeParams): Promise<InvokeResult> => {
  const model = (params.model || "gemini-2.0-flash").replace(/^models\//, "");
  const maxOutputTokens = params.max_tokens ?? params.maxTokens;
  const payload = await buildGeminiRequest(params.messages, maxOutputTokens);
  const response = await fetchWithBackoff(
    `${provider.chatCompletionsUrl}/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-goog-api-key": provider.apiKey,
      },
      body: JSON.stringify(payload),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`);
  }

  const body = await response.json() as GeminiGenerateResponse;
  const candidate = body.candidates?.[0];
  const content = candidate?.content?.parts
    ?.flatMap(part => typeof part.text === "string" ? [part.text] : [])
    .join("\n") ?? "";

  return {
    id: `gemini-${Date.now()}`,
    created: Math.floor(Date.now() / 1000),
    model: body.modelVersion || model,
    choices: [{
      index: 0,
      message: { role: "assistant", content },
      finish_reason: candidate?.finishReason || null,
    }],
    usage: body.usageMetadata ? {
      prompt_tokens: body.usageMetadata.promptTokenCount ?? 0,
      completion_tokens: body.usageMetadata.candidatesTokenCount ?? 0,
      total_tokens: body.usageMetadata.totalTokenCount ?? 0,
    } : undefined,
  };
};

export async function invokeLLM(params: InvokeParams): Promise<InvokeResult> {
  const provider = resolveLlmProvider();
  assertApiKey(provider);

  if (provider.name === "gemini") {
    return invokeGemini(provider, params);
  }

  const {
    messages,
    tools,
    toolChoice,
    tool_choice,
    outputSchema,
    output_schema,
    responseFormat,
    response_format,
    model,
    thinking,
    reasoning,
    maxTokens,
    max_tokens,
  } = params;

  const payload: Record<string, unknown> = {
    messages: messages.map(normalizeMessage),
  };

  if (model) {
    payload.model = model;
  }

  if (tools && tools.length > 0) {
    payload.tools = tools;
  }

  const normalizedToolChoice = normalizeToolChoice(
    toolChoice || tool_choice,
    tools
  );
  if (normalizedToolChoice) {
    payload.tool_choice = normalizedToolChoice;
  }

  const resolvedMaxTokens = max_tokens ?? maxTokens;
  if (typeof resolvedMaxTokens === "number") {
    payload.max_tokens = resolvedMaxTokens;
  }

  if (thinking) {
    payload.thinking = thinking;
  }
  if (reasoning) {
    payload.reasoning = reasoning;
  }

  const normalizedResponseFormat = normalizeResponseFormat({
    responseFormat,
    response_format,
    outputSchema,
    output_schema,
  });

  if (normalizedResponseFormat) {
    payload.response_format = normalizedResponseFormat;
  }

  const response = await fetchWithBackoff(provider.chatCompletionsUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `LLM invoke failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as InvokeResult;
}

export type ModelInfo = {
  id: string;
  object: string;
  created: number;
  owned_by: string;
};

export type ModelsResponse = {
  object: string;
  data: ModelInfo[];
};

export async function listLLMModels(): Promise<ModelsResponse> {
  const provider = resolveLlmProvider();
  assertApiKey(provider);

  if (provider.name === "gemini") {
    const response = await fetchWithBackoff(provider.modelsUrl, {
      headers: { "x-goog-api-key": provider.apiKey },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`List LLM models failed: ${response.status} ${response.statusText} – ${errorText}`);
    }
    const payload = await response.json() as { models?: Array<{ name?: string }> };
    return {
      object: "list",
      data: (payload.models ?? [])
        .map(model => model.name?.replace(/^models\//, ""))
        .filter((id): id is string => Boolean(id))
        .map(id => ({ id, object: "model", created: 0, owned_by: "google" })),
    };
  }

  const response = await fetchWithBackoff(provider.modelsUrl, {
    headers: { authorization: `Bearer ${provider.apiKey}` },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `List LLM models failed: ${response.status} ${response.statusText} – ${errorText}`
    );
  }

  return (await response.json()) as ModelsResponse;
}
