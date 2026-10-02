import React from "react";
import { cn } from "@/lib/utils";
import { AlertCircle, CheckCircle2, Info, AlertTriangle } from "lucide-react";

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "info" | "success" | "warning" | "danger";
  title?: string;
}

export function Alert({
  className,
  variant = "info",
  title,
  children,
  ...props
}: AlertProps) {
  const icons = {
    info: <Info className="w-5 h-5 text-[#437CA4] shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-[#126B58] shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#9A762D] shrink-0 mt-0.5" />,
    danger: <AlertCircle className="w-5 h-5 text-[#B76648] shrink-0 mt-0.5" />,
  };

  const variantStyles = {
    info: "bg-[#EAF4FB] border-[#BCE0F7] text-[#163D42]",
    success: "bg-[#E5F7EE] border-[#A8E2C7] text-[#163D42]",
    warning: "bg-[#FFF3D8] border-[#FCE1A8] text-[#163D42]",
    danger: "bg-[#FFF0E7] border-[#FACDC0] text-[#163D42]",
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 p-4 rounded-xl border text-sm",
        variantStyles[variant],
        className
      )}
      {...props}
    >
      {icons[variant]}
      <div className="flex-1">
        {title && <h5 className="font-semibold mb-1 leading-none">{title}</h5>}
        <div className="text-xs leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
