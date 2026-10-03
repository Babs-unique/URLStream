import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import type { ChangeEvent, DragEvent } from "react";
import { api, apiErrorMessage, getFileContentUrl } from "../api/api";
import type { AppDispatch } from "../app/store";
import { clearUser, setUser } from "../features/auth/authSlice";
import { useGetCurrentUserQuery } from "../features/auth/authApi";
import {
  useLogoutMutation,
  useDeleteUserMutation,
  useUpdateUserMutation,
} from "../features/auth/authApi";
import type { UpdateUserInput } from "../features/auth/types";
import {
  useDeleteFileMutation,
  useGetFilesQuery,
  useUploadFileMutation,
} from "../features/files/filesApi";
import WorkspaceLayout from "../components/workspace/WorkspaceLayout";
import type {
  FileKind,
  StoredFile,
  WorkspaceNavItem,
  WorkspacePage,
} from "../components/workspace/types";
import {
  formatSize,
  kindFor,
  MAX_FILE_SIZE as LIMIT,
} from "../components/workspace/fileUtils";
import ToastNotice from "../components/workspace/ToastNotice";
import FileDetailsDialog from "../components/workspace/FileDetailsDialog";
import DeleteFileDialog from "../components/workspace/DeleteFileDialog";
import SettingsScreen from "./SettingsScreen";
import StorageScreen from "./StorageScreen";
import DashboardScreen from "./DashboardScreen";
import FilesScreen from "./FilesScreen";

type Page = WorkspacePage;

function PageSkeleton() {
  return (
    <div className="page-skeleton" aria-label="Loading workspace" role="status">
      <div className="skeleton skeleton-eyebrow" />
      <div className="skeleton skeleton-heading" />
      <div className="skeleton skeleton-subheading" />
      <div className="skeleton skeleton-overview" />
      <div className="skeleton skeleton-upload" />
      <div className="skeleton skeleton-section-heading" />
      <div className="skeleton skeleton-table">
        {[1, 2, 3, 4].map((row) => (
          <div className="skeleton-row" key={row}>
            <span className="skeleton skeleton-square" />
            <span className="skeleton skeleton-row-name" />
            <span className="skeleton skeleton-row-detail" />
          </div>
        ))}
      </div>
    </div>
  );
}

function uploadedTimestamp(uploaded: StoredFile["uploaded"]) {
  return Date.parse(uploaded);
}

