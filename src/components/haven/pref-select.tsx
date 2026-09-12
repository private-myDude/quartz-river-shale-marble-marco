import type { SelectHTMLAttributes } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PrefSelect({
  className,
  children,
  ...props
}: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <span className={cn("relative inline-flex h-11 w-40 shrink-0 items-center", className)}>
      <select
        className="h-11 w-full appearance-none rounded-lg bg-glass py-2 pl-3 pr-9 text-sm text-fog outline-none shadow-[0_0_0_1px_var(--color-ring)] focus:shadow-[0_0_0_1.5px_var(--color-ring-focus)]"
        {...props}
      >
        {children}
      </select>
      <ChevronDown className="pointer-events-none absolute right-2.5 size-4 text-mute" />
    </span>
  );
}
