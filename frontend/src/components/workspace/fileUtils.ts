import type { FileKind } from "./types";

export const MEGABYTE = 1024 * 1024;
export const MAX_FILE_SIZE = 100 * MEGABYTE;

export function formatSize(bytes: number) {
  return bytes >= 1024 * MEGABYTE
    ? `${(bytes / (1024 * MEGABYTE)).toFixed(1)} GB`
    : bytes >= MEGABYTE
      ? `${(bytes / MEGABYTE).toFixed(1)} MB`
      : bytes >= 1024
        ? `${(bytes / 1024).toFixed(0)} KB`
        : `${bytes} B`;
}

export function relativeDate(value: string) {
  const date = new Date(value);
  const days = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function kindFor(file: Pick<File, "type" | "name">): FileKind {
  if (file.type.startsWith("image/")) return "image";
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "application/pdf") return "pdf";
  if (/\.(zip|rar|7z)$/i.test(file.name)) return "archive";
  return "file";
}
