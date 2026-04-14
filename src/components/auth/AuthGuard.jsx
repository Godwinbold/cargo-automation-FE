import React from "react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuthContext } from "../../context/AuthContext";

const AuthGuard = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, user, loading, hasRole } = useAuthContext();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const airlineId = searchParams.get("airlineId");

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3DA5E0]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // If it's an executive route, redirect to executive-login
    if (location.pathname.startsWith("/executive")) {
      return <Navigate to="/executive-login" state={{ from: location }} replace />;
    }
    
    // Default to standard login, preserving airlineId if present
    const loginPath = airlineId ? `/login?airlineId=${airlineId}` : "/login";
    return <Navigate to={loginPath} state={{ from: location }} replace />;
  }

  // Check roles if allowedRoles is provided
  if (allowedRoles.length > 0) {
    const hasRequiredRole = allowedRoles.some((role) => hasRole(role));
    
    if (!hasRequiredRole) {
      // If user doesn't have the role, redirect to a safe place or show error
      // For now, redirect to home or login
      return <Navigate to="/" replace />;
    }
  }

  return children;
};

export default AuthGuard;
