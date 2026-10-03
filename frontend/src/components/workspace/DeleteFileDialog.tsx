import Icon from "../Icon";
import type { StoredFile } from "./types";

type DeleteFileDialogProps = {
  file: StoredFile | null;
  onCancel: () => void;
  onConfirm: () => void;
};

export default function DeleteFileDialog({
  file,
  onCancel,
  onConfirm,
}: DeleteFileDialogProps) {
  if (!file) return null;

  return (
    <div
      className="modal-backdrop confirmation-layer"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancel();
      }}
    >
      <div
        className="confirm-modal"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-title"
        aria-describedby="delete-description"
      >
        <div className="delete-icon" aria-hidden="true">
          <Icon name="trash" size={21} />
        </div>
        <h2 id="delete-title">Delete “{file.name}”?</h2>
        <p id="delete-description">
          This file will be permanently removed from your storage. This action
          cannot be undone.
        </p>
        <div className="confirm-actions">
          <button
            className="btn btn-secondary"
            type="button"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button className="btn btn-danger" type="button" onClick={onConfirm}>
            Delete file
          </button>
        </div>
      </div>
    </div>
  );
}
