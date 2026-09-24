import type { ReactNode } from "react";

import { Card } from "../../../components/ui/Card";

/** Shared framing for the four auth screens. */
export const AuthCard = ({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) => (
  <Card className="p-6 sm:p-8">
    <div className="mb-6">
      <h1 className="font-heading text-[30px] text-main">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
    {children}
  </Card>
);
