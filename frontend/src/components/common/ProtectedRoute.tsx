import { ShieldAlert } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Navigate, useLocation } from "react-router-dom";

import { useAuthStore } from "../../stores/auth.store";
import type { UserRole } from "../../types/api";
import { Card } from "../ui/Card";
import { EmptyState } from "../ui/States";

/** Sends unauthenticated visitors to the sign-in page. */
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
};

/** Renders a friendly "no access" card instead of a blank page. */
export const RoleGuard = ({
  roles,
  children,
}: {
  roles: UserRole[];
  children: ReactNode;
}) => {
  const { t } = useTranslation();
  const hasRole = useAuthStore((state) => state.hasRole);

  if (!hasRole(...roles)) {
    return (
      <Card>
        <EmptyState
          icon={<ShieldAlert className="size-5" />}
          title={t("errors.forbiddenTitle")}
          body={t("errors.forbiddenBody")}
        />
      </Card>
    );
  }
  return <>{children}</>;
};
