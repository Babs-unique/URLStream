import { useEffect, useState, type FormEvent } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { apiErrorMessage } from "../../api/api";
import {
  useLoginMutation,
  useRegisterMutation,
} from "../../features/auth/authApi";
import type { AppDispatch } from "../../app/store";
import Brand from "../../components/Brand";
import Icon from "../../components/Icon";
import { setUser } from "../../features/auth/authSlice";

type AuthMode = "login" | "register";

type AuthScreenProps = {
  mode: AuthMode;
};

export default function AuthScreen({ mode }: AuthScreenProps) {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [theme, setTheme] = useState<"light" | "dark">(() =>
    localStorage.getItem("urlstream-theme") === "dark" ? "dark" : "light",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [login, { isLoading: isLoggingIn }] = useLoginMutation();
  const [register, { isLoading: isRegistering }] = useRegisterMutation();
  const isRegistration = mode === "register";
  const isSubmitting = isLoggingIn || isRegistering;

  useEffect(() => {
    document.title = `${isRegistration ? "Create account" : "Sign in"} · URLStream`;
  }, [isRegistration]);

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("urlstream-theme", nextTheme);
  }

  async function submitAuth(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") || "");
    const password = String(formData.get("password") || "");
    setSubmitError(null);

    try {
      if (isRegistration) {
        await register({
          name: String(formData.get("name") || ""),
          email,
          password,
        }).unwrap();
      }

      const user = await login({ email, password }).unwrap();
      dispatch(setUser(user));
      navigate("/workspace");
    } catch (error) {
      setSubmitError(apiErrorMessage(error));
    }
  }

  return (
    <div className="auth-page">
      <header className="auth-top">
        <Brand onClick={() => navigate("/")} />
        <button
          className="icon-button"
          type="button"
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
          onClick={toggleTheme}
        >
          <Icon name={theme === "dark" ? "sun" : "moon"} size={19} />
        </button>
      </header>

      <main className="auth-panel">
        <div className="auth-symbol" aria-hidden="true">
          <span className="brand-mark">
            <span className="mark-line mark-line-one" />
            <span className="mark-line mark-line-two" />
            <span className="mark-dot" />
          </span>
        </div>
        <p className="eyebrow">YOUR SPACE FOR WHAT MATTERS</p>
        <h1>{isRegistration ? "Create your account" : "Welcome back"}</h1>
        <p className="auth-subtitle">
          {isRegistration
            ? "A simpler way to store, manage, and stream your files."
            : "Sign in to access your files and pick up where you left off."}
        </p>

        <form onSubmit={submitAuth} className="auth-form">
          {isRegistration && (
            <label>
              Full name
              <input
                name="name"
                type="text"
                placeholder="Your full name"
                autoComplete="name"
                required
              />
            </label>
          )}
          <label>
            Email address
            <input
              name="email"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Password
            <span className="password-wrap">
              <input
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                autoComplete={
                  isRegistration ? "new-password" : "current-password"
                }
                minLength={6}
                required
              />
              <button
                type="button"
                className="show-password"
                aria-pressed={showPassword}
                onClick={() => setShowPassword((visible) => !visible)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </span>
          </label>
          {submitError && (
            <p className="auth-subtitle" role="alert">
              {submitError}
            </p>
          )}
          <button
            type="submit"
            className="btn btn-primary auth-submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Please wait..."
              : isRegistration
                ? "Create account"
                : "Sign in"}
            <Icon name="arrow" size={18} />
          </button>
        </form>

        <p className="auth-switch">
          {isRegistration
            ? "Already have an account?"
            : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => navigate(isRegistration ? "/login" : "/register")}
          >
            {isRegistration ? "Sign in" : "Create an account"}
          </button>
        </p>
        <p className="auth-disclaimer">
          Your session is maintained with an HTTP-only cookie.
        </p>
      </main>

      <footer className="auth-footer">
        © 2026 URLStream <span>Private by design.</span>
      </footer>
    </div>
  );
}
