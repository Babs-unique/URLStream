import Icon from "../Icon";
import type { FileKind } from "./types";

type FileIconProps = {
  kind: FileKind;
  large?: boolean;
};

export default function FileIcon({ kind, large = false }: FileIconProps) {
  return (
    <span
      className={`file-icon file-icon-${kind}${large ? " file-icon-large" : ""}`}
      aria-hidden="true"
    >
      <Icon name={kind} size={large ? 26 : 20} strokeWidth={1.7} />
    </span>
  );
}
