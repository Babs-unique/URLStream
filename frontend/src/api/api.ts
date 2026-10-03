import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

export type ApiEnvelope<T> = {
  statusCode: number;
  success: boolean;
  data: T;
};

export const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3030"
).replace(/\/$/, "");

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
  }),
  tagTypes: ["Auth", "Files"],
  endpoints: () => ({}),
});

export function getFileContentUrl(id: string) {
  return `${API_BASE_URL}/files/${encodeURIComponent(id)}/content`;
}

export function apiErrorMessage(error: unknown): string {
  const fallback = "Something went wrong. Please try again.";
  const connectionMessage = "Unable to connect. Please try again.";

  const candidate =
    typeof error === "object" && error !== null
      ? (error as { data?: unknown; error?: string; status?: unknown; message?: string })
      : undefined;

  const rawMessage =
    typeof error === "string"
      ? error
      : candidate?.error ?? candidate?.message ?? "";
  if (
    candidate?.status === "FETCH_ERROR" ||
    /failed to fetch|network request failed|networkerror|load failed/i.test(
      rawMessage,
    )
  ) {
    return connectionMessage;
  }

  if (typeof candidate?.data === "object" && candidate.data !== null) {
    const data = candidate.data as { message?: unknown };
    if (typeof data.message === "string") return data.message;
    if (Array.isArray(data.message)) return data.message.join(" ");
  }

  return rawMessage || fallback;
}
