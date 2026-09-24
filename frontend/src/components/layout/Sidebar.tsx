import {
  Bell,
  FilePlus2,
  LayoutDashboard,
  Ticket,
  Users,
  Wrench,
  X,
} from "lucide-react";
import { useTranslation } from "react-i18next";
import { NavLink } from "react-router-dom";

import { cn } from "../../lib/cn";
import { useAuthStore } from "../../stores/auth.store";
import type { UserRole } from "../../types/api";
import { IconButton } from "../ui/Button";

interface NavItem {
  to: string;
  labelKey: string;
  icon: typeof Ticket;
  /** When set, only these roles see the entry. */
  roles?: UserRole[];
}

const navItems: NavItem[] = [
  { to: "/dashboard", labelKey: "nav.dashboard", icon: LayoutDashboard },
  // Staff work the queue; a plain user only ever sees their own tickets.
  {
    to: "/tickets",
    labelKey: "nav.tickets",
    icon: Ticket,
    roles: ["ADMIN", "IT_SUPPORT"],
  },
  {
    to: "/my-tickets",
    labelKey: "nav.myTickets",
    icon: FilePlus2,
    roles: ["USER"],
  },
  { to: "/notifications", labelKey: "nav.notifications", icon: Bell },
  { to: "/users", labelKey: "nav.users", icon: Users, roles: ["ADMIN"] },
];

export const SidebarBrand = () => {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2.5">
      <span
        className="flex size-8 shrink-0 items-center justify-center border border-primary text-primary"
        aria-hidden
      >
        <Wrench className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="truncate font-heading text-[20px] leading-none text-main">
          {t("app.name")}
        </p>
        <p className="kicker truncate">{t("app.tagline")}</p>
      </div>
    </div>
  );
};

const NavItems = ({ onNavigate }: { onNavigate?: () => void }) => {
  const { t } = useTranslation();
  const hasRole = useAuthStore((state) => state.hasRole);

  return (
    <nav className="flex flex-col py-2" aria-label={t("nav.menu")}>
      {navItems
        .filter((item) => !item.roles || hasRole(...item.roles))
        .map(({ to, labelKey, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 border-l-2 px-3 py-2 text-sm transition-colors",
                isActive
                  ? "border-primary bg-primary-soft text-main"
                  : "border-transparent text-muted hover:bg-hover hover:text-main",
              )
            }
          >
            <Icon className="size-[18px] shrink-0" aria-hidden />
            <span className="truncate">{t(labelKey)}</span>
          </NavLink>
        ))}
    </nav>
  );
};

/** Fixed rail on desktop. */
export const Sidebar = () => (
  <aside className="hidden w-60 shrink-0 flex-col border-r border-border bg-surface lg:flex">
    <div className="flex h-16 items-center border-b border-border px-4">
      <SidebarBrand />
    </div>
    <div className="flex-1 overflow-y-auto scrollbar-slim">
      <NavItems />
    </div>
  </aside>
);

/** Slide-over drawer on mobile and tablet. */
export const MobileSidebar = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="relative flex h-full w-72 max-w-[85%] flex-col border-r border-border bg-surface shadow-lg">
        <div className="flex h-16 items-center justify-between gap-2 border-b border-border px-4">
          <SidebarBrand />
          <IconButton label={t("nav.closeMenu")} onClick={onClose}>
            <X className="size-4" />
          </IconButton>
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-slim">
          <NavItems onNavigate={onClose} />
        </div>
      </aside>
    </div>
  );
};
