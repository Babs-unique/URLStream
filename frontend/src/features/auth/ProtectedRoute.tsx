import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { Navigate, Outlet } from "react-router-dom";
import { useGetCurrentUserQuery } from "./authApi";
import type { AppDispatch } from "../../app/store";
import { clearUser, setUser } from "./authSlice";

export default function ProtectedRoute() {
  const dispatch = useDispatch<AppDispatch>();
  const { data: user, isError, isLoading } = useGetCurrentUserQuery();

  useEffect(() => {
    if (user) dispatch(setUser(user));
    else if (isError) dispatch(clearUser());
  }, [dispatch, isError, user]);

  if (isLoading) {
    return (
      <main className="auth-page" role="status" aria-live="polite">
        <p className="auth-panel">Checking your session…</p>
      </main>
    );
  }

  if (isError || !user) return <Navigate to="/login" replace />;

  return <Outlet />;
}
