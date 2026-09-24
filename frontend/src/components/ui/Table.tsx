import type { ReactNode } from "react";

import { cn } from "../../lib/cn";

/**
 * Wrapper that lets a wide table scroll sideways on small screens
 * instead of breaking the page layout.
 */
export const TableWrap = ({ children }: { children: ReactNode }) => (
  <div className="w-full overflow-x-auto scrollbar-slim">{children}</div>
);

export const Table = ({ children }: { children: ReactNode }) => (
  <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
    {children}
  </table>
);

/** Uppercase, tracked, muted column headings over a hairline rule. */
export const Th = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <th
    scope="col"
    className={cn(
      "border-b border-border px-3 py-2 text-[11px] font-normal uppercase tracking-[0.08em] text-muted",
      className,
    )}
  >
    {children}
  </th>
);

export const Td = ({
  children,
  className,
}: {
  children?: ReactNode;
  className?: string;
}) => (
  <td className={cn("px-3 py-2.5 align-middle text-main", className)}>
    {children}
  </td>
);

export const Tr = ({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick?: () => void;
}) => (
  <tr
    onClick={onClick}
    className={cn(
      "border-b border-rule last:border-0 transition-colors",
      onClick && "cursor-pointer hover:bg-subtle",
    )}
  >
    {children}
  </tr>
);
