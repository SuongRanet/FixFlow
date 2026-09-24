import {
  ArrowLeft,
  Building2,
  CalendarClock,
  RefreshCw,
  Tag,
  UserCheck,
  UserPlus,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Link, useNavigate, useParams } from "react-router-dom";

import { PriorityBadge, StatusBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, CardHeader } from "../../../components/ui/Card";
import {
  EmptyState,
  ErrorState,
  LoadingBlock,
} from "../../../components/ui/States";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { ticketApi } from "../../../lib/api/endpoints";
import { formatDateTime } from "../../../lib/format";
import { useAuthStore } from "../../../stores/auth.store";
import {
  AssignTicketModal,
  UpdateStatusModal,
} from "../components/TicketActionModals";
import { TicketAttachments } from "../components/TicketAttachments";
import { TicketComments } from "../components/TicketComments";

const MetaRow = ({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: ReactNode;
}) => (
  <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
    <span className="mt-0.5 text-muted" aria-hidden>
      {icon}
    </span>
    <div className="min-w-0">
      <p className="text-xs text-muted">{label}</p>
      <p className="truncate text-sm font-medium text-main">{value}</p>
    </div>
  </div>
);

const TicketDetailPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const ticketId = Number(id);

  const hasRole = useAuthStore((state) => state.hasRole);
  const canManage = hasRole("ADMIN", "IT_SUPPORT");

  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [isStatusOpen, setIsStatusOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);

  const { data, isLoading, error, reload } = useApiRequest(
    () => ticketApi.getById(ticketId),
    [ticketId],
  );

  const claim = async () => {
    setIsClaiming(true);
    try {
      await ticketApi.assignToMe(ticketId);
      reload();
    } catch {
      // The banner below already covers load failures; a failed claim
      // simply leaves the ticket as it was.
    } finally {
      setIsClaiming(false);
    }
  };

  if (!Number.isInteger(ticketId) || ticketId < 1) {
    return (
      <Card>
        <EmptyState
          title={t("tickets.notFound")}
          action={
            <Button variant="secondary" size="sm" onClick={() => navigate("/tickets")}>
              {t("common.back")}
            </Button>
          }
        />
      </Card>
    );
  }

  return (
    <>
      <div className="mb-4">
        <Link
          to="/tickets"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-main"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t("tickets.title")}
        </Link>
      </div>

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

      {!isLoading && !error && !data && (
        <Card>
          <EmptyState title={t("tickets.notFound")} />
        </Card>
      )}

      {!isLoading && !error && data && (
        <div className="flex flex-col gap-4 lg:flex-row lg:gap-5">
          <div className="flex min-w-0 flex-1 flex-col gap-4 sm:gap-5">
            <Card>
              <div className="flex flex-col gap-3 border-b border-border px-4 py-4 sm:px-5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-heading text-[15px] text-primary">
                    {data.ticket_code}
                  </span>
                  <StatusBadge status={data.status} />
                  <PriorityBadge priority={data.priority} />
                </div>
                <h1 className="font-heading text-[22px] text-main sm:text-[26px]">
                  {data.title}
                </h1>
              </div>

              <div className="px-4 py-4 sm:px-5">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-main">
                  {data.description}
                </p>
              </div>
            </Card>

            <TicketComments ticketId={ticketId} />
            <TicketAttachments ticketId={ticketId} />
          </div>

          <div className="flex w-full flex-col gap-4 lg:w-80 lg:shrink-0 sm:gap-5">
            <Card>
              <CardHeader
                title={t("common.actions")}
                action={
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={reload}
                    icon={<RefreshCw className="size-4" />}
                  >
                    {t("common.refresh")}
                  </Button>
                }
              />
              <div className="flex flex-col gap-2 p-4 sm:p-5">
                <Button
                  variant="secondary"
                  onClick={() => setIsStatusOpen(true)}
                  icon={<Tag className="size-4" />}
                >
                  {t("tickets.changeStatus")}
                </Button>

                {canManage && (
                  <>
                    <Button
                      variant="secondary"
                      onClick={() => setIsAssignOpen(true)}
                      icon={<UserPlus className="size-4" />}
                    >
                      {t("tickets.assign")}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={claim}
                      isLoading={isClaiming}
                      icon={<UserCheck className="size-4" />}
                    >
                      {t("tickets.assignToMe")}
                    </Button>
                  </>
                )}
              </div>
            </Card>

            <Card>
              <CardHeader title={t("tickets.detailTitle", { code: data.ticket_code })} />
              <div className="divide-y divide-border">
                <MetaRow
                  icon={<UserCheck className="size-4" />}
                  label={t("tickets.assignee")}
                  value={data.assigned_to ?? t("tickets.unassigned")}
                />
                <MetaRow
                  icon={<UserPlus className="size-4" />}
                  label={t("tickets.reporter")}
                  value={data.creator_name ?? "—"}
                />
                <MetaRow
                  icon={<Tag className="size-4" />}
                  label={t("tickets.category")}
                  value={data.category_name ?? "—"}
                />
                <MetaRow
                  icon={<Building2 className="size-4" />}
                  label={t("tickets.department")}
                  value={data.department_name ?? "—"}
                />
                <MetaRow
                  icon={<CalendarClock className="size-4" />}
                  label={t("tickets.createdAt")}
                  value={formatDateTime(data.created_at, i18n.language)}
                />
                <MetaRow
                  icon={<CalendarClock className="size-4" />}
                  label={t("tickets.updatedAt")}
                  value={formatDateTime(data.updated_at, i18n.language)}
                />
              </div>
            </Card>
          </div>

          <AssignTicketModal
            ticketId={ticketId}
            isOpen={isAssignOpen}
            onClose={() => setIsAssignOpen(false)}
            onDone={reload}
          />

          {isStatusOpen && (
            <UpdateStatusModal
              ticketId={ticketId}
              currentStatus={data.status}
              isOpen={isStatusOpen}
              onClose={() => setIsStatusOpen(false)}
              onDone={reload}
            />
          )}
        </div>
      )}
    </>
  );
};

export default TicketDetailPage;
