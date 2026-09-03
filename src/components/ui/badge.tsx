import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "youtube" | "twitter";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-indigo-600 text-white shadow-2xs hover:bg-indigo-700",
    secondary: "border-transparent bg-slate-100 text-slate-800 hover:bg-slate-200",
    destructive: "border-transparent bg-rose-600 text-white hover:bg-rose-700",
    outline: "text-slate-700 border-slate-300 bg-white",
    youtube: "border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-wider",
    twitter: "border-sky-200 bg-sky-50 text-sky-700 font-bold uppercase tracking-wider",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 shrink-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
