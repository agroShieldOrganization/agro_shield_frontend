import { Navigate, Outlet } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function PublicOnlyRoute() {
  const { isAuthenticated, isBootstrappingAuth } = useAuth();

  if (isBootstrappingAuth) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
        <div className="flex items-center gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 px-5 py-4 text-sm text-slate-300 backdrop-blur-sm">
          <LoaderCircle className="h-4 w-4 animate-spin text-emerald-400" />
          <span>Checking your session...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
