import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "youtube" | "twitter";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  const variants = {
    default: "border-transparent bg-[#FF7900] text-white shadow-2xs hover:bg-[#e06a00]",
    secondary: "border-transparent bg-orange-50 text-[#FF7900] hover:bg-orange-100",
    destructive: "border-transparent bg-rose-600 text-white hover:bg-rose-700",
    outline: "text-slate-700 border-slate-300 bg-white",
    youtube: "border-red-200 bg-red-50 text-red-700 font-bold uppercase tracking-wider",
    twitter: "border-sky-200 bg-sky-50 text-sky-700 font-bold uppercase tracking-wider",
  };

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[#FF7900] focus:ring-offset-2 shrink-0",
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
