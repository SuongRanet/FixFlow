import type { ComponentProps, ReactNode } from "react";

import { cn } from "../../lib/cn";

/** Square, surface-filled controls with a hairline border. */
const controlClasses = cn(
  "w-full min-h-9 rounded-none border border-border bg-surface px-2.5 py-1.5",
  "text-sm text-main caret-[var(--color-accent)] transition-colors",
  "hover:border-border-strong focus:border-primary focus:outline-none",
  "disabled:cursor-not-allowed disabled:opacity-45",
);

interface FieldWrapperProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  className?: string;
}

export const Field = ({
  label,
  htmlFor,
  hint,
  error,
  children,
  className,
}: FieldWrapperProps) => (
  <div className={cn("flex flex-col gap-1", className)}>
    {label && (
      <label htmlFor={htmlFor} className="text-xs text-muted">
        {label}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-[11px] text-faint">{hint}</p>}
    {error && (
      <p role="alert" className="text-[11px] text-danger">
        {error}
      </p>
    )}
  </div>
);

export const Input = ({
  className,
  hasError,
  ...props
}: ComponentProps<"input"> & { hasError?: boolean }) => (
  <input
    {...props}
    className={cn(controlClasses, hasError && "border-danger", className)}
  />
);

export const Textarea = ({
  className,
  hasError,
  ...props
}: ComponentProps<"textarea"> & { hasError?: boolean }) => (
  <textarea
    {...props}
    className={cn(
      controlClasses,
      "min-h-[90px] resize-y",
      hasError && "border-danger",
      className,
    )}
  />
);

export const Select = ({
  className,
  hasError,
  children,
  ...props
}: ComponentProps<"select"> & { hasError?: boolean }) => (
  <select
    {...props}
    className={cn(
      controlClasses,
      "cursor-pointer appearance-none bg-[length:0.9rem] bg-[right_0.6rem_center] bg-no-repeat pr-8",
      "bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 fill=%22none%22 stroke=%22%2398989b%22 stroke-width=%222%22 viewBox=%220 0 24 24%22><path d=%22m6 9 6 6 6-6%22/></svg>')]",
      hasError && "border-danger",
      className,
    )}
  >
    {children}
  </select>
);
