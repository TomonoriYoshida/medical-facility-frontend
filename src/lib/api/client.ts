import createClient from "openapi-fetch";
import type { paths } from "./schema";

// The localhost fallback is for `next dev` only. A production build without an
// origin must not send visitors' browsers to their own localhost.
export const apiOrigin = (
  process.env.NEXT_PUBLIC_API_ORIGIN ||
  (process.env.NODE_ENV === "development" ? "http://localhost:8000" : "")
).replace(/\/+$/, "");

/** False until the deploy sets API_ORIGIN; the site then explains the API isn't public yet. */
export const isApiConfigured = apiOrigin !== "";

export const apiUnavailableMessage =
  "デモ用のAPIは現在公開の準備中のため、検索などの機能はまだご利用いただけません。";

export const apiDocsUrl = `${apiOrigin}/docs/api`;
export const openApiSpecUrl = `${apiOrigin}/docs/api.json`;

export const apiClient = createClient<paths>({
  baseUrl: `${apiOrigin}/api`,
  // Without an origin the base URL would be this site's own /api, so fail without a request.
  fetch: isApiConfigured ? undefined : () => Promise.reject(new Error("API origin is not configured")),
});

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

/**
 * Unwraps an openapi-fetch result, turning network failures and non-2xx
 * responses into an ApiError that carries the API's own message.
 */
export async function unwrap<T>(
  request: Promise<{ data?: T; error?: unknown; response: Response }>,
): Promise<T> {
  let result;
  try {
    result = await request;
  } catch {
    throw new ApiError(
      isApiConfigured ? "APIに接続できませんでした。時間をおいて再度お試しください。" : apiUnavailableMessage,
      0,
    );
  }

  if (result.response.status === 429) {
    throw new ApiError("アクセスが集中しています。1分ほど待ってから再度お試しください。", 429);
  }

  // Laravel's validation messages are in English; the forms prevent most of these,
  // so this is mainly a hand-edited URL.
  if (result.response.status === 422) {
    throw new ApiError(
      "検索条件に誤りがあります。条件を見直してください（キーワードは5語まで）。",
      422,
    );
  }

  if (result.data === undefined) {
    const message =
      typeof result.error === "object" &&
      result.error !== null &&
      "message" in result.error &&
      typeof result.error.message === "string"
        ? result.error.message
        : `APIエラーが発生しました（HTTP ${result.response.status}）`;
    throw new ApiError(message, result.response.status);
  }

  return result.data;
}
