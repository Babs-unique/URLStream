import { useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import Brand from "../Brand";
import Icon from "../Icon";
import type { WorkspaceNavItem, WorkspacePage } from "./types";

type WorkspaceLayoutProps = {
  page: WorkspacePage;
  navItems: WorkspaceNavItem[];
  userName: string;
  usedLabel: string;
  quotaLabel: string;
  percentage: number;
  theme: "light" | "dark";
  onNavigate: (page: WorkspacePage) => void;
  onToggleTheme: () => void;
  onSignOut: () => void;
  children: ReactNode;
};

export default function WorkspaceLayout({
  page,
  navItems,
  userName,
  usedLabel,
  quotaLabel,
  percentage,
  theme,
  onNavigate,
  onToggleTheme,
  onSignOut,
  children,
}: WorkspaceLayoutProps) {
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  function changePage(nextPage: WorkspacePage) {
    onNavigate(nextPage);
    setMobileOpen(false);
  }

  return (
    <>
      {mobileOpen && (
        <div className="mobile-backdrop" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-top">
          <Brand onClick={() => navigate("/")} />
          <button
            className="icon-button mobile-close"
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
          >
            <Icon name="close" />
          </button>
        </div>

        <div className="workspace-picker">
          <span className="workspace-avatar" aria-hidden="true">
            A
          </span>
          <span className="workspace-label">
            <strong>Personal space</strong>
            <small>Account storage</small>
          </span>
          <Icon name="chevron" size={15} />
        </div>

        <p className="nav-heading">WORKSPACE</p>
        <nav className="nav-list" aria-label="Workspace navigation">
          {navItems.map((item) => (
            <button
              key={item.name}
              type="button"
              className={`nav-item ${page === item.name ? "active" : ""}`}
              onClick={() => changePage(item.name)}
              aria-current={page === item.name ? "page" : undefined}
            >
              <Icon name={item.icon} size={19} />
              <span>{item.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-storage">
            <div className="sidebar-storage-head">
              <span>Storage</span>
              <span>{Math.round(percentage)}%</span>
            </div>
            <div
              className="progress-track"
              role="progressbar"
              aria-label="Storage used"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(percentage)}
            >
              <span style={{ width: `${percentage}%` }} />
            </div>
            <p>
              {usedLabel} of {quotaLabel} used
            </p>
          </div>

          <div className="sidebar-profile">
            <span className="profile-avatar" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </span>
            <span className="profile-copy">
              <strong>{userName}</strong>
              <small>Personal account</small>
            </span>
            <button
              className="profile-more"
              type="button"
              aria-label="Sign out"
              title="Sign out"
              onClick={onSignOut}
            >
              <Icon name="logout" size={17} />
            </button>
          </div>
        </div>
      </aside>

      <div className="main-shell">
        <header className="topbar">
          <div className="topbar-left">
            <button
              className="icon-button mobile-menu"
              type="button"
              aria-label="Open navigation"
              aria-expanded={mobileOpen}
              onClick={() => setMobileOpen(true)}
            >
              <Icon name="menu" />
            </button>
            <span className="breadcrumb-root">Workspace</span>
            <Icon name="chevron" size={14} />
            <span className="breadcrumb-current">{page}</span>
          </div>
          <div className="topbar-actions">
            <span className="topbar-status">
              <span /> Demo workspace
            </span>
            <span className="topbar-divider" />
            <button
              className="icon-button"
              type="button"
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              title="Toggle theme"
              onClick={onToggleTheme}
            >
              <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
            </button>
            <button
              className="topbar-avatar"
              type="button"
              aria-label="Open settings"
              title="Settings"
              onClick={() => changePage("Settings")}
            >
              {userName.charAt(0).toUpperCase()}
            </button>
          </div>
        </header>

        <main id="workspace-main" className="content">
          {children}
        </main>
      </div>
    </>
  );
}
