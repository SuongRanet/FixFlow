import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  kicker?: string;
  subtitle?: string;
  endpoint?: string;
  action?: ReactNode;
}
export const PageHeader = ({
  title,
  kicker,
  subtitle,
  action,
}: PageHeaderProps) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div className="min-w-0">
      {kicker && <p className="kicker mb-0.5">{kicker}</p>}
      <h1 className="truncate font-heading text-[28px] text-main">{title}</h1>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
    </div>
    {action && <div className="flex shrink-0 gap-2">{action}</div>}
  </div>
);
