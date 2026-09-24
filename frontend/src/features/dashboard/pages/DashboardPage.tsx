import { RefreshCw } from "lucide-react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "../../../components/common/PageHeader";
import { Button } from "../../../components/ui/Button";
import {
  Card,
  CardHeader,
  StatCard,
  StatCell,
  StatStrip,
} from "../../../components/ui/Card";
import { ErrorState, LoadingBlock } from "../../../components/ui/States";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { dashboardApi } from "../../../lib/api/endpoints";
import { cn } from "../../../lib/cn";
import { useAuthStore } from "../../../stores/auth.store";
import type { DashboardStats, TicketStatus } from "../../../types/api";

/** Horizontal bar: label, count, and share of the total. */
const BreakdownRow = ({
  label,
  value,
  total,
  barClass,
}: {
  label: string;
  value: number;
  total: number;
  barClass: string;
}) => {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <span className="w-28 shrink-0 truncate text-sm text-muted sm:w-36">
        {label}
      </span>
      <div className="h-2 flex-1 overflow-hidden bg-hover">
        <div
          className={cn("h-full transition-all", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-heading text-[15px] tabular-nums text-main">
        {value}
      </span>
    </div>
  );
};

const statusRows: {
  status: TicketStatus;
  key: keyof DashboardStats["tickets"];
}[] = [
  { status: "OPEN", key: "open" },
  { status: "ASSIGNED", key: "assigned" },
  { status: "IN_PROGRESS", key: "in_progress" },
  { status: "WAITING_FOR_USER", key: "waiting_for_user" },
  { status: "RESOLVED", key: "resolved" },
  { status: "CLOSED", key: "closed" },
  { status: "CANCELLED", key: "cancelled" },
];

/** In-palette bars: accent for live work, grey once the ticket is done. */
const statusBar: Record<TicketStatus, string> = {
  OPEN: "bg-[var(--color-accent-300)]",
  ASSIGNED: "bg-primary",
  IN_PROGRESS: "bg-primary",
  WAITING_FOR_USER: "bg-[var(--color-accent-2)]",
  RESOLVED: "bg-[var(--color-accent-600)]",
  CLOSED: "bg-border-strong",
  CANCELLED: "bg-border-strong",
};

const DashboardPage = () => {
  const { t } = useTranslation();
  const user = useAuthStore((state) => state.user);

  const { data, isLoading, error, reload } = useApiRequest(dashboardApi.stats);

  return (
    <>
      <PageHeader
        kicker={user ? t(`role.${user.role}`) : undefined}
        title={t("dashboard.title")}
        subtitle={user ? t("auth.welcome", { name: user.firstName }) : undefined}
        action={
          <Button
            variant="secondary"
            onClick={reload}
            icon={<RefreshCw className="size-4" />}
          >
            {t("common.refresh")}
          </Button>
        }
      />

      {isLoading && (
        <Card>
          <LoadingBlock />
        </Card>
      )}

      {!isLoading && error && (
        <Card>
          <ErrorState message={error} onRetry={reload} />
        </Card>
      )}

      {!isLoading && !error && data && (
        <div className="flex flex-col gap-5">
          <StatStrip>
            <StatCell>
              <StatCard
                label={t("dashboard.totalTickets")}
                value={data.tickets.total}
                hint={`${t("status.OPEN")}: ${data.tickets.open}`}
              />
            </StatCell>
            <StatCell>
              <StatCard
                label={t("dashboard.openTickets")}
                value={data.tickets.open}
                hint={`${t("status.ASSIGNED")}: ${data.tickets.assigned}`}
              />
            </StatCell>
            <StatCell>
              <StatCard
                label={t("dashboard.inProgress")}
                value={data.tickets.in_progress}
                hint={`${t("status.WAITING_FOR_USER")}: ${
                  data.tickets.waiting_for_user
                }`}
              />
            </StatCell>
            <StatCell>
              <StatCard
                label={t("dashboard.resolved")}
                value={data.tickets.resolved}
                hint={`${t("status.CLOSED")}: ${data.tickets.closed}`}
              />
            </StatCell>
          </StatStrip>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader
                title={t("dashboard.byStatus")}
                action={
                  <span className="text-xs text-muted">
                    {data.tickets.total} {t("common.results")}
                  </span>
                }
              />
              <div className="flex flex-col gap-3 p-4">
                {statusRows.map(({ status, key }) => (
                  <BreakdownRow
                    key={status}
                    label={t(`status.${status}`)}
                    value={data.tickets[key]}
                    total={data.tickets.total}
                    barClass={statusBar[status]}
                  />
                ))}
              </div>
            </Card>

            <div className="flex flex-col gap-5">
              <Card>
                <CardHeader title={t("dashboard.byPriority")} />
                <div className="flex flex-col gap-3 p-4">
                  <BreakdownRow
                    label={t("priority.HIGH")}
                    value={data.priority.high}
                    total={data.tickets.total}
                    barClass="bg-primary"
                  />
                  <BreakdownRow
                    label={t("priority.MEDIUM")}
                    value={data.priority.medium}
                    total={data.tickets.total}
                    barClass="bg-[var(--color-accent-2)]"
                  />
                  <BreakdownRow
                    label={t("priority.LOW")}
                    value={data.priority.low}
                    total={data.tickets.total}
                    barClass="bg-border-strong"
                  />
                </div>
              </Card>

              <Card>
                <CardHeader title={t("dashboard.userBreakdown")} />
                <div className="grid grid-cols-3">
                  <div className="border-r border-border">
                    <StatCard
                      label={t("dashboard.totalUsers")}
                      value={data.users.total}
                    />
                  </div>
                  <div className="border-r border-border">
                    <StatCard
                      label={t("dashboard.activeUsers")}
                      value={data.users.active}
                    />
                  </div>
                  <StatCard
                    label={t("dashboard.inactiveUsers")}
                    value={data.users.inactive}
                  />
                </div>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DashboardPage;
