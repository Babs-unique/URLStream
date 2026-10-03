import FileLibrary from "../components/workspace/FileLibrary";
import type { FileLibraryProps } from "../components/workspace/FileLibrary";

type FilesScreenProps = Omit<
  FileLibraryProps,
  "title" | "description" | "onViewAll"
>;

export default function FilesScreen(props: FilesScreenProps) {
  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow intro-eyebrow">LIBRARY</div>
          <h1>My files</h1>
          <p>Everything you’ve uploaded, all in one place.</p>
        </div>
        <button
          className="btn btn-primary intro-upload"
          type="button"
          onClick={props.onUpload}
        >
          Upload files
        </button>
      </div>
      <FileLibrary
        {...props}
        title="All files"
        description="Browse and manage your uploaded files."
      />
    </>
  );
}
