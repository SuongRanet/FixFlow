import { Wrench } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Navigate, Outlet } from "react-router-dom";

import { LanguageSwitcher } from "../components/layout/LanguageSwitcher";
import { ThemeToggle } from "../components/layout/ThemeToggle";
import { useAuthStore } from "../stores/auth.store";

const AuthLayout = () => {
  const { t } = useTranslation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  // Someone already signed in has no business on the login screen.
  if (isAuthenticated()) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-app">
      <header className="flex items-center justify-between gap-3 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-2.5">
          <span
            className="flex size-8 items-center justify-center border border-primary text-primary"
            aria-hidden
          >
            <Wrench className="size-5" />
          </span>
          <div>
            <p className="font-heading text-[20px] leading-none text-main">{t("app.name")}</p>
            <p className="kicker">{t("app.tagline")}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-8 sm:px-6">
        <div className="w-full max-w-md">
          <Outlet />
        </div>
      </main>

      <footer className="px-4 py-6 text-center text-xs text-muted">
        {t("app.name")} · {t("app.tagline")}
      </footer>
    </div>
  );
};

export default AuthLayout;
