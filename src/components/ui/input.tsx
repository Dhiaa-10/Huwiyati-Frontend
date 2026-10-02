"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      startIcon,
      endIcon,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

    return (
      <div className="w-full space-y-1.5 text-right">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-[#163D42] select-none"
          >
            {label}
            {props.required && <span className="text-[#B76648] ms-1">*</span>}
          </label>
        )}
        <div className="relative flex items-center">
          {startIcon && (
            <div className="absolute start-3 flex items-center pointer-events-none text-[#6D898A]">
              {startIcon}
            </div>
          )}
          <input
            id={inputId}
            ref={ref}
            type={type}
            disabled={disabled}
            className={cn(
              "w-full rounded-lg border bg-white px-3.5 py-2.5 text-sm text-[#163D42] placeholder:text-[#6D898A] transition-colors",
              "focus:outline-none focus:ring-2 focus:ring-[#178A86]/20 focus:border-[#178A86]",
              "disabled:bg-[#F1F6F4] disabled:text-[#6D898A] disabled:cursor-not-allowed",
              error
                ? "border-[#B76648] focus:border-[#B76648] focus:ring-[#B76648]/20 bg-[#FFF0E7]/20"
                : "border-[#E7EEEB] hover:border-[#147A77]/50",
              startIcon ? "ps-10" : "ps-3.5",
              endIcon ? "pe-10" : "pe-3.5",
              className
            )}
            {...props}
          />
          {endIcon && (
            <div className="absolute end-3 flex items-center text-[#6D898A]">
              {endIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[#B76648] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-xs text-[#456A6D]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
