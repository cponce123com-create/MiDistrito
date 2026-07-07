export type CustomFetchOptions = RequestInit & {
  responseType?: "json" | "text" | "blob" | "auto";
};

export type AuthTokenGetter = () => Promise<string | null> | string | null;

const NO_BODY_STATUS = new Set([204, 205, 304]);

let _baseUrl: string | null = null;
let _authTokenGetter: AuthTokenGetter | null = null;

export function setBaseUrl(url: string | null): void {
  _baseUrl = url ? url.replace(/\/+$/, "") : null;
}

export function setAuthTokenGetter(getter: AuthTokenGetter | null): void {
  _authTokenGetter = getter;
}

function resolveUrl(input: RequestInfo | URL): string {
  if (typeof input === "string") return input;
  if (typeof URL !== "undefined" && input instanceof URL) return input.toString();
  return (input as Request).url;
}

function applyBaseUrl(input: RequestInfo | URL): RequestInfo | URL {
  if (!_baseUrl) return input;
  const url = resolveUrl(input);
  if (!url.startsWith("/")) return input;
  return `${_baseUrl}${url}`;
}

function mergeHeaders(...sources: Array<HeadersInit | undefined>): Headers {
  const headers = new Headers();
  for (const source of sources) {
    if (!source) continue;
    new Headers(source).forEach((value, key) => headers.set(key, value));
  }
  return headers;
}

export async function customFetch<T>(
  input: RequestInfo | URL,
  options: CustomFetchOptions = {},
): Promise<T> {
  const { responseType = "auto", ...fetchOptions } = options;
  const url = applyBaseUrl(input);

  const headers = mergeHeaders(
    fetchOptions.headers,
    _authTokenGetter ? { Authorization: `Bearer ${await _authTokenGetter()}` } : undefined,
  );

  if (fetchOptions.body && typeof fetchOptions.body === "object" && !(fetchOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    fetchOptions.body = JSON.stringify(fetchOptions.body);
  }

  const response = await fetch(url, { ...fetchOptions, headers });

  if (!response.ok) {
    const errorBody = await response.text();
    let errorData: unknown;
    try {
      errorData = JSON.parse(errorBody);
    } catch {
      errorData = errorBody;
    }
    throw new ApiError(response.status, errorData, response.statusText);
  }

  if (NO_BODY_STATUS.has(response.status)) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") || "";

  if (responseType === "json" || (responseType === "auto" && contentType.includes("json"))) {
    return response.json() as Promise<T>;
  }
  if (responseType === "text" || (responseType === "auto" && contentType.includes("text"))) {
    return response.text() as unknown as T;
  }
  if (responseType === "blob") {
    return response.blob() as unknown as T;
  }
  return response.json() as Promise<T>;
}

export class ApiError<T = unknown> extends Error {
  constructor(
    public status: number,
    public data: T,
    message?: string,
  ) {
    super(message || `API Error ${status}`);
    this.name = "ApiError";
  }
}