export default function WorkspaceScreen() {
  const dispatch = useDispatch<AppDispatch>();
  const routerNavigate = useNavigate();
  const { data: user, isLoading: userLoading } = useGetCurrentUserQuery();
  const {
    data: files = [],
    isLoading: filesLoading,
    error: filesError,
    refetch: refetchFiles,
  } = useGetFilesQuery();
  const [uploadFile] = useUploadFileMutation();
  const [deleteFileRequest] = useDeleteFileMutation();
  const [logout] = useLogoutMutation();
  const [updateUser, { isLoading: isUpdatingProfile }] =
    useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [page, setPage] = useState<Page>("Dashboard");
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("urlstream-theme") === "dark" ? "dark" : "light",
  );
  const [selected, setSelected] = useState<StoredFile | null>(null);
  const [toDelete, setToDelete] = useState<StoredFile | null>(null);
  const [menuId, setMenuId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<"newest" | "name" | "size">("newest");
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState<{
    name: string;
    size: number;
    kind: FileKind;
  } | null>(null);
  const [notice, setNotice] = useState<{
    text: string;
    kind: "success" | "error" | "info";
  } | null>(null);
  const userName = user?.name ?? "";
  const quota = user?.storageQuota ?? 0;
  const [detailLoading, setDetailLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadRequestRef = useRef<{ abort: () => void } | null>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("urlstream-theme", theme);
  }, [theme]);
  useEffect(() => {
    document.title = `${page} · URLStream`;
  }, [page]);
  useEffect(
    () => () => {
      uploadRequestRef.current?.abort();
      if (noticeTimer.current) clearTimeout(noticeTimer.current);
    },
    [],
  );
  useEffect(() => {
    if (!selected) return;
    const timeout = setTimeout(() => setDetailLoading(false), 320);
    return () => clearTimeout(timeout);
  }, [selected]);
  useEffect(() => {
    function onEscape(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      if (toDelete) setToDelete(null);
      else if (selected) setSelected(null);
      else if (menuId) setMenuId(null);
    }
    window.addEventListener("keydown", onEscape);
    return () => window.removeEventListener("keydown", onEscape);
  }, [toDelete, selected, menuId]);

  const used = files.reduce((sum, file) => sum + file.size, 0);
  const percentage = quota > 0 ? Math.min(100, (used / quota) * 100) : 0;
  const visibleFiles = files
    .filter((file) => file.name.toLowerCase().includes(query.toLowerCase()))
    .sort((a, b) =>
      sort === "name"
        ? a.name.localeCompare(b.name)
        : sort === "size"
          ? b.size - a.size
          : uploadedTimestamp(b.uploaded) - uploadedTimestamp(a.uploaded),
    );

  function showNotice(
    text: string,
    kind: "success" | "error" | "info" = "info",
  ) {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice({ text, kind });
    noticeTimer.current = setTimeout(() => setNotice(null), 5000);
  }
  function navigate(next: Page) {
    setPage(next);
    setMenuId(null);
    setQuery("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function openFile(file: StoredFile) {
    setDetailLoading(true);
    setSelected(file);
    setMenuId(null);
  }
  function pickFile() {
    inputRef.current?.click();
  }
  async function startUpload(file?: File) {
    if (!file) return;
    if (uploading) {
      showNotice("Please wait for the current upload to finish.", "info");
      return;
    }
    if (file.size > LIMIT) {
      showNotice("This file exceeds the 100 MB upload limit.", "error");
      return;
    }
    if (file.size + used > quota) {
      showNotice(
        "You've reached your storage limit. Delete some files before uploading more.",
        "error",
      );
      return;
    }
    setUploading({
      name: file.name,
      size: file.size,
      kind: kindFor(file),
    });
    const request = uploadFile(file);
    uploadRequestRef.current = request;
    try {
      await request.unwrap();
      showNotice(`${file.name} uploaded successfully.`, "success");
    } catch (error) {
      if ((error as { name?: string }).name !== "AbortError") {
        showNotice(apiErrorMessage(error), "error");
      }
    } finally {
      if (uploadRequestRef.current === request) uploadRequestRef.current = null;
      setUploading(null);
    }
  }
  function cancelUpload() {
    uploadRequestRef.current?.abort();
    uploadRequestRef.current = null;
    setUploading(null);
    showNotice("Upload canceled.");
  }
  function handleInput(event: ChangeEvent<HTMLInputElement>) {
    startUpload(event.target.files?.[0]);
    event.target.value = "";
  }
  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length > 1)
      showNotice(
        "Upload one file at a time. Only the first file was selected.",
      );
    startUpload(event.dataTransfer.files[0]);
  }
  function download(file: StoredFile) {
    setMenuId(null);
    const link = document.createElement("a");
    link.href = getFileContentUrl(file.id);
    link.download = file.name;
    link.rel = "noreferrer";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
  async function deleteFile() {
    if (!toDelete) return;
    const file = toDelete;
    try {
      await deleteFileRequest(file.id).unwrap();
      if (selected?.id === file.id) setSelected(null);
      showNotice(`${file.name} deleted.`, "success");
      setToDelete(null);
      setMenuId(null);
    } catch (error) {
      showNotice(apiErrorMessage(error), "error");
    }
  }
  async function signOut() {
    try {
      await logout().unwrap();
    } catch (error) {
      showNotice(apiErrorMessage(error), "error");
    } finally {
      dispatch(clearUser());
      dispatch(api.util.resetApiState());
      routerNavigate("/login");
    }
  }
  async function saveProfile(profile: UpdateUserInput) {
    const updatedUser = await updateUser(profile).unwrap();
    dispatch(setUser(updatedUser));
    showNotice("Profile updated.", "success");
  }
  async function deleteAccount() {
    try {
      await deleteUser().unwrap();
      await logout()
        .unwrap()
        .catch(() => undefined);
      dispatch(clearUser());
      dispatch(api.util.resetApiState());
      routerNavigate("/login");
    } catch (error) {
      showNotice(apiErrorMessage(error), "error");
    }
  }
  const navItems: WorkspaceNavItem[] = [
    { name: "Dashboard", icon: "grid" },
    { name: "My Files", icon: "folder" },
    { name: "Storage", icon: "database" },
    { name: "Settings", icon: "settings" },
  ];

  return (
    <div
      className="app-shell"
      onClick={() => {
        if (menuId) setMenuId(null);
      }}
    >
      <a
        href="#workspace-main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--surface)] focus:p-4"
      >
        Skip to main content
      </a>
      <input
        className="sr-only"
        ref={inputRef}
        type="file"
        onChange={handleInput}
        aria-label="Choose a file to upload"
      />
      <WorkspaceLayout
        page={page}
        navItems={navItems}
        userName={userName}
        usedLabel={formatSize(used)}
        quotaLabel={formatSize(quota)}
        percentage={percentage}
        theme={theme}
        onNavigate={navigate}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        onSignOut={signOut}
      >
        {filesError && !files.length ? (
          <div className="empty-state" role="alert">
            <h1>Unable to load files</h1>
            <p>{apiErrorMessage(filesError)}</p>
            <button
              className="btn btn-secondary"
              type="button"
              onClick={() => refetchFiles()}
            >
              Try again
            </button>
          </div>
        ) : userLoading || filesLoading ? (
          <PageSkeleton />
        ) : (
          <>
            {page === "Dashboard" && (
              <DashboardScreen
                files={visibleFiles}
                totalCount={files.length}
                query={query}
                sort={sort}
                menuId={menuId}
                used={used}
                percentage={percentage}
                quota={quota}
                dragging={dragging}
                uploading={uploading}
                onQueryChange={setQuery}
                onSortChange={setSort}
                onOpen={openFile}
                onDownload={download}
                onDelete={(file) => {
                  setToDelete(file);
                  setMenuId(null);
                }}
                onToggleMenu={(fileId) =>
                  setMenuId(menuId === fileId ? null : fileId)
                }
                onUpload={pickFile}
                onDragOver={() => setDragging(true)}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onCancelUpload={cancelUpload}
                onViewAll={() => navigate("My Files")}
              />
            )}

            {page === "My Files" && (
              <FilesScreen
                files={visibleFiles}
                totalCount={files.length}
                query={query}
                sort={sort}
                menuId={menuId}
                onQueryChange={setQuery}
                onSortChange={setSort}
                onOpen={openFile}
                onDownload={download}
                onDelete={(file) => {
                  setToDelete(file);
                  setMenuId(null);
                }}
                onToggleMenu={(fileId) =>
                  setMenuId(menuId === fileId ? null : fileId)
                }
                onUpload={pickFile}
              />
            )}

            {page === "Storage" && (
              <StorageScreen
                files={files}
                used={used}
                percentage={percentage}
                quota={quota}
                onUpload={pickFile}
              />
            )}

            {page === "Settings" && (
              <SettingsScreen
                userName={userName}
                email={user?.email ?? ""}
                theme={theme}
                quota={quota}
                onThemeChange={setTheme}
                onSignOut={signOut}
                onUpdateProfile={saveProfile}
                isUpdatingProfile={isUpdatingProfile}
                onDeleteAccount={deleteAccount}
              />
            )}
          </>
        )}
      </WorkspaceLayout>

      <ToastNotice notice={notice} onDismiss={() => setNotice(null)} />
      <FileDetailsDialog
        file={selected}
        loading={detailLoading}
        onClose={() => setSelected(null)}
        onDelete={setToDelete}
        onDownload={download}
      />
      <DeleteFileDialog
        file={toDelete}
        onCancel={() => setToDelete(null)}
        onConfirm={deleteFile}
      />
    </div>
  );
}
