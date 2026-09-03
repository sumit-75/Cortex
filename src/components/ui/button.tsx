import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      asChild = false,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button";

    const baseStyles =
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-semibold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";

    const variants = {
      default: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm hover:shadow-md",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-100 hover:text-slate-900 text-slate-700 shadow-2xs",
      secondary: "bg-slate-100 text-slate-900 hover:bg-slate-200/80",
      ghost: "hover:bg-slate-100 hover:text-slate-900 text-slate-600",
      link: "text-indigo-600 underline-offset-4 hover:underline",
    };

    const sizes = {
      default: "h-10 px-4 py-2",
      sm: "h-8 rounded-lg px-3 text-xs",
      lg: "h-12 rounded-xl px-8 text-sm",
      icon: "h-9 w-9 rounded-lg",
    };

    return (
      <Comp
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
