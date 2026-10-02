import React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "danger" | "info" | "neutral";
  size?: "sm" | "md";
}

export function Badge({
  className,
  variant = "default",
  size = "md",
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: "bg-[#E6F1EE] text-[#0C4A4E] border-[#BFE5DF]",
    success: "bg-[#E5F7EE] text-[#126B58] border-[#A8E2C7]",
    warning: "bg-[#FFF3D8] text-[#9A762D] border-[#FCE1A8]",
    danger: "bg-[#FFF0E7] text-[#B76648] border-[#FACDC0]",
    info: "bg-[#EAF4FB] text-[#437CA4] border-[#BCE0F7]",
    neutral: "bg-[#F1F6F4] text-[#456A6D] border-[#E7EEEB]",
  };

  const sizeStyles = {
    sm: "text-xs px-2 py-0.5",
    md: "text-xs font-medium px-2.5 py-1",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-medium select-none",
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
