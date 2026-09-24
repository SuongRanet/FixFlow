import { Pencil, Plus, Search, UserMinus, Users } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

import { PageHeader } from "../../../components/common/PageHeader";
import { RoleGuard } from "../../../components/common/ProtectedRoute";
import { ActiveBadge, RoleBadge } from "../../../components/ui/Badge";
import { Button, IconButton } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Input } from "../../../components/ui/Field";
import { Modal } from "../../../components/ui/Modal";
import {
  EmptyState,
  ErrorState,
  FormError,
  SkeletonRows,
} from "../../../components/ui/States";
import { Table, TableWrap, Td, Th, Tr } from "../../../components/ui/Table";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { userApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { formatDate, initialsOf } from "../../../lib/format";
import type { User } from "../../../types/api";
import { UserFormModal } from "../components/UserFormModal";

const UsersTable = () => {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error, reload } = useApiRequest(userApi.list);

  const [search, setSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editing, setEditing] = useState<User>();
  const [deactivating, setDeactivating] = useState<User>();
  const [deactivateError, setDeactivateError] = useState<string>();
  const [isDeactivating, setIsDeactivating] = useState(false);

  // The list endpoint has no search, so filter the rows locally.
  const users = useMemo(() => {
    const rows = data ?? [];
    const term = search.trim().toLowerCase();
    if (!term) return rows;

    return rows.filter((user) =>
      [user.first_name, user.last_name, user.username, user.email]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [data, search]);

  const openCreate = () => {
    setEditing(undefined);
    setIsFormOpen(true);
  };

  const openEdit = (user: User) => {
    setEditing(user);
    setIsFormOpen(true);
  };

  const confirmDeactivate = async () => {
    if (!deactivating) return;

    setDeactivateError(undefined);
    setIsDeactivating(true);
    try {
      await userApi.deactivate(deactivating.id);
      setDeactivating(undefined);
      reload();
    } catch (requestError) {
      setDeactivateError(
        isNetworkError(requestError)
          ? t("common.networkError")
          : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
      );
    } finally {
      setIsDeactivating(false);
    }
  };

  return (
    <>
      <PageHeader
        kicker={t("role.ADMIN")}
        title={t("users.title")}
        subtitle={t("users.subtitle")}
        endpoint="GET /api/v1/user"
        action={
          <Button onClick={openCreate} icon={<Plus className="size-4" />}>
            {t("users.newUser")}
          </Button>
        }
      />

      <Card className="mb-4 p-3 sm:mb-5 sm:p-4">
        <div className="relative">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-placeholder"
            aria-hidden
          />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder={t("common.search")}
            aria-label={t("common.search")}
            className="pl-9"
          />
        </div>
      </Card>

      <Card>
        {isLoading && <SkeletonRows rows={6} columns={5} />}

        {!isLoading && error && <ErrorState message={error} onRetry={reload} />}

        {!isLoading && !error && users.length === 0 && (
          <EmptyState
            icon={<Users className="size-5" />}
            title={search ? t("common.noResults") : t("users.empty")}
            action={
              !search ? (
                <Button size="sm" onClick={openCreate}>
                  {t("users.newUser")}
                </Button>
              ) : undefined
            }
          />
        )}

        {!isLoading && !error && users.length > 0 && (
          <>
            <TableWrap>
              <Table>
                <thead>
                  <tr>
                    <Th>{t("users.name")}</Th>
                    <Th>{t("users.username")}</Th>
                    <Th>{t("users.role")}</Th>
                    <Th>{t("users.departmentId")}</Th>
                    <Th>{t("users.status")}</Th>
                    <Th>{t("users.createdAt")}</Th>
                    <Th className="text-right">{t("common.actions")}</Th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <Tr key={user.id}>
                      <Td>
                        <div className="flex items-center gap-3">
                          <span
                            className="flex size-8 shrink-0 items-center justify-center border border-border bg-primary-soft font-heading text-[13px] text-primary"
                            aria-hidden
                          >
                            {initialsOf(user.first_name, user.last_name)}
                          </span>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-main">
                              {user.first_name} {user.last_name}
                            </p>
                            <p className="truncate text-xs text-muted">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </Td>
                      <Td className="text-muted">{user.username}</Td>
                      <Td>
                        <RoleBadge role={user.role} />
                      </Td>
                      <Td className="text-muted">
                        {user.department_id ?? "—"}
                      </Td>
                      <Td>
                        <ActiveBadge isActive={user.is_active} />
                      </Td>
                      <Td className="whitespace-nowrap text-muted">
                        {formatDate(user.created_at, i18n.language)}
                      </Td>
                      <Td>
                        <div className="flex justify-end gap-1">
                          <IconButton
                            label={t("common.edit")}
                            onClick={() => openEdit(user)}
                          >
                            <Pencil className="size-4" />
                          </IconButton>
                          <IconButton
                            label={t("users.deactivate")}
                            onClick={() => setDeactivating(user)}
                            className="hover:text-danger"
                          >
                            <UserMinus className="size-4" />
                          </IconButton>
                        </div>
                      </Td>
                    </Tr>
                  ))}
                </tbody>
              </Table>
            </TableWrap>

            <div className="border-t border-border px-4 py-3 text-xs text-muted">
              {users.length} {t("common.results")}
            </div>
          </>
        )}
      </Card>

      {isFormOpen && (
        <UserFormModal
          key={editing?.id ?? "new"}
          isOpen
          user={editing}
          onClose={() => setIsFormOpen(false)}
          onSaved={reload}
        />
      )}

      <Modal
        isOpen={Boolean(deactivating)}
        onClose={() => setDeactivating(undefined)}
        title={t("users.deactivateTitle")}
        description={
          deactivating
            ? t("users.deactivateConfirm", {
                name: `${deactivating.first_name} ${deactivating.last_name}`,
              })
            : undefined
        }
        size="sm"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setDeactivating(undefined)}
              disabled={isDeactivating}
            >
              {t("common.cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeactivate}
              isLoading={isDeactivating}
            >
              {t("users.deactivate")}
            </Button>
          </>
        }
      >
        <FormError message={deactivateError} />
      </Modal>
    </>
  );
};

/** Every /user route is ADMIN-only on the backend, so guard the page too. */
const UsersPage = () => (
  <RoleGuard roles={["ADMIN"]}>
    <UsersTable />
  </RoleGuard>
);

export default UsersPage;
