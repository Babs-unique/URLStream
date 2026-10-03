import { createBrowserRouter, Navigate } from "react-router-dom";
import LandingScreen from "./screens/LandingScreen";
import LoginScreen from "./screens/auth/LoginScreen";
import SignupScreen from "./screens/auth/SignupScreen";
import WorkspaceScreen from "./screens/WorkspaceScreen";
import ProtectedRoute from "./features/auth/ProtectedRoute";

export const router = createBrowserRouter([
  { path: "/", Component: LandingScreen },
  {
    element: <ProtectedRoute />,
    children: [{ path: "/workspace", Component: WorkspaceScreen }],
  },
  { path: "/login", Component: LoginScreen },
  { path: "/register", Component: SignupScreen },
  { path: "*", element: <Navigate to="/" replace /> },
]);
