import { useState, type FormEvent } from "react";
import { apiErrorMessage } from "../api/api";
import Icon from "../components/Icon";
import { formatSize } from "../components/workspace/fileUtils";
import type { UpdateUserInput } from "../features/auth/types";

type SettingsScreenProps = {
  userName: string;
  email: string;
  quota: number;
  theme: "light" | "dark";
  onThemeChange: (theme: "light" | "dark") => void;
  onSignOut: () => void;
  onUpdateProfile: (profile: UpdateUserInput) => Promise<void>;
  isUpdatingProfile: boolean;
  onDeleteAccount: () => void;
};

export default function SettingsScreen({
  userName,
  email,
  quota,
  theme,
  onThemeChange,
  onSignOut,
  onUpdateProfile,
  isUpdatingProfile,
  onDeleteAccount,
}: SettingsScreenProps) {
  const [profileError, setProfileError] = useState<string | null>(null);

  async function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setProfileError(null);
    const formData = new FormData(event.currentTarget);

    try {
      await onUpdateProfile({
        name: String(formData.get("name") ?? ""),
        email: String(formData.get("email") ?? ""),
      });
    } catch (error) {
      setProfileError(apiErrorMessage(error));
    }
  }

  return (
    <>
      <div className="page-intro">
        <div>
          <div className="eyebrow intro-eyebrow">YOUR WORKSPACE</div>
          <h1>Settings</h1>
          <p>Make your space feel like yours.</p>
        </div>
      </div>

      <div className="settings-layout">
        <section className="settings-section" aria-labelledby="profile-title">
          <div className="settings-section-heading">
            <h2 id="profile-title">Profile</h2>
            <p>Your personal workspace details.</p>
          </div>
          <div className="settings-row">
            <span className="settings-user-avatar" aria-hidden="true">
              {userName.charAt(0).toUpperCase()}
            </span>
            <div>
              <strong>{userName}</strong>
              <span>{email}</span>
            </div>
          </div>
          <form className="settings-profile-form" onSubmit={submitProfile}>
            <label>
              Full name
              <input
                name="name"
                type="text"
                defaultValue={userName}
                minLength={2}
                autoComplete="name"
                required
              />
            </label>
            <label>
              Email address
              <input
                name="email"
                type="email"
                defaultValue={email}
                autoComplete="email"
                required
              />
            </label>
            {profileError && <p role="alert">{profileError}</p>}
            <button
              className="btn btn-secondary"
              type="submit"
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving..." : "Save profile"}
            </button>
          </form>
          <div className="settings-data-row">
            <span>Storage quota</span>
            <strong>{formatSize(quota)}</strong>
          </div>
        </section>

        <section
          className="settings-section"
          aria-labelledby="account-delete-title"
        >
          <div className="settings-section-heading">
            <h2 id="account-delete-title">Delete account</h2>
            <p>Remove your account and stored file records.</p>
          </div>
          <div className="demo-note">
            <span>Account deletion cannot be undone.</span>
            <button
              type="button"
              className="btn btn-danger-text"
              onClick={() => {
                if (
                  window.confirm(
                    "Delete your account and all stored files? This cannot be undone.",
                  )
                ) {
                  onDeleteAccount();
                }
              }}
            >
              Delete account
            </button>
          </div>
        </section>

        <section
          className="settings-section"
          aria-labelledby="appearance-title"
        >
          <div className="settings-section-heading">
            <h2 id="appearance-title">Appearance</h2>
            <p>Choose how URLStream looks on your device.</p>
          </div>
          <div className="theme-options">
            <button
              type="button"
              className={
                theme === "light" ? "theme-choice chosen" : "theme-choice"
              }
              aria-pressed={theme === "light"}
              onClick={() => onThemeChange("light")}
            >
              <Icon name="sun" size={20} />
              <span>Light</span>
              {theme === "light" && <Icon name="check" size={16} />}
            </button>
            <button
              type="button"
              className={
                theme === "dark" ? "theme-choice chosen" : "theme-choice"
              }
              aria-pressed={theme === "dark"}
              onClick={() => onThemeChange("dark")}
            >
              <Icon name="moon" size={20} />
              <span>Dark</span>
              {theme === "dark" && <Icon name="check" size={16} />}
            </button>
          </div>
        </section>

        <section className="settings-section" aria-labelledby="preview-title">
          <div className="settings-section-heading">
            <h2 id="preview-title">Account storage</h2>
            <p>Your files belong to your URLStream account.</p>
          </div>
          <div className="demo-note">
            <Icon name="info" size={19} />
            <span>
              Files are stored on the URLStream server. Your appearance
              preference is saved in this browser.
            </span>
          </div>
        </section>

        <button
          type="button"
          className="btn btn-secondary signout-button"
          onClick={onSignOut}
        >
          <Icon name="logout" size={17} /> Sign out
        </button>
      </div>
    </>
  );
}
