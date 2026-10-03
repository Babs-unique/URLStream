import Icon from "../Icon";
import FileIcon from "./FileIcon";
import { formatSize, relativeDate } from "./fileUtils";
import type { StoredFile } from "./types";

export type FileLibraryProps = {
  files: StoredFile[];
  totalCount: number;
  query: string;
  sort: "newest" | "name" | "size";
  menuId: string | null;
  title: string;
  description: string;
  onQueryChange: (query: string) => void;
  onSortChange: (sort: "newest" | "name" | "size") => void;
  onOpen: (file: StoredFile) => void;
  onDownload: (file: StoredFile) => void;
  onDelete: (file: StoredFile) => void;
  onToggleMenu: (fileId: string) => void;
  onUpload: () => void;
  onViewAll?: () => void;
};

export default function FileLibrary({
  files,
  totalCount,
  query,
  sort,
  menuId,
  title,
  description,
  onQueryChange,
  onSortChange,
  onOpen,
  onDownload,
  onDelete,
  onToggleMenu,
  onUpload,
  onViewAll,
}: FileLibraryProps) {
  return (
    <section className="files-section" aria-labelledby="files-title">
      <div className="section-header">
        <div>
          <div className="section-title-line">
            <h2 id="files-title">{title}</h2>
            <span className="count-badge">{totalCount}</span>
          </div>
          <p>{description}</p>
        </div>
        {onViewAll && (
          <button className="view-all" type="button" onClick={onViewAll}>
            View all files <Icon name="arrow" size={16} />
          </button>
        )}
      </div>

      <div className="file-panel">
        <div className="file-toolbar">
          <div className="search-field">
            <Icon name="search" size={17} />
            <input
              type="search"
              aria-label="Search files"
              placeholder="Search files..."
              value={query}
              onChange={(event) => onQueryChange(event.target.value)}
            />
            {query && (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => onQueryChange("")}
              >
                <Icon name="close" size={14} />
              </button>
            )}
          </div>
          <div className="toolbar-right">
            <span>
              {files.length} {files.length === 1 ? "file" : "files"}
            </span>
            <span className="toolbar-divider" />
            <label className="sort-label">
              Sort by
              <select
                value={sort}
                onChange={(event) =>
                  onSortChange(event.target.value as FileLibraryProps["sort"])
                }
                aria-label="Sort files"
              >
                <option value="newest">Newest</option>
                <option value="name">Name</option>
                <option value="size">Size</option>
              </select>
            </label>
          </div>
        </div>

        {files.length ? (
          <table className="file-table">
            <thead>
              <tr className="table-head">
                <th scope="col">NAME</th>
                <th scope="col">TYPE</th>
                <th scope="col">FILE SIZE</th>
                <th scope="col">UPLOADED</th>
                <th scope="col" className="sr-only">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {files.map((file) => (
                <tr className="file-row" key={file.id}>
                  <td>
                    <button
                      className="file-name-cell"
                      type="button"
                      onClick={() => onOpen(file)}
                    >
                      <FileIcon kind={file.kind} />
                      <span className="file-name-copy">
                        <strong title={file.name}>{file.name}</strong>
                        <small>{file.type}</small>
                        <small className="mobile-file-meta">
                          {formatSize(file.size)} <span>·</span>{" "}
                          {relativeDate(file.uploaded)}
                        </small>
                      </span>
                    </button>
                  </td>
                  <td className="table-type">{file.type}</td>
                  <td className="table-size">{formatSize(file.size)}</td>
                  <td className="table-date">{relativeDate(file.uploaded)}</td>
                  <td className="row-actions">
                    <button
                      className="row-more"
                      type="button"
                      aria-label={`Actions for ${file.name}`}
                      aria-expanded={menuId === file.id}
                      onClick={(event) => {
                        event.stopPropagation();
                        onToggleMenu(file.id);
                      }}
                    >
                      <Icon name="more" size={19} />
                    </button>
                    {menuId === file.id && (
                      <div
                        className="action-menu"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <button type="button" onClick={() => onOpen(file)}>
                          <Icon name="external" size={16} /> Open
                        </button>
                        <button type="button" onClick={() => onDownload(file)}>
                          <Icon name="download" size={16} /> Download
                        </button>
                        <div className="menu-rule" />
                        <button
                          type="button"
                          className="danger-action"
                          onClick={() => onDelete(file)}
                        >
                          <Icon name="trash" size={16} /> Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon" aria-hidden="true">
              <Icon name={query ? "search" : "folder"} size={27} />
            </div>
            <h3>{query ? "No matching files" : "No files yet"}</h3>
            <p>
              {query
                ? "Try a different search to find what you need."
                : "Upload your first file and it will appear here."}
            </p>
            {query ? (
              <button
                className="btn btn-secondary"
                type="button"
                onClick={() => onQueryChange("")}
              >
                Clear search
              </button>
            ) : (
              <button
                className="btn btn-primary"
                type="button"
                onClick={onUpload}
              >
                <Icon name="plus" size={17} /> Upload a file
              </button>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
