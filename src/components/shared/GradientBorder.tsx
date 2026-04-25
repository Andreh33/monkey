import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export function GradientBorder({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
}) {
  return (
    <div
      className={cn("rounded-2xl p-[1px]", className)}
      style={{ background: "linear-gradient(135deg, #FF2A2A 0%, #FF8800 100%)" }}
    >
      <div className={cn("rounded-[15px] bg-bg-secondary h-full", innerClassName)}>{children}</div>
    </div>
  );
}
