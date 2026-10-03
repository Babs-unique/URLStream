import { api, type ApiEnvelope } from "../../api/api";
import { kindFor } from "../../components/workspace/fileUtils";
import type { StoredFile } from "./types";

type BackendFile = {
  id: string;
  storageKey: string;
  userId?: string;
  originalName: string;
  mimeType: string;
  size: number;
  createdAt?: string;
};

function toStoredFile(file: BackendFile): StoredFile {
  return {
    id: file.id,
    storageKey: file.storageKey,
    name: file.originalName,
    type: file.mimeType,
    size: file.size,
    uploaded: file.createdAt ?? new Date().toISOString(),
    kind: kindFor({ type: file.mimeType, name: file.originalName }),
  };
}

const filesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getFiles: builder.query<StoredFile[], void>({
      query: () => "/files",
      transformResponse: (response: ApiEnvelope<BackendFile[]>) =>
        response.data.map(toStoredFile),
      providesTags: (files) => [
        { type: "Files", id: "LIST" },
        ...(files ?? []).map(({ id }) => ({ type: "Files" as const, id })),
      ],
    }),
    getFile: builder.query<BackendFile, string>({
      query: (id) => `/files/${id}`,
      transformResponse: (response: ApiEnvelope<BackendFile>) => response.data,
      providesTags: (_file, _error, id) => [{ type: "Files", id }],
    }),
    getFilePreviewUrl: builder.query<string, string>({
      query: (id) => ({
        url: `/files/${id}/content`,
        responseHandler: (response) => response.blob(),
      }),
      transformResponse: (blob: Blob) => URL.createObjectURL(blob),
      keepUnusedDataFor: 0,
      async onCacheEntryAdded(_id, { cacheDataLoaded, cacheEntryRemoved }) {
        try {
          const { data: objectUrl } = await cacheDataLoaded;
          await cacheEntryRemoved;
          URL.revokeObjectURL(objectUrl);
        } catch {
          await cacheEntryRemoved;
        }
      },
    }),
    uploadFile: builder.mutation<StoredFile, File>({
      query: (file) => {
        const body = new FormData();
        body.append("file", file);
        return { url: "/files", method: "POST", body };
      },
      transformResponse: (response: ApiEnvelope<BackendFile>) =>
        toStoredFile(response.data),
      invalidatesTags: [{ type: "Files", id: "LIST" }],
    }),
    deleteFile: builder.mutation<void, string>({
      query: (id) => ({ url: `/files/${id}`, method: "DELETE" }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Files", id },
        { type: "Files", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetFilesQuery,
  useGetFileQuery,
  useGetFilePreviewUrlQuery,
  useUploadFileMutation,
  useDeleteFileMutation,
} = filesApi;
