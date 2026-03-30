import * as React from "react"

import { cn } from "@/utils/index"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-[#00FF41] placeholder:text-[#00FF41]/40 selection:bg-[#00FF41]/30 selection:text-[#00FF41] dark:bg-[#001100]/50 border-[#00FF41]/20 h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        "focus-visible:border-[#00FF41] focus-visible:ring-[#00FF41]/20 focus-visible:ring-[3px]",
        "aria-invalid:ring-[#FF0040]/20 dark:aria-invalid:ring-[#FF0040]/40 aria-invalid:border-[#FF0040]",
        "text-[#00FF41] font-mono",
        className
      )}
      style={{
        background: 'rgba(0, 17, 0, 0.8)',
        boxShadow: 'inset 0 0 15px rgba(0, 255, 65, 0.05)',
      }}
      {...props}
    />
  )
}

export { Input }
