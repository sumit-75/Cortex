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
      "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-xs font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF7900] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 cursor-pointer active:scale-[0.98]";

    const variants = {
      default: "bg-[#FF7900] text-white hover:bg-[#e06a00] shadow-sm hover:shadow-md",
      destructive: "bg-rose-600 text-white hover:bg-rose-700 shadow-sm",
      outline:
        "border border-slate-300 bg-white hover:bg-slate-50 hover:text-slate-900 text-slate-700 shadow-2xs",
      secondary: "bg-orange-50 text-[#FF7900] hover:bg-orange-100/80 font-bold",
      ghost: "hover:bg-orange-50 hover:text-[#FF7900] text-slate-600",
      link: "text-[#FF7900] underline-offset-4 hover:underline",
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
