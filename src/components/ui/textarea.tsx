import { forwardRef, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  function Textarea({ className, ...props }, ref) {
    return (
      <textarea
        ref={ref}
        className={cn(
          "min-h-28 w-full rounded-lg bg-glass px-4 py-3 text-base text-fog outline-none",
          "shadow-[0_0_0_1px_var(--color-ring)] placeholder:text-mute",
          "focus:shadow-[0_0_0_1.5px_var(--color-ring-focus)]",
          className,
        )}
        {...props}
      />
    );
  },
);
