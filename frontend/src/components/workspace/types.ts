import type { IconName } from "../Icon";
import type { FileKind, StoredFile } from "../../features/files/types";

export type WorkspacePage = "Dashboard" | "My Files" | "Storage" | "Settings";

export type WorkspaceNavItem = {
  name: WorkspacePage;
  icon: IconName;
};

export type { FileKind, StoredFile };

export type WorkspaceNotice = {
  text: string;
  kind: "success" | "error" | "info";
};
