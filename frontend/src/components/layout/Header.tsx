import { Bell, LogOut, Menu } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";

import { notificationApi } from "../../lib/api/endpoints";
import { socket } from "../../lib/socket";
import { initialsOf } from "../../lib/format";
import { useAuthStore } from "../../stores/auth.store";
import { IconButton } from "../ui/Button";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { ThemeToggle } from "./ThemeToggle";

const UnreadBell = () => {
  const { t } = useTranslation();
  const [count, setCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = () =>
      notificationApi
        .unreadCount()
        .then((value) => {
          if (!cancelled) setCount(value);
        })
        // A failed badge should never break the header.
        .catch(() => undefined);

    // One fetch for the starting value, then the socket keeps it current.
    load();

    const onNew = () => setCount((previous) => previous + 1);
    // The list marks things read, so re-read the true count afterwards.
    const onRead = () => load();

    socket.on("notification:new", onNew);
    socket.on("connect", load);
    window.addEventListener("notifications:read", onRead);

    return () => {
      cancelled = true;
      socket.off("notification:new", onNew);
      socket.off("connect", load);
      window.removeEventListener("notifications:read", onRead);
    };
  }, []);

  return (
    <Link
      to="/notifications"
      aria-label={
        count > 0
          ? t("notifications.unread", { count })
          : t("nav.notifications")
      }
      className="relative flex size-9 items-center justify-center text-muted transition-colors hover:bg-hover hover:text-main"
    >
      <Bell className="size-[18px]" aria-hidden />
      {count > 0 && (
        <span className="absolute right-1 top-1.5 flex min-w-4 items-center justify-center bg-primary px-1 text-[10px] leading-4 text-primary-fg">
          {count > 99 ? "99+" : count}
        </span>
      )}
    </Link>
  );
};

const UserMenu = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const signOut = useAuthStore((state) => state.signOut);

  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [isOpen]);

  if (!user) return null;

  const handleSignOut = () => {
    signOut();
    socket.disconnect();
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        className="flex items-center gap-2 border border-transparent p-1 pr-2 transition-colors hover:border-border hover:bg-hover"
      >
        <span
          className="flex size-8 shrink-0 items-center justify-center border border-border bg-primary-soft font-heading text-[13px] text-primary"
          aria-hidden
        >
          {initialsOf(user.firstName, user.lastName)}
        </span>
        <span className="hidden text-left sm:block">
          <span className="block max-w-32 truncate text-sm font-medium leading-tight text-main">
            {user.firstName} {user.lastName}
          </span>
          <span className="block text-xs leading-tight text-muted">
            {t(`role.${user.role}`)}
          </span>
        </span>
      </button>

      {isOpen && (
        <div
          role="menu"
          className="absolute right-0 z-40 mt-1.5 w-56 overflow-hidden border border-border bg-app shadow-lg"
        >
          <div className="border-b border-border px-3 py-2.5">
            <p className="truncate text-sm font-medium text-main">
              {user.firstName} {user.lastName}
            </p>
            <p className="truncate text-xs text-muted">{user.email}</p>
          </div>
          <button
            role="menuitem"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-main transition-colors hover:bg-hover"
          >
            <LogOut className="size-4 text-muted" aria-hidden />
            {t("auth.signOut")}
          </button>
        </div>
      )}
    </div>
  );
};

export const Header = ({ onOpenMenu }: { onOpenMenu: () => void }) => {
  const { t } = useTranslation();

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-app/95 px-3 backdrop-blur sm:px-4">
      <IconButton
        label={t("nav.openMenu")}
        onClick={onOpenMenu}
        className="lg:hidden"
      >
        <Menu className="size-5" />
      </IconButton>

      <div className="ml-auto flex items-center gap-1.5 sm:gap-2">
        <LanguageSwitcher />
        <ThemeToggle />
        <UnreadBell />
        <div className="mx-1 hidden h-6 w-px bg-border sm:block" aria-hidden />
        <UserMenu />
      </div>
    </header>
  );
};
