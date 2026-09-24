import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes, ReactNode } from "react";

import { cn } from "../../lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  isLoading?: boolean;
  icon?: ReactNode;
}

/** Square corners, condensed label, hairline border — as the template does. */
const base = cn(
  "inline-flex items-center justify-center gap-1.5 rounded-none border",
  "font-heading leading-tight transition-colors",
  "disabled:cursor-not-allowed disabled:opacity-45",
);

const variants: Record<Variant, string> = {
  primary:
    "border-primary bg-primary text-primary-fg hover:bg-primary-hover active:bg-primary-active disabled:hover:bg-primary",
  secondary:
    "border-border bg-transparent text-main hover:bg-hover active:bg-pressed",
  ghost: "border-transparent bg-transparent text-primary hover:bg-primary-soft",
  danger:
    "border-danger bg-danger text-app hover:bg-danger-hover disabled:hover:bg-danger",
};

const sizes: Record<Size, string> = {
  sm: "h-8 px-2.5 text-[13px]",
  md: "h-9 px-3 text-sm",
};

export const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) => (
  <button
    {...props}
    disabled={disabled || isLoading}
    className={cn(base, variants[variant], sizes[size], className)}
  >
    {isLoading ? (
      <Loader2 className="size-4 animate-spin" aria-hidden />
    ) : (
      icon
    )}
    {children}
  </button>
);

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  children: ReactNode;
}

export const IconButton = ({
  label,
  className,
  children,
  ...props
}: IconButtonProps) => (
  <button
    {...props}
    aria-label={label}
    title={label}
    className={cn(
      "inline-flex size-9 items-center justify-center rounded-none border border-transparent",
      "text-muted transition-colors hover:border-border hover:bg-hover hover:text-main",
      "disabled:cursor-not-allowed disabled:opacity-45",
      className,
    )}
  >
    {children}
  </button>
);
