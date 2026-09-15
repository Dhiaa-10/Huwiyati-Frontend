import React from "react";
import { cn } from "@/lib/utils";

export interface HwyatiLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function HwyatiLogo({
  className,
  size = 56,
  showText = true,
}: HwyatiLogoProps) {
  return (
    <div className={cn("inline-flex items-center gap-3 select-none", className)}>
      {/* Fingerprint Emblem with Border and Soft Shadow */}
      <div
        style={{ width: size, height: size }}
        className="shrink-0 relative rounded-2xl bg-[#F9FAFB] border border-[#F3F4F6] shadow-sm flex items-center justify-center p-2"
      >
        <svg
          viewBox="0 0 68 68"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full text-[#00374e]"
        >
          <path
            d="M34 31.3334C34 37.1951 32.3183 42.6651 29.4117 47.2851M23.6783 43.8851L23.7683 43.7351C26.1059 40.0216 27.342 35.7213 27.3333 31.3334C27.3333 27.654 30.3206 24.6667 34 24.6667C37.6794 24.6667 40.6667 27.654 40.6667 31.3334C40.6667 33.0284 40.55 34.6984 40.3283 36.3334M36.7983 47.7401C37.827 45.6875 38.6596 43.5425 39.285 41.3334M45.6833 43.2201C46.7583 39.4434 47.3333 35.4551 47.3333 31.3334C47.3344 26.5693 44.7935 22.1666 40.668 19.7841C36.5424 17.4016 31.4591 17.4014 27.3333 19.7834M19 38.6067C20.0667 36.4084 20.6667 33.9401 20.6667 31.3334C20.6667 28.9051 21.3167 26.6284 22.45 24.6667"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col text-right">
          <span className="font-bold text-xl text-[#0F172A] tracking-tight leading-none mb-1 font-['IBM_Plex_Sans_Arabic']">
            هويتي
          </span>
          <span className="text-xs text-[#00374e] font-medium leading-tight">
            Hawiyati
          </span>
        </div>
      )}
    </div>
  );
}
