import * as React from "react";
import { cn } from "@/src/lib/utils";

const Slider = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => (
  <input
    type="range"
    ref={ref}
    className={cn(
      "w-full h-2 rounded-full appearance-none cursor-pointer bg-zinc-200 dark:bg-zinc-700 accent-zinc-900 dark:accent-zinc-50",
      className
    )}
    {...props}
  />
));
Slider.displayName = "Slider";

export { Slider };
