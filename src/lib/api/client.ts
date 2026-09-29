import createClient from "openapi-fetch";
import type { paths } from "./schema";

export const apiOrigin = (
  process.env.NEXT_PUBLIC_API_ORIGIN || "http://localhost:8000"
).replace(/\/+$/, "");

export const apiDocsUrl = `${apiOrigin}/docs/api`;
export const openApiSpecUrl = `${apiOrigin}/docs/api.json`;

export const apiClient = createClient<paths>({ baseUrl: `${apiOrigin}/api` });

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
    throw new ApiError("APIに接続できませんでした。時間をおいて再度お試しください。", 0);
  }

  if (result.response.status === 429) {
    throw new ApiError("アクセスが集中しています。1分ほど待ってから再度お試しください。", 429);
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
