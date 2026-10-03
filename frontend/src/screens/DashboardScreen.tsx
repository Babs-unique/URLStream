import Icon from "../components/Icon";
import FileIcon from "../components/workspace/FileIcon";
import FileLibrary, {
  type FileLibraryProps,
} from "../components/workspace/FileLibrary";
import { formatSize } from "../components/workspace/fileUtils";
import type { StoredFile } from "../components/workspace/types";

type UploadProgress = {
  name: string;
  size: number;
  kind: StoredFile["kind"];
};

type DashboardScreenProps = Omit<
  FileLibraryProps,
  "title" | "description" | "onViewAll"
> & {
  used: number;
  quota: number;
  percentage: number;
  dragging: boolean;
  uploading: UploadProgress | null;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
  onCancelUpload: () => void;
  onViewAll: () => void;
};

export default function DashboardScreen({
  files,
  totalCount,
  query,
  sort,
  menuId,
  used,
  quota,
  percentage,
  dragging,
  uploading,
  onQueryChange,
  onSortChange,
  onOpen,
  onDownload,
  onDelete,
  onToggleMenu,
  onUpload,
  onDragOver,
  onDragLeave,
  onDrop,
  onCancelUpload,
  onViewAll,
}: DashboardScreenProps) {
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow intro-eyebrow">YOUR WORKSPACE</div>
          <h1>Your files</h1>
          <p>Upload, manage, and stream your files.</p>
        </div>
        <button
          className="btn btn-primary intro-upload"
          type="button"
          onClick={onUpload}
        >
          <Icon name="plus" size={18} strokeWidth={2} /> Upload files
        </button>
      </div>

      <section className="overview-strip" aria-label="Storage overview">
        <div className="overview-identity">
          <div className="overview-icon" aria-hidden="true">
            <Icon name="database" size={20} />
          </div>
          <div>
            <strong>Storage overview</strong>
            <span>Your space, at a glance</span>
          </div>
        </div>
        <div className="overview-usage">
          <div className="overview-usage-label">
            <strong>
              {formatSize(used)} <span>of {formatSize(quota)} used</span>
            </strong>
            <span>{Math.round(percentage)}%</span>
          </div>
          <div
            className={`progress-track ${percentage >= 90 ? "progress-warning" : ""}`}
            role="progressbar"
            aria-label="Storage used"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(percentage)}
          >
            <span style={{ width: `${percentage}%` }} />
          </div>
          {percentage >= 90 && (
            <small className="quota-warning">
              Almost at your storage limit
            </small>
          )}
        </div>
      </section>

      <div
        className={`upload-zone ${dragging ? "dragging" : ""} ${uploading ? "upload-zone-busy" : ""}`}
        onDragOver={(event) => {
          event.preventDefault();
          onDragOver();
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            onDragLeave();
          }
        }}
        onDrop={onDrop}
      >
        {uploading ? (
          <div className="upload-in-progress" role="status">
            <FileIcon kind={uploading.kind} />
            <div className="upload-progress-info">
              <div className="upload-progress-top">
                <strong>{uploading.name}</strong>
                <span>Uploading</span>
              </div>
              <p>{formatSize(uploading.size)} · Uploading file...</p>
            </div>
            <button
              className="icon-button"
              type="button"
              aria-label="Cancel upload"
              onClick={onCancelUpload}
            >
              <Icon name="close" size={18} />
            </button>
          </div>
        ) : (
          <>
            <div className="upload-glyph" aria-hidden="true">
              <Icon name="upload" size={24} strokeWidth={1.7} />
            </div>
            <strong>{dragging ? "Drop to upload" : "Drop files here"}</strong>
            <p>
              or{" "}
              <button className="text-link" type="button" onClick={onUpload}>
                click to browse
              </button>{" "}
              from your device
            </p>
            <span className="upload-helper">
              One file at a time <span>·</span> Maximum file size: 100 MB
            </span>
          </>
        )}
      </div>

      <FileLibrary
        files={files}
        totalCount={totalCount}
        query={query}
        sort={sort}
        menuId={menuId}
        title="Recent files"
        description="Your latest uploads, ready when you are."
        onQueryChange={onQueryChange}
        onSortChange={onSortChange}
        onOpen={onOpen}
        onDownload={onDownload}
        onDelete={onDelete}
        onToggleMenu={onToggleMenu}
        onUpload={onUpload}
        onViewAll={onViewAll}
      />

      <div className="content-footnote">
        <Icon name="shield" size={16} /> Files are stored with your account
        <span>·</span> Downloads are served on demand
      </div>
    </>
  );
}
