"use client"

import { cn } from "@workspace/ui/lib/utils"

interface LogoProps {
  className?: string
}

export function Logo({ className }: LogoProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("size-4", className)}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" fill="currentColor" stroke="none" opacity="0.12" />
      <path d="M7 5v14" />
      <path d="M7 5h4a4 4 0 0 1 0 8H7" />
      <path d="M12 13l4 6" />
    </svg>
  )
}
