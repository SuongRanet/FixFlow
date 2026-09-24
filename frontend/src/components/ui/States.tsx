import { AlertTriangle, Inbox, Loader2 } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";

import { cn } from "../../lib/cn";
import { Button } from "./Button";

export const Spinner = ({ className }: { className?: string }) => (
  <Loader2
    className={cn("size-5 animate-spin text-muted", className)}
    aria-hidden
  />
);

export const LoadingBlock = ({ label }: { label?: string }) => {
  const { t } = useTranslation();
  return (
    <div
      className="flex flex-col items-center justify-center gap-2 px-6 py-14"
      role="status"
      aria-live="polite"
    >
      <Spinner />
      <p className="text-sm text-muted">{label ?? t("common.loading")}</p>
    </div>
  );
};

/** Square placeholder rows, shown while a table loads. */
export const SkeletonRows = ({
  rows = 5,
  columns = 4,
}: {
  rows?: number;
  columns?: number;
}) => (
  <div className="divide-y divide-rule" aria-hidden>
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="flex items-center gap-4 px-3 py-4">
        {Array.from({ length: columns }).map((__, columnIndex) => (
          <div
            key={columnIndex}
            className="h-3 flex-1 animate-pulse bg-hover"
            style={{ animationDelay: `${(rowIndex + columnIndex) * 60}ms` }}
          />
        ))}
      </div>
    ))}
  </div>
);

interface EmptyStateProps {
  title: string;
  body?: string;
  icon?: ReactNode;
  action?: ReactNode;
}

export const EmptyState = ({ title, body, icon, action }: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
    <span
      className="flex size-10 items-center justify-center border border-border text-muted"
      aria-hidden
    >
      {icon ?? <Inbox className="size-4" />}
    </span>
    <div>
      <p className="font-heading text-[15px] text-main">{title}</p>
      {body && <p className="mt-0.5 text-sm text-muted">{body}</p>}
    </div>
    {action}
  </div>
);

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorState = ({ message, onRetry }: ErrorStateProps) => {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-14 text-center">
      <span
        className="flex size-10 items-center justify-center border border-danger text-danger"
        aria-hidden
      >
        <AlertTriangle className="size-4" />
      </span>
      <div>
        <p className="font-heading text-[15px] text-main">
          {t("common.somethingWentWrong")}
        </p>
        <p className="mt-0.5 text-sm text-muted">{message}</p>
      </div>
      {onRetry && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          {t("common.retry")}
        </Button>
      )}
    </div>
  );
};

/** Inline form-level error, e.g. a rejected login. */
export const FormError = ({ message }: { message?: string }) =>
  message ? (
    <p
      role="alert"
      className="flex items-start gap-2 border border-danger px-2.5 py-2 text-[13px] text-danger"
    >
      <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {message}
    </p>
  ) : null;

export const FormSuccess = ({ message }: { message?: string }) =>
  message ? (
    <p
      role="status"
      className="border border-success px-2.5 py-2 text-[13px] text-success"
    >
      {message}
    </p>
  ) : null;
