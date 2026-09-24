import { useTranslation } from "react-i18next";

import { cn } from "../../lib/cn";
import type { TicketPriority, TicketStatus, UserRole } from "../../types/api";

/** Square, compact tags — the template's .tag. */
const base =
  "inline-flex items-center rounded-none px-2 py-0.5 text-[11px] tracking-[0.02em] whitespace-nowrap";

/**
 * The template keeps tags monochrome: outlined for new work, filled for
 * work in flight, flat grey once the ticket is finished.
 */
const statusTone: Record<TicketStatus, string> = {
  OPEN: "border border-primary text-primary",
  ASSIGNED: "bg-tag-active text-tag-active-fg",
  IN_PROGRESS: "bg-tag-active text-tag-active-fg",
  WAITING_FOR_USER: "border border-border-strong text-muted",
  RESOLVED: "bg-tag-done text-tag-done-fg",
  CLOSED: "bg-tag-done text-tag-done-fg",
  CANCELLED: "bg-tag-done text-tag-done-fg",
};

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const { t } = useTranslation();
  return (
    <span className={cn(base, statusTone[status] ?? statusTone.OPEN)}>
      {t(`status.${status}`, status)}
    </span>
  );
};

const priorityLevel: Record<TicketPriority, number> = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4,
};

/** Signal bars, as the template shows priority. */
const SignalBars = ({ level }: { level: number }) => (
  <span className="flex items-end gap-[2px]" aria-hidden>
    {[1, 2, 3, 4].map((bar) => (
      <span
        key={bar}
        className={cn(
          "w-[3px]",
          bar <= level ? "bg-primary" : "bg-border-strong opacity-40",
        )}
        style={{ height: `${3 + bar * 2}px` }}
      />
    ))}
  </span>
);

export const PriorityBadge = ({ priority }: { priority: TicketPriority }) => {
  const { t } = useTranslation();
  const level = priorityLevel[priority] ?? 2;

  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-[13px] text-main">
      <SignalBars level={level} />
      {t(`priority.${priority}`, priority)}
    </span>
  );
};

export const RoleBadge = ({ role }: { role: UserRole }) => {
  const { t } = useTranslation();
  const tone =
    role === "ADMIN"
      ? "border border-primary text-primary"
      : role === "IT_SUPPORT"
        ? "bg-tag-active text-tag-active-fg"
        : "bg-tag-done text-tag-done-fg";

  return <span className={cn(base, tone)}>{t(`role.${role}`, role)}</span>;
};

export const ActiveBadge = ({ isActive }: { isActive: boolean }) => {
  const { t } = useTranslation();
  return (
    <span
      className={cn(
        base,
        isActive
          ? "border border-border-strong text-main"
          : "bg-tag-done text-tag-done-fg",
      )}
    >
      {isActive ? t("users.active") : t("users.inactive")}
    </span>
  );
};
