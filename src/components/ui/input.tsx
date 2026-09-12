import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-lg bg-glass px-4 text-base text-fog outline-none",
        "shadow-[0_0_0_1px_var(--color-ring)] placeholder:text-mute",
        "focus:shadow-[0_0_0_1.5px_var(--color-ring-focus)]",
        className,
      )}
      {...props}
    />
  );
}
