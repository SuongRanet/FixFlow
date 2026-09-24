import { BellOff, Check, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

import { PageHeader } from "../../../components/common/PageHeader";
import { Button, IconButton } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import {
  EmptyState,
  ErrorState,
  SkeletonRows,
} from "../../../components/ui/States";
import { useApiRequest } from "../../../hooks/useApiRequest";
import { notificationApi } from "../../../lib/api/endpoints";
import { socket } from "../../../lib/socket";
import { cn } from "../../../lib/cn";
import { formatRelative } from "../../../lib/format";
import type { Notification } from "../../../types/api";

const NotificationsPage = () => {
  const { t, i18n } = useTranslation();

  const { data, isLoading, error, reload, setData } = useApiRequest(
    notificationApi.list,
  );

  const [isMarkingAll, setIsMarkingAll] = useState(false);

  // A notification that arrives while this page is open goes straight to
  // the top of the list, with no refresh.
  useEffect(() => {
    const onNew = (incoming: Notification) =>
      setData((current) => [
        incoming,
        ...(current ?? []).filter((item) => item.id !== incoming.id),
      ]);

    socket.on("notification:new", onNew);
    return () => {
      socket.off("notification:new", onNew);
    };
  }, [setData]);

  const notifications = data ?? [];
  const unreadCount = notifications.filter(
    (notification) => !notification.is_read,
  ).length;

  const markOne = async (id: number) => {
    // Flip the row straight away, then reconcile with the server.
    setData(
      notifications.map((notification) =>
        notification.id === id
          ? { ...notification, is_read: true }
          : notification,
      ),
    );

    try {
      await notificationApi.markRead(id);
      window.dispatchEvent(new Event("notifications:read"));
    } catch {
      reload();
    }
  };

  const markAll = async () => {
    setIsMarkingAll(true);
    try {
      await notificationApi.markAllRead();
      window.dispatchEvent(new Event("notifications:read"));
      reload();
    } catch {
      reload();
    } finally {
      setIsMarkingAll(false);
    }
  };

  return (
    <>
      <PageHeader
        kicker={t("nav.notifications")}
        endpoint="GET /api/v1/notifications"
        title={t("notifications.title")}
        subtitle={
          unreadCount > 0
            ? t("notifications.unread", { count: unreadCount })
            : t("notifications.subtitle")
        }
        action={
          unreadCount > 0 ? (
            <Button
              variant="secondary"
              onClick={markAll}
              isLoading={isMarkingAll}
              icon={<CheckCheck className="size-4" />}
            >
              {t("notifications.markAllRead")}
            </Button>
          ) : undefined
        }
      />

      <Card>
        {isLoading && <SkeletonRows rows={5} columns={2} />}

        {!isLoading && error && <ErrorState message={error} onRetry={reload} />}

        {!isLoading && !error && notifications.length === 0 && (
          <EmptyState
            icon={<BellOff className="size-5" />}
            title={t("notifications.empty")}
          />
        )}

        {!isLoading && !error && notifications.length > 0 && (
          <ul className="divide-y divide-border">
            {notifications.map((notification) => (
              <li
                key={notification.id}
                className={cn(
                  "flex items-start gap-3 px-4 py-4 sm:px-5",
                  !notification.is_read && "bg-primary-soft",
                )}
              >
                <span
                  className={cn(
                    "mt-1.5 size-2 shrink-0",
                    notification.is_read ? "bg-border-strong" : "bg-primary",
                  )}
                  aria-hidden
                />

                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-main">
                    {notification.title}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    {notification.message}
                  </p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                    <span>
                      {formatRelative(notification.created_at, i18n.language)}
                    </span>
                    {notification.ticket_id && (
                      <Link
                        to={`/tickets/${notification.ticket_id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        {notification.ticket_code ??
                          t("notifications.viewTicket")}
                      </Link>
                    )}
                  </div>
                </div>

                {!notification.is_read && (
                  <IconButton
                    label={t("notifications.markRead")}
                    onClick={() => markOne(notification.id)}
                  >
                    <Check className="size-4" />
                  </IconButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </>
  );
};

export default NotificationsPage;
