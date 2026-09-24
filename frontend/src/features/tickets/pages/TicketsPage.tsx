import { Plus, Search, SlidersHorizontal, Ticket, X } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

import {
  CategorySelect,
  DepartmentSelect,
} from "../../../components/common/OptionSelect";
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
import { useApiRequest, useDebouncedValue } from "../../../hooks/useApiRequest";
import { ticketApi } from "../../../lib/api/endpoints";
import { formatDate } from "../../../lib/format";
import type {
  FilterablePriority,
  TicketFilters,
  TicketStatus,
} from "../../../types/api";
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

const FILTER_PRIORITIES: FilterablePriority[] = [
  "LOW",
  "MEDIUM",
  "HIGH",
  "CRITICAL",
];

const TicketQueue = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<TicketStatus | "">("");
  const [priority, setPriority] = useState<FilterablePriority | "">("");
  const [categoryId, setCategoryId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const debouncedSearch = useDebouncedValue(search);

  const hasFilters = Boolean(
    debouncedSearch || status || priority || categoryId || departmentId,
  );

  const filters = useMemo<TicketFilters>(
    () => ({
      search: debouncedSearch || undefined,
      status: status || undefined,
      priority: priority || undefined,
      categoryId: categoryId ? Number(categoryId) : undefined,
      departmentId: departmentId ? Number(departmentId) : undefined,
    }),
    [debouncedSearch, status, priority, categoryId, departmentId],
  );

  // No filters → plain list (role-scoped); any filter → the filter endpoint.
  const { data, isLoading, error, reload } = useApiRequest(
    () => (hasFilters ? ticketApi.filter(filters) : ticketApi.list()),
    [hasFilters, filters],
  );

  const clearFilters = () => {
    setSearch("");
    setStatus("");
    setPriority("");
    setCategoryId("");
    setDepartmentId("");
  };

  const tickets = data ?? [];

  return (
    <>
      <PageHeader
        kicker={t("nav.tickets")}
        title={t("tickets.title")}
        subtitle={t("tickets.subtitle")}
        endpoint={
          hasFilters ? "GET /api/v1/ticket/fillter" : "GET /api/v1/ticket"
        }
        action={
          <Button
            onClick={() => setIsCreateOpen(true)}
            icon={<Plus className="size-4" />}
          >
            {t("tickets.newTicket")}
          </Button>
        }
      />

      <Card className="mb-4 p-3 sm:mb-5 sm:p-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-placeholder"
              aria-hidden
            />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={t("common.searchPlaceholder")}
              aria-label={t("common.search")}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2">
            <Button
              variant="secondary"
              onClick={() => setShowFilters((open) => !open)}
              icon={<SlidersHorizontal className="size-4" />}
              aria-expanded={showFilters}
            >
              {t("common.filters")}
            </Button>
            {hasFilters && (
              <Button
                variant="ghost"
                onClick={clearFilters}
                icon={<X className="size-4" />}
              >
                {t("common.clearFilters")}
              </Button>
            )}
          </div>
        </div>

        {showFilters && (
          <div className="mt-3 grid grid-cols-1 gap-3 border-t border-border pt-3 sm:grid-cols-2 lg:grid-cols-4">
            <Select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as TicketStatus | "")
              }
              aria-label={t("tickets.status")}
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

            <Select
              value={priority}
              onChange={(event) =>
                setPriority(event.target.value as FilterablePriority | "")
              }
              aria-label={t("tickets.priority")}
            >
              <option value="">
                {t("tickets.priority")} — {t("common.all")}
              </option>
              {FILTER_PRIORITIES.map((option) => (
                <option key={option} value={option}>
                  {t(`priority.${option}`)}
                </option>
              ))}
            </Select>

            <CategorySelect
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              placeholder={t("tickets.allCategories")}
              aria-label={t("tickets.category")}
            />

            <DepartmentSelect
              value={departmentId}
              onChange={(event) => setDepartmentId(event.target.value)}
              placeholder={t("tickets.allDepartments")}
              aria-label={t("tickets.department")}
            />
          </div>
        )}
      </Card>

      <Card>
        {isLoading && <SkeletonRows rows={6} columns={5} />}

        {!isLoading && error && <ErrorState message={error} onRetry={reload} />}

        {!isLoading && !error && tickets.length === 0 && (
          <EmptyState
            icon={<Ticket className="size-5" />}
            title={hasFilters ? t("tickets.emptyFiltered") : t("tickets.empty")}
            body={hasFilters ? undefined : t("tickets.subtitle")}
            action={
              hasFilters ? (
                <Button variant="secondary" size="sm" onClick={clearFilters}>
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
                    <Th>{t("tickets.category")}</Th>
                    <Th>{t("tickets.reporter")}</Th>
                    <Th>{t("tickets.createdAt")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => (
                    <Tr
                      key={ticket.id}
                      onClick={() => navigate(`/tickets/${ticket.id}`)}
                    >
                      <Td className="whitespace-nowrap font-medium text-primary">
                        {ticket.ticket_code}
                      </Td>
                      <Td className="max-w-xs">
                        <span className="line-clamp-1">{ticket.title}</span>
                      </Td>
                      <Td>
                        <StatusBadge status={ticket.status} />
                      </Td>
                      <Td>
                        <PriorityBadge priority={ticket.priority} />
                      </Td>
                      <Td className="text-muted">
                        {ticket.category_name ?? "—"}
                      </Td>
                      <Td className="text-muted">
                        {ticket.creator_username ?? "—"}
                      </Td>
                      <Td className="whitespace-nowrap text-muted">
                        {formatDate(ticket.created_at, i18n.language)}
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <div className="border-t border-border px-4 py-3 text-xs text-muted">
              {tickets.length} {t("common.results")}
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

/** The full queue is for staff; a plain user gets /my-tickets instead. */
const TicketsPage = () => (
  <RoleGuard roles={["ADMIN", "IT_SUPPORT"]}>
    <TicketQueue />
  </RoleGuard>
);

export default TicketsPage;
