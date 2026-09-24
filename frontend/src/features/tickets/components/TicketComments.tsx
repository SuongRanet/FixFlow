import { MessageSquare, Send } from "lucide-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import { Button } from "../../../components/ui/Button";
import { Card, CardHeader } from "../../../components/ui/Card";
import { Textarea } from "../../../components/ui/Field";
import { EmptyState, FormError } from "../../../components/ui/States";
import { ticketApi } from "../../../lib/api/endpoints";
import { getApiErrorMessage, isNetworkError } from "../../../lib/axios";
import { cn } from "../../../lib/cn";
import { formatDateTime } from "../../../lib/format";
import { useAuthStore } from "../../../stores/auth.store";
import type { TicketComment } from "../../../types/api";

/**
 * The backend has no "list comments" endpoint yet, so this panel shows the
 * comments posted during this visit and keeps the POST path wired up.
 */
export const TicketComments = ({ ticketId }: { ticketId: number }) => {
  const { t, i18n } = useTranslation();
  const hasRole = useAuthStore((state) => state.hasRole);
  const canPostInternal = hasRole("ADMIN", "IT_SUPPORT");

  const [comments, setComments] = useState<TicketComment[]>([]);
  const [content, setContent] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [error, setError] = useState<string>();
  const [isSaving, setIsSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!content.trim()) {
      setError(t("validation.contentRequired"));
      return;
    }

    setError(undefined);
    setIsSaving(true);
    try {
      const created = await ticketApi.addComment(
        ticketId,
        content.trim(),
        isInternal,
      );
      setComments((previous) => [created, ...previous]);
      setContent("");
      setIsInternal(false);
    } catch (requestError) {
      setError(
        isNetworkError(requestError)
          ? t("common.networkError")
          : (getApiErrorMessage(requestError) ?? t("common.unknownError")),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader title={t("tickets.comments")} />

      <form onSubmit={submit} className="flex flex-col gap-3 p-4 sm:p-5">
        <FormError message={error} />

        <Textarea
          value={content}
          onChange={(event) => setContent(event.target.value)}
          placeholder={t("tickets.commentPlaceholder")}
          aria-label={t("tickets.addComment")}
          rows={3}
        />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {canPostInternal ? (
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
              <input
                type="checkbox"
                checked={isInternal}
                onChange={(event) => setIsInternal(event.target.checked)}
                className="size-4 rounded-none border-border accent-[var(--color-accent)]"
              />
              {t("tickets.internalNote")}
            </label>
          ) : (
            <span />
          )}

          <Button
            type="submit"
            isLoading={isSaving}
            icon={<Send className="size-4" />}
          >
            {t("tickets.postComment")}
          </Button>
        </div>
      </form>

      {comments.length === 0 ? (
        <div className="border-t border-border">
          <EmptyState
            icon={<MessageSquare className="size-5" />}
            title={t("tickets.noComments")}
          />
        </div>
      ) : (
        <ul className="divide-y divide-border border-t border-border">
          {comments.map((comment) => (
            <li
              key={comment.id}
              className={cn(
                "px-4 py-3 sm:px-5",
                comment.is_internal && "bg-internal-note",
              )}
            >
              <div className="mb-1 flex items-center gap-2 text-xs text-muted">
                <span>{formatDateTime(comment.created_at, i18n.language)}</span>
                {comment.is_internal && (
                  <span className="border border-warning px-2 py-0.5 text-warning">
                    {t("tickets.internalNote")}
                  </span>
                )}
              </div>
              <p className="whitespace-pre-wrap text-sm text-main">
                {comment.content}
              </p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};
