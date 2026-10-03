export type FileKind = "pdf" | "image" | "video" | "audio" | "archive" | "file";

export type StoredFile = {
  id: string;
  storageKey: string;
  name: string;
  type: string;
  size: number;
  uploaded: string;
  kind: FileKind;
};
