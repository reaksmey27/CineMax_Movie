import { Suspense } from "react";
import { Navigate, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getAuthRedirect } from "../../utils/authRedirect";
import AuthShell from "./AuthShell";

const AuthLayout = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleClose = () => {
    const { pathname = "/", search = "", hash = "" } =
      location.state?.backgroundLocation || {};
    navigate(`${pathname}${search}${hash}`, { replace: true });
  };

  if (loading) return null;
  if (user) return <Navigate to={getAuthRedirect(location.state)} replace />;

  return (
    <AuthShell onClose={handleClose}>
      <Suspense fallback={null}>
        <Outlet />
      </Suspense>
    </AuthShell>
  );
};

export default AuthLayout;
