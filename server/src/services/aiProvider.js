const OPENROUTER_ENDPOINT = 'https://openrouter.ai/api/v1/chat/completions';

export const AI_PROVIDER_NAME = 'OpenRouter';
export const AI_MODEL_LABEL = 'Gemini 3 Flash';
export const PRIMARY_OPENROUTER_MODEL = 'google/gemini-3-flash-preview';

export const OPENROUTER_FALLBACK_MODELS = [
  'google/gemini-3.1-flash-lite-preview',
  'google/gemini-3.1-flash-lite',
  'google/gemini-2.5-flash-lite',
  'deepseek/deepseek-chat-v3-0324:free',
  'meta-llama/llama-3.3-70b-instruct:free',
  'mistralai/mistral-small-24b-instruct-2501:free',
  'mistralai/mistral-small-3.2-24b-instruct',
];

const MODEL_ALIASES = new Map([
  ['gemini-2.5-flash-lite', 'google/gemini-2.5-flash-lite'],
  ['google/gemini-3.1-flash-lite-preview', 'google/gemini-3.1-flash-lite-preview'],
  ['mistralai/mistral-small-3.2-24b-instruct:free', 'mistralai/mistral-small-24b-instruct-2501:free'],
]);

const DEFAULT_TIMEOUT_MS = 20000;
const DEFAULT_MAX_TOKENS = 700;
const DEFAULT_TEMPERATURE = 0.35;
const MAX_HISTORY_MESSAGES = 8;

