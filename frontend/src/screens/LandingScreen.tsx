import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Brand from "../components/Brand";
import Icon from "../components/Icon";

const primaryLink =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-lg bg-[var(--accent)] px-5 text-sm font-semibold text-[var(--bg)] transition hover:bg-[var(--accent-hover)] motion-safe:hover:-translate-y-0.5";
const secondaryLink =
  "inline-flex min-h-12 items-center justify-center gap-3 rounded-lg border border-[var(--line)] bg-[var(--surface)] px-5 text-sm font-medium text-[var(--text)] transition hover:bg-[var(--hover)]";

export default function LandingScreen() {
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("urlstream-theme") === "dark" ? "dark" : "light",
  );
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    document.title = "URLStream · A little less clutter. A lot more flow.";
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("urlstream-theme", theme);
  }, [theme]);
  useEffect(() => {
    const closeMenu = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", closeMenu);
    return () => window.removeEventListener("keydown", closeMenu);
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)]">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-[var(--surface)] focus:p-4"
      >
        Skip to content
      </a>
      <header className="relative z-20 border-b border-[var(--line)]">
        <div className="mx-auto flex h-22 max-w-7xl items-center justify-between gap-4 px-5 sm:px-8 lg:px-12">
          <Brand
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <nav
            aria-label="Main navigation"
            className="hidden items-center gap-8 text-[13px] text-[var(--sub)] md:flex"
          >
            <a className="transition hover:text-[var(--text)]" href="#features">
              Features
            </a>
            <a
              className="transition hover:text-[var(--text)]"
              href="#how-it-works"
            >
              How it works
            </a>
            <a
              className="transition hover:text-[var(--text)]"
              href="#the-details"
            >
              The details
            </a>
          </nav>
          <div className="flex items-center gap-3 sm:gap-5">
            <button
              className="icon-button"
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
              <Icon name={theme === "light" ? "moon" : "sun"} size={18} />
            </button>
            <Link
              className="hidden text-[13px] font-medium sm:block"
              to="/login"
            >
              Sign in
            </Link>
            <Link
              className="hidden min-h-10 items-center gap-2 rounded-lg bg-[var(--text)] px-4 text-xs font-medium text-[var(--bg)] transition hover:opacity-80 sm:inline-flex"
              to="/register"
            >
              Get started <Icon name="arrow" size={15} />
            </Link>
            <button
              className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-[var(--sub)] hover:bg-[var(--hover)] md:hidden"
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={menuOpen}
              aria-controls="landing-menu"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </button>
          </div>
        </div>
        {menuOpen && (
          <nav
            id="landing-menu"
            aria-label="Mobile navigation"
            className="absolute inset-x-0 top-full grid gap-5 border-b border-[var(--line)] bg-[var(--surface)] p-6 text-sm shadow-lg md:hidden"
          >
            {[
              ["Features", "#features"],
              ["How it works", "#how-it-works"],
              ["The details", "#the-details"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenuOpen(false)}>
                {label}
              </a>
            ))}
            <div className="flex gap-4 border-t border-[var(--line)] pt-4">
              <Link className={secondaryLink} to="/login">
                Sign in
              </Link>
              <Link className={primaryLink} to="/register">
                Get started
              </Link>
            </div>
          </nav>
        )}
      </header>

      <main id="main">
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[1fr_1.05fr] lg:gap-12 lg:px-12 lg:py-24">
          <div>
            <span className="mb-7 inline-flex items-center gap-2.5 rounded-full border border-[var(--line)] bg-[var(--soft)] px-3 py-1.5 text-[11px] font-medium text-[var(--sub)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" />{" "}
              LESS FRICTION. MORE FLOW.
            </span>
            <h1 className="max-w-xl text-[clamp(2.8rem,5.1vw,4.25rem)] leading-[1.08] font-medium tracking-[-0.035em]">
              Your files.
              <br />
              Your space.
              <br />
              <span className="text-[var(--accent)]">In full flow.</span>
            </h1>
            <p className="mt-6 max-w-sm text-[15px] leading-7 text-[var(--sub)]">
              A calmer place for your documents, images, and media. Upload,
              find, preview, and download — without the extra noise.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link className={primaryLink} to="/register">
                Get started <Icon name="arrow" size={17} />
              </Link>
              <Link className={secondaryLink} to="/workspace">
                <Icon name="play" size={15} /> Open your workspace
              </Link>
            </div>
            <p className="mt-4 text-[11px] leading-5 text-[var(--sub)]">
              Create an account to store and manage your files.
            </p>
          </div>
          <div
            className="relative min-w-0 rounded-2xl border border-[var(--line)] bg-[var(--soft)] p-4 sm:p-7 lg:py-10"
            aria-label="Illustration of the URLStream file workspace"
          >
            <div className="mb-5 flex items-center justify-between text-[10px] font-medium tracking-[0.12em] text-[var(--sub)]">
              <span>A PLACE FOR EVERYTHING</span>
              <span>01 / WORKSPACE</span>
            </div>
            <div className="overflow-hidden rounded-xl border border-[var(--line)] bg-[var(--surface)] shadow-[var(--shadow)]">
              <div className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3">
                <div className="flex gap-1.5" aria-hidden="true">
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                  <span className="h-1.5 w-1.5 rounded-full bg-[var(--line)]" />
                </div>
                <span className="text-[9px] text-[var(--sub)]">
                  Your personal workspace
                </span>
                <Icon name="shield" size={12} />
              </div>
              <div className="p-5 sm:p-6">
                <div className="mb-5 flex items-center justify-between">
                  <div>
                    <p className="mb-1 text-[9px] text-[var(--sub)]">
                      EVERYTHING, IN ONE PLACE
                    </p>
                    <h2 className="text-lg font-semibold">
                      My Files<span className="text-[var(--accent)]">.</span>
                    </h2>
                  </div>
                  <span className="rounded-md bg-[var(--accent-soft)] p-2 text-[var(--accent)]">
                    <Icon name="upload" size={16} />
                  </span>
                </div>
                <div className="mb-4 flex items-center gap-3 rounded-lg border border-dashed border-[var(--line)] bg-[var(--soft)] px-4 py-5">
                  <span className="text-[var(--accent)]">
                    <Icon name="upload" size={22} />
                  </span>
                  <div>
                    <p className="text-xs font-medium">
                      A new home for your files
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--sub)]">
                      One file at a time. Up to 100 MB.
                    </p>
                  </div>
                </div>
                <div className="grid min-h-40 place-items-center rounded-lg border border-[var(--line)] bg-[var(--soft)] px-5 text-center">
                  <div>
                    <Icon name="folder" size={24} />
                    <p className="mt-3 text-xs font-medium">
                      Your account files appear here
                    </p>
                    <p className="mt-1 text-[10px] text-[var(--sub)]">
                      Upload documents, images, audio, or video.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative -mt-2 ml-6 flex items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:ml-16">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]">
                <Icon name="shield" size={18} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[11px] font-medium">
                  Your files, in one place
                </p>
                <p className="mt-1 text-[9px] text-[var(--sub)]">
                  Stored with your account
                </p>
              </div>
            </div>
            <p className="mt-5 text-center text-[9px] tracking-[0.02em] text-[var(--sub)]">
              Workspace overview
            </p>
          </div>
        </section>

        <div className="border-y border-[var(--line)] bg-[var(--soft)]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-8 gap-y-5 px-5 py-6 sm:px-8 lg:px-12">
            <span className="text-[10px] font-medium tracking-[0.12em] text-[var(--sub)]">
              BIG IDEAS. EVERYDAY FILES.
            </span>
            <div className="flex flex-wrap gap-x-7 gap-y-4 text-xs text-[var(--sub)]">
              {(["pdf", "image", "video", "audio"] as const).map(
                (kind, index) => (
                  <span key={kind} className="inline-flex items-center gap-2">
                    <Icon name={kind} size={16} />
                    {["Documents", "Images", "Video", "Audio"][index]}
                  </span>
                ),
              )}
            </div>
          </div>
        </div>

        <section
          id="features"
          className="mx-auto max-w-7xl scroll-mt-8 px-5 py-16 sm:px-8 sm:py-20 lg:px-12"
        >
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)]">
                JUST THE ESSENTIALS
              </p>
              <h2 className="text-3xl leading-tight font-medium sm:text-4xl">
                Everything you need.
                <br />
                Nothing in your way.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-6 text-[var(--sub)]">
              Less time managing files.
              <br />
              More time doing something with them.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-3">
            {(
              [
                [
                  "upload",
                  "01",
                  "Bring it all together.",
                  "Upload a document, image, or media file with clear progress and storage usage. One file per upload, up to 100 MB.",
                  "Upload without the guesswork",
                ],
                [
                  "play",
                  "02",
                  "Look before you download.",
                  "Preview your uploaded images and PDFs, or play supported audio and video right in your workspace.",
                  "Stay in your flow",
                ],
                [
                  "search",
                  "03",
                  "Find it. Make it yours.",
                  "Search by name, sort your list, inspect file details, and download or delete with a few simple clicks.",
                  "A little less searching",
                ],
              ] as const
            ).map(([icon, number, title, description, caption]) => (
              <article
                key={number}
                className="flex flex-col rounded-xl border border-[var(--line)] bg-[var(--surface)] p-7"
              >
                <div className="mb-9 flex items-center justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-[var(--accent-soft)] text-[var(--accent)]">
                    <Icon name={icon} size={21} />
                  </span>
                  <span className="text-[10px] text-[var(--faint)]">
                    {number}
                  </span>
                </div>
                <h3 className="mb-3 text-lg font-medium">{title}</h3>
                <p className="flex-1 text-[13px] leading-6 text-[var(--sub)]">
                  {description}
                </p>
                <p className="mt-7 border-t border-[var(--line)] pt-4 text-[10px] text-[var(--sub)]">
                  {caption}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-8 border-y border-[var(--line)] bg-[var(--soft)]"
        >
          <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 sm:px-8 sm:py-20 lg:grid-cols-[.85fr_1.15fr] lg:gap-20 lg:px-12">
            <div>
              <p className="mb-4 text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)]">
                A SIMPLER ROUTINE
              </p>
              <h2 className="text-3xl font-medium sm:text-4xl">
                From upload
                <br />
                to underway.
              </h2>
              <Link
                className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-[var(--accent)]"
                to="/workspace"
              >
                Try the workflow <Icon name="arrow" size={17} />
              </Link>
            </div>
            <ol className="grid gap-7">
              {[
                [
                  "Choose your file",
                  "Drop a file into your workspace or select it from your device.",
                ],
                [
                  "See the bigger picture",
                  "Check file details, preview supported formats, and keep an eye on your quota.",
                ],
                [
                  "Pick up where you need it",
                  "Download your file, or clear some space with a confirmed delete.",
                ],
              ].map(([title, description], index) => (
                <li className="flex gap-5" key={title}>
                  <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-[var(--line)] text-[11px] text-[var(--accent)]">
                    0{index + 1}
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold">{title}</h3>
                    <p className="mt-2 text-[13px] leading-6 text-[var(--sub)]">
                      {description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section
          id="the-details"
          className="mx-auto grid max-w-7xl scroll-mt-8 gap-8 px-5 py-16 sm:px-8 lg:grid-cols-2 lg:gap-20 lg:px-12"
        >
          <div>
            <p className="mb-4 text-[10px] font-semibold tracking-[0.14em] text-[var(--accent)]">
              SMALL PRINT. CLEAR EXPECTATIONS.
            </p>
            <h2 className="text-2xl font-medium">
              Simple by design.
              <br />
              Transparent by default.
            </h2>
            <p className="mt-4 max-w-sm text-[13px] leading-6 text-[var(--sub)]">
              URLStream stores your files with your account and lets you manage
              and download them from your workspace.
            </p>
          </div>
          <div className="divide-y divide-[var(--line)]">
            {[
              [
                "What can I upload?",
                "One file per request, up to 100 MB. Supported types include common images, documents, audio, and video. Your account quota is shown in the workspace.",
              ],
              [
                "Are my files stored online?",
                "Files are stored on the URLStream server and associated with your account. Sign in to browse, preview supported formats, and download them.",
              ],
              [
                "Is authentication and streaming live?",
                "Yes. Sign-in uses an HTTP-only session cookie. File operations require authentication, and downloads support HTTP byte ranges.",
              ],
            ].map(([question, answer]) => (
              <details key={question} className="group py-5 first:pt-0">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium [&::-webkit-details-marker]:hidden">
                  {question}
                  <span className="shrink-0 text-[var(--sub)] transition-transform group-open:rotate-45">
                    <Icon name="plus" size={17} />
                  </span>
                </summary>
                <p className="mt-3 pr-6 text-[13px] leading-6 text-[var(--sub)]">
                  {answer}
                </p>
              </details>
            ))}
          </div>
        </section>

        <section className="mx-auto mb-16 max-w-7xl px-5 sm:px-8 lg:px-12">
          <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-[var(--line)] bg-[var(--accent-soft)] p-7 sm:p-10 md:flex-row md:items-center">
            <div>
              <p className="mb-3 text-[10px] font-semibold tracking-[0.14em] text-[var(--accent-text)]">
                MAKE A LITTLE SPACE
              </p>
              <h2 className="text-2xl font-medium sm:text-3xl">
                Less clutter. More possibility.
              </h2>
              <p className="mt-3 text-[13px] text-[var(--sub)]">
                Your next file has a place here.
              </p>
            </div>
            <Link className={`${primaryLink} shrink-0`} to="/workspace">
              Open your workspace <Icon name="arrow" size={17} />
            </Link>
          </div>
        </section>
      </main>
      <footer className="border-t border-[var(--line)]">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-6 px-5 py-8 sm:px-8 lg:px-12">
          <Brand
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          />
          <p className="text-[10px] text-[var(--sub)]">
            © {new Date().getFullYear()} URLStream · A little less noise.
          </p>
          <div className="flex gap-5 text-xs text-[var(--sub)]">
            <Link to="/login">Sign in</Link>
            <Link to="/workspace">
              Open workspace <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
