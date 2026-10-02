"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      isLoading = false,
      disabled,
      startIcon,
      endIcon,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none rounded-lg cursor-pointer";

    const variantStyles = {
      primary:
        "bg-[#0C4A4E] text-white hover:bg-[#052F31] focus:ring-[#147A77] shadow-sm active:bg-[#052F31]",
      secondary:
        "bg-[#147A77] text-white hover:bg-[#103F43] focus:ring-[#178A86] shadow-sm active:bg-[#0C4A4E]",
      outline:
        "border border-[#E7EEEB] bg-white text-[#163D42] hover:bg-[#F1F6F4] hover:border-[#147A77]/40 focus:ring-[#178A86] shadow-xs",
      ghost:
        "bg-transparent text-[#163D42] hover:bg-[#F1F6F4] hover:text-[#0C4A4E] focus:ring-[#178A86]",
      danger:
        "bg-[#B76648] text-white hover:bg-[#9E5236] focus:ring-[#B76648] shadow-sm",
      success:
        "bg-[#126B58] text-white hover:bg-[#0E5445] focus:ring-[#126B58] shadow-sm",
    };

    const sizeStyles = {
      sm: "text-xs px-3 py-1.5 gap-1.5",
      md: "text-sm px-4 py-2.5 gap-2",
      lg: "text-base px-5 py-3 gap-2.5 font-semibold",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          baseStyles,
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
        ) : (
          startIcon && <span className="shrink-0">{startIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && endIcon && <span className="shrink-0">{endIcon}</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
