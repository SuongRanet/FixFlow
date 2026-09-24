import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/** The four crosshair marks the template places at each panel corner. */
const Corners = () => (
  <>
    <span className="corner tl" aria-hidden />
    <span className="corner tr" aria-hidden />
    <span className="corner bl" aria-hidden />
    <span className="corner br" aria-hidden />
  </>
);

interface CardProps {
  children: ReactNode;
  className?: string;
  /** Set false for nested panels, where corner marks would be noisy. */
  corners?: boolean;
}

/**
 * A panel: transparent background, hairline border, square corners,
 * with blueprint crosshairs at the corners.
 */
export const Card = ({ children, className, corners = true }: CardProps) => (
  <div
    className={cn(
      "blueprint border border-border bg-transparent",
      className,
    )}
  >
    {corners && <Corners />}
    {children}
  </div>
);

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export const CardHeader = ({ title, subtitle, action }: CardHeaderProps) => (
  <div className="flex items-start justify-between gap-3 border-b border-border px-4 py-3">
    <div className="min-w-0">
      <h2 className="truncate font-heading text-[17px] leading-tight text-main">
        {title}
      </h2>
      {subtitle && <p className="endpoint mt-0.5 truncate">{subtitle}</p>}
    </div>
    {action}
  </div>
);

interface StatCardProps {
  label: string;
  value: string | number;
  /** Small line under the number, e.g. "4 unassigned". */
  hint?: string;
  icon?: ReactNode;
}

/**
 * One cell of the stat strip: uppercase kicker, oversized condensed
 * number, optional hint — matching the template's dashboard header.
 */
export const StatCard = ({ label, value, hint, icon }: StatCardProps) => (
  <div className="flex min-w-0 flex-col gap-1 px-4 py-4">
    <div className="flex items-center gap-2">
      <span className="kicker leading-tight">{label}</span>
      {icon && (
        <span className="ml-auto text-faint" aria-hidden>
          {icon}
        </span>
      )}
    </div>
    <p className="font-heading text-[40px] leading-none tabular-nums text-main">
      {value}
    </p>
    {hint && <p className="truncate text-xs text-muted">{hint}</p>}
  </div>
);

/**
 * The stat strip itself: one bordered panel split by hairlines,
 * rather than separate floating cards.
 */
export const StatStrip = ({ children }: { children: ReactNode }) => (
  <Card className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
    {children}
  </Card>
);

/** Wrapper that draws the hairline between stat cells. */
export const StatCell = ({ children }: { children: ReactNode }) => (
  <div className="border-b border-border last:border-b-0 sm:border-r sm:[&:nth-child(2n)]:border-r-0 xl:[&:nth-child(2n)]:border-r xl:last:border-r-0 sm:[&:nth-last-child(-n+2)]:border-b-0">
    {children}
  </div>
);
