import Icon from "../Icon";
import { useGetFilePreviewUrlQuery } from "../../features/files/filesApi";
import FileIcon from "./FileIcon";
import { formatSize } from "./fileUtils";
import type { StoredFile } from "./types";

type FileDetailsDialogProps = {
  file: StoredFile | null;
  loading: boolean;
  onClose: () => void;
  onDelete: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
};

function PreviewContent({
  file,
  previewUrl,
  onDownload,
}: {
  file: StoredFile;
  previewUrl?: string;
  onDownload: (file: StoredFile) => void;
}) {
  if (previewUrl && file.kind === "image") {
    return <img src={previewUrl} alt={file.name} className="preview-image" />;
  }
  if (previewUrl && file.kind === "video") {
    return (
      <video
        src={previewUrl}
        controls
        preload="metadata"
        className="preview-video"
      />
    );
  }
  if (previewUrl && file.kind === "audio") {
    return (
      <div className="audio-preview">
        <div className="audio-art" aria-hidden="true">
          <Icon name="audio" size={52} strokeWidth={1.1} />
        </div>
        <audio
          src={previewUrl}
          controls
          preload="metadata"
          aria-label={`Play ${file.name}`}
        />
      </div>
    );
  }
  if (previewUrl && file.kind === "pdf") {
    return (
      <iframe
        title={`Preview of ${file.name}`}
        src={previewUrl}
        className="preview-pdf"
      />
    );
  }
  return (
    <div className="no-preview">
      <div className="no-preview-icon" aria-hidden="true">
        <Icon
          name={
            file.kind === "video" || file.kind === "audio" ? file.kind : "file"
          }
          size={32}
        />
      </div>
      <h3>No preview available</h3>
      <p>"Download the file to open it on your device."</p>
      <button
        className="btn btn-secondary"
        type="button"
        onClick={() => onDownload(file)}
      >
        <Icon name="download" size={17} /> Download
      </button>
    </div>
  );
}

export default function FileDetailsDialog({
  file,
  loading,
  onClose,
  onDelete,
  onDownload,
}: FileDetailsDialogProps) {
  const { data: streamUrl, isLoading: isStreamLoading } =
    useGetFilePreviewUrlQuery(file?.id ?? "", {
      skip: !file || file.kind === "archive" || file.kind === "file",
    });

  if (!file) return null;
  const uploadedDate = new Date(file.uploaded);

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div
        className="details-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="details-title"
      >
        <div className="modal-header">
          <div className="modal-title-group">
            <FileIcon kind={file.kind} />
            <div>
              <h2 id="details-title">{file.name}</h2>
              <span>{file.type}</span>
            </div>
          </div>
          <button
            className="icon-button"
            type="button"
            onClick={onClose}
            aria-label="Close details"
          >
            <Icon name="close" size={19} />
          </button>
        </div>

        {loading || isStreamLoading ? (
          <>
            <div className="preview-area preview-loading">
              <div className="skeleton skeleton-preview" />
            </div>
            <div className="detail-meta" aria-label="Loading file details">
              <div className="skeleton skeleton-meta" />
              <div className="skeleton skeleton-meta" />
              <div className="skeleton skeleton-meta" />
            </div>
          </>
        ) : (
          <>
            <div className="preview-area">
              <PreviewContent
                file={file}
                previewUrl={streamUrl}
                onDownload={onDownload}
              />
            </div>
            <div className="detail-meta">
              <div>
                <span>File type</span>
                <strong>{file.type}</strong>
              </div>
              <div>
                <span>File size</span>
                <strong>{formatSize(file.size)}</strong>
              </div>
              <div>
                <span>Uploaded</span>
                <strong>
                  {uploadedDate.toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </strong>
              </div>
            </div>
          </>
        )}

        <div className="modal-footer">
          <button
            className="btn btn-danger-text"
            type="button"
            onClick={() => onDelete(file)}
          >
            <Icon name="trash" size={17} /> Delete file
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => onDownload(file)}
          >
            <Icon name="download" size={17} /> Download
          </button>
        </div>
      </div>
    </div>
  );
}
