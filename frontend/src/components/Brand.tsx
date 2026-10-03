type BrandProps = {
  onClick?: () => void;
};

export default function Brand({ onClick }: BrandProps) {
  return (
    <button
      className="brand"
      type="button"
      onClick={onClick}
      aria-label="URLStream home"
    >
      <span className="brand-mark" aria-hidden="true">
        <span className="mark-line mark-line-one" />
        <span className="mark-line mark-line-two" />
        <span className="mark-dot" />
      </span>
      <span>
        URL<span className="brand-light">Stream</span>
      </span>
    </button>
  );
}
