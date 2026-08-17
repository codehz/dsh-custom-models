import {
  LlmError,
  attributionHeaders,
  normalizeApiKey,
  type LlmDiscoveredModel,
  type LlmModelDiscoveryRequest,
} from "@deepseek-ai/dsh-llm";

const LISTABLE_PROTOCOLS = new Set(["openai-completions", "openai-responses"]);
const MAX_RESPONSE_BYTES = 4 * 1024 * 1024;

function capacity(...candidates: unknown[]): number | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === "number" && Number.isInteger(candidate) && candidate > 0) {
      return candidate;
    }
  }
  return undefined;
}

function label(...candidates: unknown[]): string | undefined {
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  return undefined;
}

export function listingUrl(baseURL: string): string {
  return baseURL.replace(/\/+$/, "") + "/models";
}

async function readBounded(response: Response, url: string): Promise<string> {
  const oversized = () => new LlmError(
    url + " answered with more than " + MAX_RESPONSE_BYTES + " bytes",
    "DISCOVERY_FAILED",
  );
  const declared = Number(response.headers.get("content-length") ?? Number.NaN);
  if (Number.isFinite(declared) && declared > MAX_RESPONSE_BYTES) {
    await response.body?.cancel();
    throw oversized();
  }
  if (response.body === null) return "";
  const reader = response.body.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > MAX_RESPONSE_BYTES) throw oversized();
      chunks.push(value);
    }
  } finally {
    await reader.cancel().catch(() => {});
  }
  const body = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return new TextDecoder().decode(body);
}

/** Read one OpenAI-compatible `GET /models` reply. */
export function readListing(body: unknown): LlmDiscoveredModel[] {
  const data = body !== null && typeof body === "object" && !Array.isArray(body)
    ? (body as { data?: unknown }).data
    : undefined;
  if (!Array.isArray(data)) {
    throw new LlmError(
      'the endpoint\'s model listing has no "data" array; enter this provider\'s models by hand',
      "DISCOVERY_FAILED",
    );
  }
  const models: LlmDiscoveredModel[] = [];
  for (const raw of data) {
    const entry = raw as Record<string, unknown> | null;
    const id = label(entry?.id);
    if (id === undefined) continue;
    const name = label(entry?.name, entry?.display_name);
    const contextWindow = capacity(entry?.context_window, entry?.context_length);
    const maxTokens = capacity(entry?.max_output_tokens, entry?.max_tokens);
    models.push({
      id,
      ...(name === undefined ? {} : { name }),
      ...(contextWindow === undefined ? {} : { contextWindow }),
      ...(maxTokens === undefined ? {} : { maxTokens }),
    });
  }
  return models;
}

function usableProbeKey(raw: string): string {
  const checked = normalizeApiKey(raw);
  if (checked.ok) return checked.value;
  throw new LlmError(
    checked.reason === "empty"
      ? "this provider's API key is blank; enter it on the form, or clear it to probe unauthenticated"
      : "this provider's API key contains characters no HTTP header can carry; paste the raw key only",
    "INVALID_CREDENTIAL",
  );
}

/**
 * Interrogate one draft provider endpoint via the OpenAI-compatible
 * `GET {baseURL}/models` listing.
 */
export async function discoverModels(
  request: LlmModelDiscoveryRequest,
  storedApiKey?: () => Promise<string | undefined>,
  extraHeaders?: Record<string, string>,
): Promise<readonly LlmDiscoveredModel[]> {
  if (request.baseURL === undefined || request.baseURL.length === 0) {
    throw new LlmError(
      "set a baseURL, or enter this provider's models by hand",
      "DISCOVERY_FAILED",
    );
  }
  const api = request.api ?? "openai-completions";
  if (!LISTABLE_PROTOCOLS.has(api)) {
    throw new LlmError(
      'protocol "' + api + '" has no model listing this build can read; enter this provider\'s models by hand',
      "DISCOVERY_UNSUPPORTED",
    );
  }
  const url = listingUrl(request.baseURL);
  const supplied = request.apiKey ?? await storedApiKey?.();
  const apiKey = supplied === undefined ? undefined : usableProbeKey(supplied);
  let response: Response;
  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        accept: "application/json",
        ...(apiKey === undefined ? {} : { authorization: "Bearer " + apiKey }),
        ...attributionHeaders(),
        ...extraHeaders,
      },
      ...(request.signal === undefined ? {} : { signal: request.signal }),
    });
  } catch (error) {
    if (request.signal?.aborted) {
      throw new LlmError("model discovery aborted by caller", "ABORTED", { cause: error });
    }
    throw new LlmError("could not reach " + url, "DISCOVERY_FAILED", { cause: error });
  }
  if (!response.ok) {
    throw new LlmError(
      url + " answered " + response.status +
        (response.status === 401 || response.status === 403 ? "; check the API key" : ""),
      "DISCOVERY_FAILED",
    );
  }
  let text: string;
  try {
    text = await readBounded(response, url);
  } catch (error) {
    if (request.signal?.aborted) {
      throw new LlmError("model discovery aborted by caller", "ABORTED", { cause: error });
    }
    throw error;
  }
  let body: unknown;
  try {
    body = JSON.parse(text);
  } catch (error) {
    throw new LlmError(url + " did not answer with JSON", "DISCOVERY_FAILED", { cause: error });
  }
  return readListing(body);
}
