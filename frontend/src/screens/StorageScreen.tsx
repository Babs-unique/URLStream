import Icon from "../components/Icon";
import FileIcon from "../components/workspace/FileIcon";
import { formatSize } from "../components/workspace/fileUtils";
import type { FileKind, StoredFile } from "../components/workspace/types";

type StorageScreenProps = {
  files: StoredFile[];
  used: number;
  quota: number;
  percentage: number;
  onUpload: () => void;
};

const fileKinds: FileKind[] = [
  "video",
  "archive",
  "audio",
  "pdf",
  "image",
  "file",
];

function categoryName(kind: FileKind) {
  if (kind === "pdf") return "Documents";
  if (kind === "archive") return "Archives";
  if (kind === "file") return "Other";
  return kind.charAt(0).toUpperCase() + kind.slice(1);
}

export default function StorageScreen({
  files,
  used,
  quota,
  percentage,
  onUpload,
}: StorageScreenProps) {
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow intro-eyebrow">YOUR WORKSPACE</div>
          <h1>Storage</h1>
          <p>A clear view of what’s taking up space.</p>
        </div>
        <button className="btn btn-primary intro-upload" onClick={onUpload}>
          <Icon name="plus" size={18} /> Upload files
        </button>
      </div>

      <section className="storage-card" aria-labelledby="storage-usage-title">
        <div className="storage-card-top">
          <div className="storage-card-icon" aria-hidden="true">
            <Icon name="database" size={24} />
          </div>
          <span className="storage-plan">ACCOUNT QUOTA</span>
        </div>
        <h2 id="storage-usage-title">
          {formatSize(used)} <span>used</span>
        </h2>
        <p>of {formatSize(quota)} total storage</p>
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
        <div className="storage-scale" aria-hidden="true">
          <span>0 GB</span>
          <span>{formatSize(quota)}</span>
        </div>
        {percentage >= 90 && (
          <p className="storage-alert" role="status">
            <Icon name="alert" size={18} /> You&apos;re almost out of space.
            Delete files to make room for new uploads.
          </p>
        )}
      </section>

      <section className="storage-breakdown" aria-labelledby="breakdown-title">
        <div className="section-header">
          <div>
            <h2 id="breakdown-title">Storage breakdown</h2>
            <p>Space used by each file type.</p>
          </div>
        </div>
        <div className="breakdown-list">
          {fileKinds.map((kind) => {
            const total = files
              .filter((file) => file.kind === kind)
              .reduce((sum, file) => sum + file.size, 0);
            if (!total) return null;

            return (
              <div className="breakdown-row" key={kind}>
                <FileIcon kind={kind} />
                <span className="breakdown-name">{categoryName(kind)}</span>
                <span
                  className="breakdown-bar"
                  role="progressbar"
                  aria-label={`${categoryName(kind)} share of used storage`}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={Math.round((total / Math.max(used, 1)) * 100)}
                >
                  <span
                    style={{ width: `${(total / Math.max(used, 1)) * 100}%` }}
                  />
                </span>
                <strong>{formatSize(total)}</strong>
              </div>
            );
          })}
          {!files.length && (
            <p className="breakdown-empty">No files are using storage yet.</p>
          )}
        </div>
      </section>
    </>
  );
}
