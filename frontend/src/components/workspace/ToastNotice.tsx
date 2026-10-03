import Icon from "../Icon";
import type { WorkspaceNotice } from "./types";

type ToastNoticeProps = {
  notice: WorkspaceNotice | null;
  onDismiss: () => void;
};

export default function ToastNotice({ notice, onDismiss }: ToastNoticeProps) {
  if (!notice) return null;

  const iconName =
    notice.kind === "success"
      ? "check"
      : notice.kind === "error"
        ? "alert"
        : "info";

  return (
    <div role="status" className={`toast toast-${notice.kind}`}>
      <span className="toast-icon" aria-hidden="true">
        <Icon name={iconName} size={16} />
      </span>
      <span>{notice.text}</span>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={onDismiss}
      >
        <Icon name="close" size={15} />
      </button>
    </div>
  );
}
