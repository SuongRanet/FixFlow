import { FilePlus2, Plus, RefreshCw, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import { PageHeader } from "../../../components/common/PageHeader";
import { RoleGuard } from "../../../components/common/ProtectedRoute";
import { PriorityBadge, StatusBadge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input, Select } from "../../../components/ui/Field";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "../../../components/ui/States";
import { Table, TableWrap, Td, Th, Tr } from "../../../components/ui/Table";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { ticketApi } from "../../../lib/api/endpoints";
import { formatDate } from "../../../lib/format";
import type { TicketStatus } from "../../../types/api";
import { CreateTicketModal } from "../components/CreateTicketModal";

const STATUSES: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

/**
 * The tickets the signed-in user opened themselves. The endpoint takes no
 * query parameters, so the search and status filter run over the rows in
 * the browser rather than hitting the server again.
 */
const MyTicketList = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const { data, isLoading, error, reload } = useApiRequest(ticketApi.mine);

  const tickets = useMemo(() => {
    const rows = data ?? [];
    const term = search.trim().toLowerCase();

    return rows.filter((ticket) => {
      const matchesStatus = !status || ticket.status === status;
      const matchesSearch =
        !term ||
        [ticket.ticket_code, ticket.title, ticket.category_name]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(term);

      return matchesStatus && matchesSearch;
    });
  }, [data, search, status]);

  const hasFilters = Boolean(search.trim() || status);
  const total = data?.length ?? 0;

  return (
    <>
      <PageHeader
        kicker={t("nav.myTickets")}
        title={t("myTickets.title")}
        subtitle={t("myTickets.subtitle")}
        endpoint="GET /api/v1/ticket/my"
        action={
          <>
            <Button
              variant="secondary"
              onClick={reload}
              icon={<RefreshCw className="size-4" />}
            >
              {t("common.refresh")}
            </Button>
            <Button
              onClick={() => setIsCreateOpen(true)}
              icon={<Plus className="size-4" />}
            >
              {t("tickets.newTicket")}
            </Button>
          </>
        }
      />

      <Card className="mb-5 p-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-placeholder"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("myTickets.searchPlaceholder")}
              aria-label={t("common.search")}
              className="pl-8"
            />
          </div>

          <Select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as TicketStatus | "")
            }
            aria-label={t("tickets.status")}
            className="sm:w-56"
          >
            <option value="">
              {t("tickets.status")} — {t("common.all")}
            </option>
            {STATUSES.map((option) => (
              <option key={option} value={option}>
                {t(`status.${option}`)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card>
        {isLoading && <SkeletonRows rows={5} columns={5} />}

        {!isLoading && error && <ErrorState message={error} onRetry={reload} />}

        {!isLoading && !error && tickets.length === 0 && (
          <EmptyState
            icon={<FilePlus2 className="size-4" />}
            title={
              hasFilters ? t("tickets.emptyFiltered") : t("myTickets.empty")
            }
            body={hasFilters ? undefined : t("myTickets.emptyBody")}
            action={
              hasFilters ? (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setSearch("");
                    setStatus("");
                  }}
                >
                  {t("common.clearFilters")}
                </Button>
              ) : (
                <Button size="sm" onClick={() => setIsCreateOpen(true)}>
                  {t("tickets.newTicket")}
                </Button>
              )
            }
          />
        )}

        {!isLoading && !error && tickets.length > 0 && (
          <>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{t("tickets.code")}</Th>
                    <Th>{t("tickets.ticketTitle")}</Th>
                    <Th>{t("tickets.status")}</Th>
                    <Th>{t("tickets.priority")}</Th>
                    <Th>{t("tickets.assignee")}</Th>
                    <Th>{t("tickets.createdAt")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <Tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <Td className="whitespace-nowrap text-primary">
                        {ticket.ticket_code}
                      </Td>
                      <Td className="max-w-sm">
                        <span className="line-clamp-1">{ticket.title}</span>
                        <span className="block truncate text-xs text-muted">
                          {ticket.category_name ?? "—"}
                        </span>
                      </Td>
                      <Td>
                        <StatusBadge status={ticket.status} />
                      </Td>
                      <Td>
                        <PriorityBadge priority={ticket.priority} />
                      </Td>
                      <Td className="text-muted">
                        {ticket.assigned_to_username ?? t("tickets.unassigned")}
                      </Td>
                      <Td className="whitespace-nowrap text-muted">
                        {formatDate(ticket.created_at, i18n.language)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <div className="border-t border-border px-3 py-2 text-xs text-muted">
              {hasFilters
                ? `${tickets.length} / ${total}`
                : tickets.length}{" "}
              {t("common.results")}
            </div>
          </>
        )}
      </Card>

      <CreateTicketModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={reload}
      />
    </>
  );
};

/** Staff use the full queue, so this view is for the USER role only. */
const MyTicketsPage = () => (
  <RoleGuard roles={["USER"]}>
    <MyTicketList />
  </RoleGuard>
);

export default MyTicketsPage;