const trimEnv = (value) => (value || '').trim().replace(/^['"]|['"]$/g, '');

const numberFromEnv = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const unique = (items) => [...new Set(items.filter(Boolean))];

const splitModelList = (value) =>
  trimEnv(value)
    .split(',')
    .map((model) => normalizeModelId(model))
    .filter(Boolean);

export const normalizeModelId = (modelId) => {
  const normalized = trimEnv(modelId).replace(/^models\//, '');
  if (/^gemini-2\.5-flash$/i.test(normalized) || /^gemini\s+2\.5\s+flash$/i.test(normalized)) {
    return PRIMARY_OPENROUTER_MODEL;
  }
  return MODEL_ALIASES.get(normalized) || normalized;
};

export const getOpenRouterApiKey = () => trimEnv(process.env.OPENROUTER_API_KEY);

export const getOpenRouterModelChain = () => {
  const configuredPrimary = normalizeModelId(process.env.OPENROUTER_MODEL || PRIMARY_OPENROUTER_MODEL);
  const configuredFallbacks = splitModelList(process.env.OPENROUTER_FALLBACK_MODELS);

  return unique([
    configuredPrimary,
    PRIMARY_OPENROUTER_MODEL,
    ...configuredFallbacks,
    ...OPENROUTER_FALLBACK_MODELS,
  ]);
};

const getHeaders = (apiKey) => ({
  Authorization: `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'HTTP-Referer': trimEnv(process.env.OPENROUTER_HTTP_REFERER) || trimEnv(process.env.CLIENT_URL) || 'http://localhost:5173',
  'X-Title': trimEnv(process.env.OPENROUTER_APP_TITLE) || 'NexusDesk',
});

const getRequestOptions = () => ({
  timeoutMs: numberFromEnv(process.env.AI_REQUEST_TIMEOUT_MS, DEFAULT_TIMEOUT_MS),
  maxTokens: numberFromEnv(process.env.AI_MAX_TOKENS, DEFAULT_MAX_TOKENS),
  temperature: numberFromEnv(process.env.AI_TEMPERATURE, DEFAULT_TEMPERATURE),
  stream: process.env.AI_STREAMING !== 'false',
});

const buildMessages = ({ systemMessage, history = [], userPrompt }) => {
  const safeHistory = history
    .slice(-MAX_HISTORY_MESSAGES)
    .filter((message) => message?.content)
    .map((message) => ({
      role: message.role === 'assistant' ? 'assistant' : 'user',
      content: String(message.content),
    }));

  return [
    { role: 'system', content: systemMessage },
    ...safeHistory,
    { role: 'user', content: userPrompt },
  ];
};

const readJsonSafely = async (response) => {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch (error) {
    const parseError = new Error('OpenRouter returned malformed JSON.');
    parseError.code = 'JSON_PARSE_ERROR';
    parseError.cause = error;
    parseError.raw = text.slice(0, 500);
    throw parseError;
  }
};

const createProviderError = ({ message, status, code, model, details }) => {
  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.model = model;
  error.details = details;
  return error;
};

const parseErrorBody = (body) => {
  if (!body) return {};
  if (typeof body.error === 'string') return { message: body.error };
  if (body.error) return body.error;
  return body;
};

const throwForOpenRouterStatus = async (response, model) => {
  if (response.ok) return;

  const body = await readJsonSafely(response);
  const errorBody = parseErrorBody(body);
  const message = errorBody.message || response.statusText || 'OpenRouter request failed.';

  throw createProviderError({
    message,
    status: response.status,
    code: errorBody.code || `HTTP_${response.status}`,
    model,
    details: errorBody,
  });
};

const parseCompletionContent = (body, model) => {
  const choice = body?.choices?.[0];
  const content = choice?.message?.content ?? choice?.delta?.content ?? '';
  const text = Array.isArray(content)
    ? content.map((part) => part?.text || '').join('')
    : String(content || '');

  if (!text.trim()) {
    throw createProviderError({
      message: 'OpenRouter returned an empty response.',
      status: 502,
      code: 'EMPTY_RESPONSE',
      model,
      details: body,
    });
  }

  return text.trim();
};

const parseStreamingCompletion = async (response, model) => {
  const reader = response.body?.getReader();
  if (!reader) {
    throw createProviderError({
      message: 'Streaming is not available in this runtime.',
      status: 502,
      code: 'STREAM_UNAVAILABLE',
      model,
    });
  }

  const decoder = new TextDecoder();
  let buffer = '';
  let content = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() || '';

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line || line.startsWith(':')) continue;
      if (!line.startsWith('data:')) continue;

      const data = line.slice(5).trim();
      if (data === '[DONE]') return content.trim();

      let chunk;
      try {
        chunk = JSON.parse(data);
      } catch (error) {
        throw createProviderError({
          message: 'OpenRouter returned malformed streaming JSON.',
          status: 502,
          code: 'JSON_PARSE_ERROR',
          model,
          details: { data },
        });
      }

      if (chunk.error) {
        const errorBody = parseErrorBody(chunk);
        throw createProviderError({
          message: errorBody.message || 'OpenRouter streaming request failed.',
          status: errorBody.code === 'rate_limit_exceeded' ? 429 : 502,
          code: errorBody.code || 'STREAM_ERROR',
          model,
          details: errorBody,
        });
      }

      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) content += delta;
    }
  }

  if (!content.trim()) {
    throw createProviderError({
      message: 'OpenRouter returned an empty streamed response.',
      status: 502,
      code: 'EMPTY_RESPONSE',
      model,
    });
  }

  return content.trim();
};

const requestOpenRouterModel = async ({ apiKey, model, messages, fetchImpl = fetch }) => {
  const options = getRequestOptions();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeoutMs);

  const payload = {
    model,
    messages,
    stream: options.stream,
    max_tokens: options.maxTokens,
    temperature: options.temperature,
  };

  try {
    const response = await fetchImpl(OPENROUTER_ENDPOINT, {
      method: 'POST',
      headers: getHeaders(apiKey),
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    await throwForOpenRouterStatus(response, model);

    if (options.stream) {
      return await parseStreamingCompletion(response, model);
    }

    const body = await readJsonSafely(response);
    return parseCompletionContent(body, model);
  } catch (error) {
    if (error.name === 'AbortError') {
      throw createProviderError({
        message: `OpenRouter timed out after ${options.timeoutMs / 1000}s.`,
        status: 408,
        code: 'REQUEST_TIMEOUT',
        model,
      });
    }

    if (error.status || error.code) throw error;

    throw createProviderError({
      message: 'Could not reach OpenRouter. Check your network or provider status.',
      status: 503,
      code: 'NETWORK_ERROR',
      model,
      details: { originalMessage: error.message },
    });
  } finally {
    clearTimeout(timeout);
  }
};

const shouldTryNextModel = (error) => {
  const retryableStatuses = new Set([400, 402, 404, 408, 409, 422, 429, 500, 502, 503, 504]);
  if (error.status === 401 || error.status === 403) return false;
  if (error.code === 'NETWORK_ERROR') return false;
  return retryableStatuses.has(error.status) || ['EMPTY_RESPONSE', 'JSON_PARSE_ERROR', 'REQUEST_TIMEOUT'].includes(error.code);
};

export const createAssistantError = (attempts) => {
  const lastError = attempts.at(-1)?.error;
  const invalidKey = attempts.find((attempt) => [401, 403].includes(attempt.error?.status));
  const rateLimit = attempts.find((attempt) => attempt.error?.status === 429);
  const timeout = attempts.find((attempt) => attempt.error?.code === 'REQUEST_TIMEOUT');
  const network = attempts.find((attempt) => attempt.error?.code === 'NETWORK_ERROR');
  const empty = attempts.find((attempt) => attempt.error?.code === 'EMPTY_RESPONSE');
  const parse = attempts.find((attempt) => attempt.error?.code === 'JSON_PARSE_ERROR');

  let message = 'The AI provider is unavailable right now. Please try again in a moment.';
  let status = 502;
  let code = 'AI_PROVIDER_UNAVAILABLE';

  if (invalidKey) {
    message = 'OpenRouter API key is invalid or missing access. Check OPENROUTER_API_KEY on the server.';
    status = 401;
    code = 'INVALID_OPENROUTER_API_KEY';
  } else if (network) {
    message = 'Could not connect to OpenRouter. Check network access or OpenRouter status.';
    status = 503;
    code = 'OPENROUTER_NETWORK_ERROR';
  } else if (rateLimit) {
    message = 'OpenRouter rate limits are busy. NexusDesk tried the fallback models; please retry shortly.';
    status = 429;
    code = 'OPENROUTER_RATE_LIMITED';
  } else if (timeout) {
    message = 'OpenRouter timed out across the available model chain. Please retry with a shorter prompt.';
    status = 504;
    code = 'OPENROUTER_TIMEOUT';
  } else if (empty) {
    message = 'The AI provider returned an empty response. Please retry or rephrase your message.';
    status = 502;
    code = 'OPENROUTER_EMPTY_RESPONSE';
  } else if (parse) {
    message = 'The AI provider returned malformed data. Please retry in a moment.';
    status = 502;
    code = 'OPENROUTER_PARSE_ERROR';
  }

  const error = new Error(message);
  error.status = status;
  error.code = code;
  error.attempts = attempts.map((attempt) => ({
    model: attempt.model,
    status: attempt.error?.status,
    code: attempt.error?.code,
    message: attempt.error?.message,
  }));
  error.cause = lastError;
  return error;
};

export const generateAssistantReply = async ({ systemMessage, history, userPrompt, fetchImpl }) => {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    const error = new Error('OpenRouter is not configured. Add OPENROUTER_API_KEY to server/.env.');
    error.status = 500;
    error.code = 'OPENROUTER_API_KEY_MISSING';
    throw error;
  }

  const messages = buildMessages({ systemMessage, history, userPrompt });
  const models = getOpenRouterModelChain();
  const attempts = [];

  for (const [index, model] of models.entries()) {
    try {
      const content = await requestOpenRouterModel({ apiKey, model, messages, fetchImpl });

      return {
        content,
        provider: AI_PROVIDER_NAME,
        model,
        modelLabel: model === PRIMARY_OPENROUTER_MODEL ? AI_MODEL_LABEL : model,
        fallbackActivated: index > 0,
        attemptedModels: models.slice(0, index + 1),
      };
    } catch (error) {
      attempts.push({ model, error });
      console.warn(`OpenRouter model ${model} failed:`, error.message);

      if (!shouldTryNextModel(error)) break;
    }
  }

  throw createAssistantError(attempts);
};
